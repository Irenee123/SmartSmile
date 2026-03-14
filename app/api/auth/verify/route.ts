import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    console.log('Verifying email:', email);

    // Use Supabase Admin REST API directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // First, list all users to find the one with this email
    const listResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    if (!listResponse.ok) {
      console.error('Failed to list users:', await listResponse.text());
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      );
    }

    const usersData = await listResponse.json();
    const user = usersData.users?.find((u: any) => u.email === email);

    if (!user) {
      console.error('User not found:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', user.id, 'email_confirmed_at:', user.email_confirmed_at);

    // Check if already confirmed
    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email was already verified'
      });
    }

    // Now update the user to confirm their email
    // Using the admin API to update user attributes
    const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_confirm: true
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update user:', errorText);
      return NextResponse.json(
        { error: 'Failed to confirm email' },
        { status: 500 }
      );
    }

    const updatedUser = await updateResponse.json();
    console.log('User updated:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
