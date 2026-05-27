/**
 * 📤 GOOGLE DRIVE CLIENT DATA EXPORT
 * Export comprehensive client data to Google Drive
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, exportClientData } from '@/lib/integrations/googleDrive';
import { createClient } from '@/lib/supabase/server';
import { logClientAccess } from '@/lib/utils/auditLogger';

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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

    // Get user data with Google tokens
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('authId', user.id)
      .single();

    if (employeeError || !employee?.googleAccessToken) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      );
    }

    const clientId = parseInt(params.clientId);
    const body = await request.json();
    const { dataType = 'all' } = body; // 'all', 'credentials', 'communications', 'problems'

    // Get client data
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

    // Get Drive client
    const drive = await getDriveClient(employee.googleAccessToken);

    // Gather client data based on dataType
    let exportData: any = { client };

    if (dataType === 'all' || dataType === 'credentials') {
      const { data: credentials } = await supabase
        .from('client_credentials')
        .select('*')
        .eq('clientId', clientId);

      exportData.credentials = credentials || [];
    }

    if (dataType === 'all' || dataType === 'whatsapp') {
      const { data: whatsappGroups } = await supabase
        .from('client_whatsapp_groups')
        .select('*')
        .eq('clientId', clientId);

      exportData.whatsappGroups = whatsappGroups || [];
    }

    if (dataType === 'all' || dataType === 'problems') {
      const { data: problems } = await supabase
        .from('problems')
        .select('*')
        .eq('clientId', clientId);

      exportData.problems = problems || [];
    }

    if (dataType === 'all' || dataType === 'communications') {
      const { data: communications } = await supabase
        .from('communications')
        .select('*')
        .eq('clientId', clientId);

      exportData.communications = communications || [];
    }

    if (dataType === 'all' || dataType === 'amc') {
      const { data: amcContracts } = await supabase
        .from('amc_contracts')
        .select('*')
        .eq('clientId', clientId);

      exportData.amcContracts = amcContracts || [];
    }

    if (dataType === 'all' || dataType === 'bot') {
      const { data: botConversations } = await supabase
        .from('bot_conversations')
        .select('*')
        .eq('clientId', clientId);

      exportData.botConversations = botConversations || [];
    }

    if (dataType === 'all') {
      const { data: supportGroups } = await supabase
        .from('client_support_group_mapping')
        .select(
          `
          *,
          support_group: support_groups(*)
        `
        )
        .eq('clientId', clientId);

      exportData.supportGroups = supportGroups || [];
    }

    // Add export metadata
    exportData.exportMetadata = {
      exportedAt: new Date().toISOString(),
      exportedBy: employee.name,
      exportedByRole: employee.role,
      dataType: dataType,
      version: '1.0',
    };

    // Get or create export folder in Google Drive
    let exportFolderId = client.googleDriveFolderId;

    // Export to Google Drive
    const exportLink = await exportClientData(
      drive,
      clientId,
      client.name,
      exportFolderId,
      dataType as any,
      exportData
    );

    // Log the export
    await logClientAccess({
      clientId: clientId,
      accessedBy: employee.id,
      action: 'export',
      success: true,
      metadata: {
        dataType: dataType,
        exportLink: exportLink,
        dataSize: JSON.stringify(exportData).length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Client data exported successfully',
      exportLink,
      dataType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Client data export error:', error);
    return NextResponse.json(
      { error: 'Export failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get export history for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
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

    const clientId = parseInt(params.clientId);

    // Get audit logs for exports
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entityType', 'CLIENT')
      .eq('entityId', clientId)
      .eq('action', 'EXPORT')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to get export history:', error);
      return NextResponse.json(
        { error: 'Failed to get export history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      exports: auditLogs || [],
    });
  } catch (error) {
    console.error('Export history error:', error);
    return NextResponse.json(
      { error: 'Failed to get export history', message: error.message },
      { status: 500 }
    );
  }
}
