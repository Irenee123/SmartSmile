import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_JWT_SECRET;

export async function POST() {
  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    );
  }

  // Admin client to bypass RLS
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check if table exists by trying to select from it
    const { error: checkError } = await supabaseAdmin
      .from('clinics')
      .select('id')
      .limit(1);

    // If no error, table already exists
    if (!checkError) {
      return NextResponse.json({ 
        message: 'Clinics table already exists',
        status: 'existing'
      });
    }

    // Try alternative: Insert sample data to trigger table creation
    // In production you'd want to set up the table manually in Supabase
    return NextResponse.json({
      message: 'Please create the clinics table in Supabase Dashboard with SQL Editor',
      sql: `
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT NOT NULL,
  website TEXT,
  hours TEXT DEFAULT 'Mon-Fri: 8AM-5PM',
  services TEXT[] DEFAULT '{}',
  partnership TEXT DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read clinics" ON clinics FOR SELECT USING (true);
      `
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize clinics table' },
      { status: 500 }
    );
  }
}
