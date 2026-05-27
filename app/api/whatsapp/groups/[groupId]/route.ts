/**
 * 📱 WHATSAPP GROUP OPERATIONS API
 * Manage individual WhatsApp groups (invite links, QR codes, participants)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WhatsAppService, formatPhoneNumber } from '@/lib/integrations/whatsapp';
import { logClientAccess } from '@/lib/utils/auditLogger';

/**
 * GET - Get WhatsApp group details
 */
export async function GET(
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

    const groupId = parseInt(params.groupId);

    // Get group data
    const { data: whatsappGroup, error: groupError } = await supabase
      .from('client_whatsapp_groups')
      .select(
        `
        *,
        client:clients(*),
        admin:employees(*),
        focalPerson:employees(*)
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

    // Get recent messages for this group
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('whatsappGroupId', groupId)
      .order('sentAt', { ascending: false })
      .limit(20);

    // Get recent problems solved
    const { data: problems } = await supabase
      .from('problems')
      .select('*')
      .eq('clientId', whatsappGroup.clientId)
      .eq('status', 'resolved')
      .order('resolvedAt', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      group: whatsappGroup,
      recentMessages: communications || [],
      recentProblems: problems || [],
    });
  } catch (error) {
    console.error('WhatsApp group fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp group', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update WhatsApp group details
 */
export async function PUT(
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
    const body = await request.json();

    // Get current group data
    const { data: currentGroup, error: groupError } = await supabase
      .from('client_whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !currentGroup) {
      return NextResponse.json(
        { error: 'WhatsApp group not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.groupName !== undefined) updateData.groupName = body.groupName;
    if (body.groupDescription !== undefined) updateData.groupDescription = body.groupDescription;
    if (body.adminId !== undefined) updateData.adminId = body.adminId;
    if (body.focalPersonId !== undefined) updateData.focalPersonId = body.focalPersonId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.lastProblemSolved !== undefined) updateData.lastProblemSolved = body.lastProblemSolved;

    // Update group
    const { data: updatedGroup, error: updateError } = await supabase
      .from('client_whatsapp_groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update WhatsApp group:', updateError);
      return NextResponse.json(
        { error: 'Failed to update WhatsApp group' },
        { status: 500 }
      );
    }

    // Log the update
    await logClientAccess({
      clientId: currentGroup.clientId,
      accessedBy: employee?.id || 0,
      action: 'update',
      success: true,
      oldValues: currentGroup,
      newValues: updateData,
    });

    return NextResponse.json({
      success: true,
      group: updatedGroup,
      message: 'WhatsApp group updated successfully',
    });
  } catch (error) {
    console.error('WhatsApp group update error:', error);
    return NextResponse.json(
      { error: 'Failed to update WhatsApp group', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete/deactivate WhatsApp group
 */
export async function DELETE(
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

    // Get current group data
    const { data: currentGroup, error: groupError } = await supabase
      .from('client_whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !currentGroup) {
      return NextResponse.json(
        { error: 'WhatsApp group not found' },
        { status: 404 }
      );
    }

    // Deactivate group (soft delete)
    const { error: deleteError } = await supabase
      .from('client_whatsapp_groups')
      .update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (deleteError) {
      console.error('Failed to deactivate WhatsApp group:', deleteError);
      return NextResponse.json(
        { error: 'Failed to deactivate WhatsApp group' },
        { status: 500 }
      );
    }

    // Log the deletion
    await logClientAccess({
      clientId: currentGroup.clientId,
      accessedBy: employee?.id || 0,
      action: 'delete',
      success: true,
      oldValues: currentGroup,
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp group deactivated successfully',
    });
  } catch (error) {
    console.error('WhatsApp group deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate WhatsApp group', message: error.message },
      { status: 500 }
    );
  }
}
