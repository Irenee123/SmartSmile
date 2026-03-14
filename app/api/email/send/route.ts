import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to_email, user_name, link, result_data } = body;

    // Map email type to backend endpoint
    let endpoint = '';
    switch (type) {
      case 'welcome':
        endpoint = '/email/send-welcome';
        break;
      case 'password-reset':
        endpoint = '/email/send-password-reset';
        break;
      case 'password-changed':
        endpoint = '/email/send-password-changed';
        break;
      case 'verification':
        endpoint = '/email/send-verification';
        break;
      case 'screening-result':
        endpoint = '/email/send-screening-result';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Call Python backend
    const response = await fetch(`${PYTHON_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email,
        user_name,
        link,
        result_data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to send email' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Test credentials endpoint
export async function GET() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/email/test-credentials`);
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Email credentials test error:', error);
    return NextResponse.json(
      { error: 'Failed to test credentials' },
      { status: 500 }
    );
  }
}
