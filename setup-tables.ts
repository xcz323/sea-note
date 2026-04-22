import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  // 1. Check if bottle_replies table exists by trying to query it
  console.log('Checking bottle_replies table...');
  const { error: checkErr } = await supabase.from('bottle_replies').select('id').limit(1);
  
  if (checkErr) {
    console.log('bottle_replies table does not exist or has issues:', checkErr.message);
    console.log('\n=== Please run this SQL in Supabase SQL Editor: ===\n');
    console.log(`
CREATE TABLE IF NOT EXISTS bottle_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bottle_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  owner_reaction text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add a foreign key to profiles for join queries
ALTER TABLE bottle_replies ADD CONSTRAINT fk_sender_profile
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Allow authenticated users to insert
ALTER TABLE bottle_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert replies" ON bottle_replies FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can read their replies" ON bottle_replies FOR SELECT USING (auth.uid() = receiver_id);
CREATE POLICY "Receiver can update reaction" ON bottle_replies FOR UPDATE USING (auth.uid() = receiver_id);
    `);
    console.log('\n=== End SQL ===\n');
  } else {
    console.log('✅ bottle_replies table exists!');
  }

  // 2. Check daily_quotes
  console.log('\nChecking daily_quotes table...');
  const { data: quotes, error: quotesErr } = await supabase.from('daily_quotes').select('*');
  
  if (quotesErr) {
    console.log('daily_quotes table issue:', quotesErr.message);
    console.log('\n=== Please run this SQL in Supabase SQL Editor: ===\n');
    console.log(`
CREATE TABLE IF NOT EXISTS daily_quotes (
  id serial PRIMARY KEY,
  content text NOT NULL,
  author text NOT NULL DEFAULT '匿名'
);
    `);
  } else {
    console.log(`✅ daily_quotes table exists with ${quotes?.length ?? 0} rows`);
  }

  // 3. Check if notes table has title column
  console.log('\nChecking notes.title column...');
  const { error: titleErr } = await supabase.from('notes').select('title').limit(1);
  if (titleErr) {
    console.log('notes.title column missing:', titleErr.message);
    console.log('Run: ALTER TABLE notes ADD COLUMN IF NOT EXISTS title text;');
  } else {
    console.log('✅ notes.title column exists');
  }

  // 4. Test creating a reply (dry run)
  console.log('\nAll checks done.');
}

setup();
