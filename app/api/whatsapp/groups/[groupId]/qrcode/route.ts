/**
 * 📱 WHATSAPP GROUP QR CODE GENERATION
 * Generate QR codes for WhatsApp groups using Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v2 as cloudinary } from 'cloudinary';
import { logClientAccess } from '@/lib/utils/auditLogger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST - Generate QR code for WhatsApp group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('authId', user.id)
      .single();

    const groupId = parseInt(params.groupId);

    // Get WhatsApp group data
    const { data: whatsappGroup, error: groupError } = await supabase
      .from('client_whatsapp_groups')
      .select(
        `
        *,
        client:clients(*)
      `
      )
      .eq('id', groupId)
      .single();

    if (groupError || !whatsappGroup) {
      return NextResponse.json(
        { error: 'WhatsApp group not found' },
        { status: 404 }
      );
    }

    if (!whatsappGroup.inviteLink) {
      return NextResponse.json(
        { error: 'Please generate an invite link first' },
        { status: 400 }
      );
    }

    // Generate QR code using Cloudinary
    const qrCodeUrl = await generateWhatsAppGroupQRCode(
      whatsappGroup.inviteLink,
      whatsappGroup.client.name,
      whatsappGroup.groupId
    );

    // Update database with QR code URL
    const { data: updatedGroup, error: updateError } = await supabase
      .from('client_whatsapp_groups')
      .update({
        qrCode: qrCodeUrl,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update WhatsApp group with QR code:', updateError);
    }

    // Log the action
    await logClientAccess({
      clientId: whatsappGroup.clientId,
      accessedBy: employee?.id || 0,
      action: 'create',
      success: true,
      newValues: {
        qrCodeGenerated: true,
        qrCodeUrl: qrCodeUrl,
      },
    });

    return NextResponse.json({
      success: true,
      qrCodeUrl: qrCodeUrl,
      group: updatedGroup,
      message: 'QR code generated successfully',
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate QR code using Cloudinary
 */
async function generateWhatsAppGroupQRCode(
  inviteLink: string,
  clientName: string,
  groupId: string
): Promise<string> {
  try {
    // Use a QR code generation API
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}`;

    // Upload QR code to Cloudinary with customizations
    const uploadResult = await cloudinary.uploader.upload(qrCodeApiUrl, {
      folder: `whatsapp_groups/${groupId}`,
      public_id: `qrcode_${Date.now()}`,
      transformation: [
        { width: 300, height: 300, crop: 'fill' },
        { overlay: {
          public_id: 'text:heavy',
          text: `${clientName}\\nWhatsApp Group`,
          font_family: 'Arial',
          font_size: 24,
          font_weight: 'bold',
          color: '#ffffff',
          gravity: 'south',
          y: 20,
        }},
        { overlay: {
          public_id: 'text:heavy',
          text: 'Scan to Join',
          font_family: 'Arial',
          font_size: 18,
          font_weight: 'normal',
          color: '#ffff00',
          gravity: 'south',
          y: -20,
        }},
      ],
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error('Cloudinary QR code generation error:', error);
    // Fallback to QR code API URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}`;
  }
}

/**
 * Generate bulk QR codes for multiple WhatsApp groups
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientIds = searchParams.get('clientIds');

    if (!clientIds) {
      return NextResponse.json(
        { error: 'clientIds parameter is required' },
        { status: 400 }
      );
    }

    const clientIdArray = clientIds.split(',').map(id => parseInt(id.trim()));

    // Get all WhatsApp groups for the specified clients
    const { data: whatsappGroups, error: groupsError } = await supabase
      .from('client_whatsapp_groups')
      .select('*, client:clients(*)')
      .in('clientId', clientIdArray)
      .eq('isActive', true);

    if (groupsError) {
      console.error('Failed to fetch WhatsApp groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch WhatsApp groups' },
        { status: 500 }
      );
    }

    // Generate QR codes for all groups
    const qrCodeResults = [];

    for (const group of whatsappGroups || []) {
      if (group.inviteLink) {
        try {
          const qrCodeUrl = await generateWhatsAppGroupQRCode(
            group.inviteLink,
            group.client.name,
            group.groupId
          );

          // Update database
          await supabase
            .from('client_whatsapp_groups')
            .update({ qrCode: qrCodeUrl })
            .eq('id', group.id);

          qrCodeResults.push({
            groupId: group.id,
            clientId: group.clientId,
            groupName: group.groupName,
            qrCodeUrl: qrCodeUrl,
            success: true,
          });
        } catch (error) {
          qrCodeResults.push({
            groupId: group.id,
            clientId: group.clientId,
            groupName: group.groupName,
            error: error.message,
            success: false,
          });
        }
      } else {
        qrCodeResults.push({
          groupId: group.id,
          clientId: group.clientId,
          groupName: group.groupName,
          error: 'No invite link generated',
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: qrCodeResults,
      message: `Processed ${qrCodeResults.length} WhatsApp groups`,
    });
  } catch (error) {
    console.error('Bulk QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes', message: error.message },
      { status: 500 }
    );
  }
}
