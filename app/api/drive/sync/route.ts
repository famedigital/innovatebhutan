/**
 * 🔄 GOOGLE DRIVE SYNC
 * Sync Google Drive files with database metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, searchClientFiles } from '@/lib/integrations/googleDrive';
import { createClient } from '@/lib/supabase/server';
import { logClientAccess } from '@/lib/utils/auditLogger';

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

    const body = await request.json();
    const { clientId, folderId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

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

    // Use provided folderId or client's default folder
    const targetFolderId = folderId || client.googleDriveFolderId;

    if (!targetFolderId) {
      return NextResponse.json(
        { error: 'No Google Drive folder configured for this client' },
        { status: 400 }
      );
    }

    // Get Drive client
    const drive = await getDriveClient(employee.googleAccessToken);

    // Search for files in the client's folder
    const files = await searchClientFiles(drive, targetFolderId);

    // Sync files to database
    let syncedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const file of files) {
      try {
        // Check if file already exists in database
        const { data: existingFile } = await supabase
          .from('google_drive_files')
          .select('*')
          .eq('googleDriveFileId', file.id)
          .single();

        if (existingFile) {
          // Update existing file
          const { error: updateError } = await supabase
            .from('google_drive_files')
            .update({
              fileName: file.name,
              fileSize: file.size || 0,
              mimeType: file.mimeType,
              webViewLink: file.webViewLink,
              webContentLink: file.webContentLink,
              updatedAt: new Date(),
            })
            .eq('googleDriveFileId', file.id);

          if (!updateError) {
            updatedCount++;
          } else {
            errors.push({ file: file.name, error: updateError.message });
          }
        } else {
          // Insert new file
          const { error: insertError } = await supabase
            .from('google_drive_files')
            .insert({
              clientId: clientId,
              fileName: file.name,
              fileType: 'other', // You might want to determine this from folder structure
              googleDriveFileId: file.id,
              googleDriveFolderId: targetFolderId,
              webViewLink: file.webViewLink,
              webContentLink: file.webContentLink,
              fileSize: file.size || 0,
              mimeType: file.mimeType,
              uploadedBy: employee.id,
            });

          if (!insertError) {
            syncedCount++;
          } else {
            errors.push({ file: file.name, error: insertError.message });
          }
        }
      } catch (error) {
        errors.push({ file: file.name, error: error.message });
      }
    }

    // Log the sync operation
    await logClientAccess({
      clientId: clientId,
      accessedBy: employee.id,
      action: 'export',
      success: true,
      metadata: {
        operation: 'drive_sync',
        syncedCount,
        updatedCount,
        errorCount: errors.length,
        totalFiles: files.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      stats: {
        totalFiles: files.length,
        syncedCount,
        updatedCount,
        errorCount: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Google Drive sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get sync status for a client
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
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Get file count for client
    const { data: files, error } = await supabase
      .from('google_drive_files')
      .select('*')
      .eq('clientId', clientId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to get sync status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFiles: files?.length || 0,
        lastSync: files?.length > 0 ? Math.max(...files.map(f => new Date(f.updatedAt).getTime())) : null,
      },
    });
  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', message: error.message },
      { status: 500 }
    );
  }
}
