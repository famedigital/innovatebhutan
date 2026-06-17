/**
 * 🔐 GOOGLE OAUTH 2.0 CALLBACK HANDLER
 * Process the OAuth callback and store tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, refreshAccessToken } from '@/lib/integrations/googleDrive';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/admin/support/google-drive?error=oauth_failed', request.url)
      );
    }

    // Verify state parameter to prevent CSRF attacks
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('Invalid OAuth state parameter');
      return NextResponse.redirect(
        new URL('/admin/support/google-drive?error=invalid_state', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/support/google-drive?error=no_code', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);

    // Get current user from Supabase
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return NextResponse.redirect(
        new URL('/admin/support/google-drive?error=not_authenticated', request.url)
      );
    }

    // Store Google OAuth tokens in database
    try {
      // First, check if employee record exists for this user
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('authId', user.id)
        .single();

      if (employee) {
        // Update existing employee with new tokens
        const { error: updateError } = await supabase
          .from('employees')
          .update({
            googleAccessToken: tokens.accessToken,
            googleRefreshToken: tokens.refreshToken,
            googleTokenExpiry: tokens.expiryDate,
            googleConnectedAt: new Date().toISOString(),
            googleScopes: ['https://www.googleapis.com/auth/drive',
                          'https://www.googleapis.com/auth/drive.file',
                          'https://www.googleapis.com/auth/drive.metadata']
          })
          .eq('authId', user.id);

        if (updateError) {
          console.error('Failed to update Google tokens:', updateError);
          return NextResponse.redirect(
            new URL('/admin/support/google-drive?error=token_update_failed', request.url)
          );
        }

        console.log('Google tokens updated successfully for employee:', employee.id);
      } else {
        // Create employee record with OAuth tokens (if employee doesn't exist)
        const { error: insertError } = await supabase
          .from('employees')
          .insert({
            authId: user.id,
            profileId: null, // Will be set during profile creation
            googleAccessToken: tokens.accessToken,
            googleRefreshToken: tokens.refreshToken,
            googleTokenExpiry: tokens.expiryDate,
            googleConnectedAt: new Date().toISOString(),
            googleScopes: ['https://www.googleapis.com/auth/drive',
                          'https://www.googleapis.com/auth/drive.file',
                          'https://www.googleapis.com/auth/drive.metadata'],
            status: 'active',
            designation: 'Staff Member',
            availability: 'available'
          });

        if (insertError) {
          console.error('Failed to create employee with Google tokens:', insertError);
          return NextResponse.redirect(
            new URL('/admin/support/google-drive?error=employee_creation_failed', request.url)
          );
        }

        console.log('Employee record created with Google tokens for user:', user.id);
      }
    } catch (dbError) {
      console.error('Database error storing Google tokens:', dbError);
      return NextResponse.redirect(
        new URL('/admin/support/google-drive?error=database_error', request.url)
      );
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      new URL('/admin/support/google-drive?success=connected', request.url)
    );
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/support/google-drive?error=callback_failed', request.url)
    );
  }
}

/**
 * Refresh Google access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const tokens = await refreshAccessToken(refreshToken);

    // Update the access token in the database
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('employees')
        .update({
          googleAccessToken: tokens.accessToken,
          googleTokenExpiry: tokens.expiryDate,
        })
        .eq('authId', user.id);
    }

    return NextResponse.json({ success: true, accessToken: tokens.accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token', message: error.message },
      { status: 500 }
    );
  }
}
