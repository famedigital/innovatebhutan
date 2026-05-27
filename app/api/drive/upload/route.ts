/**
 * 📁 GOOGLE DRIVE FILE UPLOAD
 * Upload files to client Google Drive folders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, uploadFile } from '@/lib/integrations/googleDrive';
import { createClient } from '@/utils/supabase/server';
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    const folderType = formData.get('folderType') as string; // credentials, configs, documents, images, exports
    const description = formData.get('description') as string;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: 'File and clientId are required' },
        { status: 400 }
      );
    }

    // Get client data to find Google Drive folder
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*, googleDriveFolderId')
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

    // Determine folder ID based on folder type
    // In production, you'd store these folder IDs in the database
    let targetFolderId = client.googleDriveFolderId;

    // Upload file to Google Drive
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadFile(
      drive,
      fileBuffer,
      file.name,
      targetFolderId,
      file.type,
      description || `Uploaded by ${employee.name}`
    );

    // Store file metadata in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('google_drive_files')
      .insert({
        clientId: parseInt(clientId),
        fileName: file.name,
        fileType: folderType || 'other',
        googleDriveFileId: uploadResult.fileId,
        googleDriveFolderId: targetFolderId,
        webViewLink: uploadResult.webViewLink,
        webContentLink: uploadResult.webContentLink,
        fileSize: file.size,
        mimeType: file.type,
        description: description,
        uploadedBy: employee.id,
      })
      .select()
      .single();

    if (fileError) {
      console.error('Failed to store file metadata:', fileError);
    }

    // Log the upload
    await logClientAccess({
      clientId: parseInt(clientId),
      accessedBy: employee.id,
      action: 'upload',
      success: true,
      metadata: {
        fileName: file.name,
        fileId: uploadResult.fileId,
        folderType,
      },
    });

    return NextResponse.json({
      success: true,
      file: fileRecord,
      uploadResult,
    });
  } catch (error) {
    console.error('Google Drive upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get list of files for a client
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
    const fileType = searchParams.get('fileType');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('google_drive_files')
      .select('*')
      .eq('clientId', clientId);

    if (fileType) {
      query = query.eq('fileType', fileType);
    }

    const { data: files, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('Failed to fetch files:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files', message: error.message },
      { status: 500 }
    );
  }
}
