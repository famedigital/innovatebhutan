/**
 * 📱 WHATSAPP GROUP INVITE & QR CODE GENERATION
 * Generate invite links and QR codes for WhatsApp groups
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WhatsAppService } from '@/lib/integrations/whatsapp';
import { logClientAccess } from '@/lib/utils/auditLogger';

/**
 * POST - Generate invite link for WhatsApp group
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
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !whatsappGroup) {
      return NextResponse.json(
        { error: 'WhatsApp group not found' },
        { status: 404 }
      );
    }

    if (!whatsappGroup.groupId) {
      return NextResponse.json(
        { error: 'WhatsApp group not created yet. Please create the group first.' },
        { status: 400 }
      );
    }

    // Generate invite link via WhatsApp API
    const whatsappService = new WhatsAppService();
    const result = await whatsappService.generateInviteLink(whatsappGroup.groupId);

    if (!result.success || !result.inviteLink) {
      return NextResponse.json(
        { error: 'Failed to generate invite link', details: result.error },
        { status: 500 }
      );
    }

    // Update database with invite link
    const { data: updatedGroup, error: updateError } = await supabase
      .from('client_whatsapp_groups')
      .update({
        inviteLink: result.inviteLink,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', groupId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update WhatsApp group with invite link:', updateError);
    }

    // Log the action
    await logClientAccess({
      clientId: whatsappGroup.clientId,
      accessedBy: employee?.id || 0,
      action: 'create',
      success: true,
      newValues: {
        inviteLinkGenerated: true,
        inviteLink: result.inviteLink,
      },
    });

    return NextResponse.json({
      success: true,
      inviteLink: result.inviteLink,
      group: updatedGroup,
      message: 'Invite link generated successfully',
    });
  } catch (error) {
    console.error('Invite link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invite link', message: error.message },
      { status: 500 }
    );
  }
}
