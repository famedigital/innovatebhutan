/**
 * 📁 GOOGLE DRIVE FILE UPLOAD
 * Upload files to client Google Drive folders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, uploadFile, getValidAccessToken } from '@/lib/integrations/googleDrive';
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
        { error: 'Google Drive not connected. Please connect your Google Drive account first.' },
        { status: 400 }
      );
    }

    if (!employee.googleRefreshToken) {
      return NextResponse.json(
        { error: 'Google Drive connection incomplete. Please reconnect your account.' },
        { status: 400 }
      );
    }

    // Validate and refresh token if needed
    let validToken = employee.googleAccessToken;
    let tokenExpiry = employee.googleTokenExpiry;

    try {
      const tokenValidation = await getValidAccessToken(
        employee.googleAccessToken,
        employee.googleRefreshToken,
        employee.googleTokenExpiry
      );

      validToken = tokenValidation.accessToken;
      tokenExpiry = tokenValidation.expiryDate;

      // If token was refreshed, update it in the database
      if (tokenValidation.wasRefreshed) {
        await supabase
          .from('employees')
          .update({
            googleAccessToken: validToken,
            googleTokenExpiry: tokenExpiry,
          })
          .eq('authId', user.id);

        console.log('Google token refreshed and updated in database');
      }
    } catch (tokenError) {
      console.error('Token validation failed:', tokenError);
      return NextResponse.json(
        { error: 'Google Drive token expired or invalid. Please reconnect your account.' },
        { status: 401 }
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

    // Get Drive client with validated token
    const drive = await getDriveClient(validToken, employee.googleRefreshToken);

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
