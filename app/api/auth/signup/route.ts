import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use service role key to create user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create user with email_confirm: false (user must verify email first)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User must verify email before logging in
      user_metadata: {
        created_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Admin signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Generate a verification token for welcome email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Send welcome email via our backend
    let emailSent = false;
    try {
      const emailResponse = await fetch(`${process.env.PYTHON_API_URL || 'http://localhost:8000'}/email/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: email,
          user_name: email.split('@')[0],
          link: verifyLink
        })
      });
      
      if (emailResponse.ok) {
        emailSent = true;
        console.log('Welcome email sent successfully');
      } else {
        console.error('Failed to send welcome email:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    // User cannot login until they verify their email
    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email
      },
      message: 'Account created! Please check your email to verify your account before logging in.',
      needsVerification: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
