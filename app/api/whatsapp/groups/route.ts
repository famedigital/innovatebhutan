/**
 * 📱 WHATSAPP GROUP MANAGEMENT API
 * Create and manage WhatsApp groups for 300+ clients
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WhatsAppService, formatPhoneNumber } from '@/lib/integrations/whatsapp';
import { logClientAccess } from '@/lib/utils/auditLogger';

/**
 * GET - List WhatsApp groups (filtered by user role)
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

    // Get user data
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('authId', user.id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const isActive = searchParams.get('isActive');

    let query = supabase
      .from('client_whatsapp_groups')
      .select(
        `
        *,
        client:clients(*),
        admin:employees(*),
        focalPerson:employees(*)
      `
      );

    // Role-based filtering
    if (employee.role !== 'SUPERADMIN' && employee.role !== 'ADMIN') {
      // Support staff see only groups for their assigned clients
      if (employee.supportGroupId) {
        const { data: clientMappings } = await supabase
          .from('client_support_group_mapping')
          .select('clientId')
          .eq('supportGroupId', employee.supportGroupId)
          .eq('isActive', true);

        const clientIds = clientMappings?.map(m => m.clientId) || [];
        query = query.in('clientId', clientIds.length > 0 ? clientIds : [0]);
      } else {
        // No support group assigned, return empty
        return NextResponse.json({ success: true, groups: [] });
      }
    }

    if (clientId) {
      query = query.eq('clientId', clientId);
    }

    if (isActive !== null) {
      query = query.eq('isActive', isActive === 'true');
    }

    const { data: groups, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('Failed to fetch WhatsApp groups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch WhatsApp groups' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('WhatsApp groups fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp groups', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new WhatsApp group for a client
 */
export async function POST(request: NextRequest) {
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
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('authId', user.id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      clientId,
      groupName,
      groupDescription,
      adminId,
      focalPersonId,
      autoCreate = false, // If true, create via WhatsApp API
    } = body;

    if (!clientId || !groupName) {
      return NextResponse.json(
        { error: 'clientId and groupName are required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    let groupId = null;
    let inviteLink = null;
    let qrCodeUrl = null;

    // Create WhatsApp group via API if requested
    if (autoCreate) {
      const whatsappService = new WhatsAppService();
      const participants = [];

      // Add focal person and admin to initial participants
      if (focalPersonId) {
        const { data: fp } = await supabase
          .from('employees')
          .select('whatsappNumber')
          .eq('id', focalPersonId)
          .single();

        if (fp?.whatsappNumber) {
          participants.push(formatPhoneNumber(fp.whatsappNumber));
        }
      }

      if (adminId) {
        const { data: admin } = await supabase
          .from('employees')
          .select('whatsappNumber')
          .eq('id', adminId)
          .single();

        if (admin?.whatsappNumber) {
          participants.push(formatPhoneNumber(admin.whatsappNumber));
        }
      }

      // Add client contact number
      if (client.contactNumber) {
        participants.push(formatPhoneNumber(client.contactNumber));
      }

      const groupResult = await whatsappService.createGroup(groupName, participants);

      if (groupResult.success && groupResult.groupId) {
        groupId = groupResult.groupId;
        inviteLink = groupResult.inviteLink;

        // Generate QR code
        if (inviteLink) {
          const qrResult = await whatsappService.generateQRCode(inviteLink, clientId, groupName);
          if (qrResult.success) {
            qrCodeUrl = qrResult.qrCodeUrl;
          }
        }
      }
    }

    // Create database record
    const { data: whatsappGroup, error: insertError } = await supabase
      .from('client_whatsapp_groups')
      .insert({
        clientId,
        groupId,
        groupName,
        groupDescription,
        qrCode: qrCodeUrl,
        inviteLink,
        adminId,
        focalPersonId,
        isActive: true,
        lastActivityAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create WhatsApp group record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create WhatsApp group' },
        { status: 500 }
      );
    }

    // Log the creation
    await logClientAccess({
      clientId,
      accessedBy: employee.id,
      action: 'create',
      success: true,
      newValues: {
        groupName,
        adminId,
        focalPersonId,
        autoCreated: autoCreate,
      },
    });

    return NextResponse.json({
      success: true,
      group: whatsappGroup,
      message: autoCreate
        ? 'WhatsApp group created successfully'
        : 'WhatsApp group record created (manual creation required)',
    });
  } catch (error) {
    console.error('WhatsApp group creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create WhatsApp group', message: error.message },
      { status: 500 }
    );
  }
}
