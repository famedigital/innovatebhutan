/**
 * 🔐 GOOGLE OAUTH 2.0 INITIATION
 * Start the Google Drive authorization flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/integrations/googleDrive';
import { generateStateParameter } from '@/lib/utils/encryption';

export async function GET(request: NextRequest) {
  try {
    // Generate secure state parameter to prevent CSRF attacks
    const state = generateStateParameter();

    // Store state in session/cookie for verification in callback
    // In production, this should be stored in a secure session or database
    const response = NextResponse.redirect(generateAuthUrl(state));

    // Set state as an httpOnly cookie for security
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth', message: error.message },
      { status: 500 }
    );
  }
}
