/**
 * 📁 GOOGLE DRIVE FILE DOWNLOAD
 * Download files from Google Drive
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, downloadFile } from '@/lib/integrations/googleDrive';
import { createClient } from '@/lib/supabase/server';
import { logClientAccess } from '@/lib/utils/auditLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
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

    const fileId = params.fileId;

    // Get file metadata from database
    const { data: fileRecord, error: fileError } = await supabase
      .from('google_drive_files')
      .select('*')
      .eq('googleDriveFileId', fileId)
      .single();

    if (fileError || !fileRecord) {
      return NextResponse.json(
        { error: 'File not found in database' },
        { status: 404 }
      );
    }

    // Get Drive client
    const drive = await getDriveClient(employee.googleAccessToken);

    // Download file from Google Drive
    const downloadResult = await downloadFile(drive, fileId);

    // Log the download
    await logClientAccess({
      clientId: fileRecord.clientId,
      accessedBy: employee.id,
      action: 'view',
      success: true,
      metadata: {
        fileName: downloadResult.fileName,
        fileId: fileId,
        fileSize: downloadResult.buffer.length,
      },
    });

    // Return file as response
    return new NextResponse(downloadResult.buffer, {
      headers: {
        'Content-Type': downloadResult.mimeType,
        'Content-Disposition': `attachment; filename="${downloadResult.fileName}"`,
        'Content-Length': downloadResult.buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Google Drive download error:', error);
    return NextResponse.json(
      { error: 'Download failed', message: error.message },
      { status: 500 }
    );
  }
}
