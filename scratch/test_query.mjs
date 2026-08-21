import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Baca .env
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log("Querying Supabase database...");
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('edition', 'prod-2026')
    .order('id', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Success! Total rows fetched:", data.length);
    console.log("Rows:", data);
  }
}
test();
