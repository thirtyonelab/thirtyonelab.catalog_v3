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

async function list() {
  console.log("Listing buckets in Supabase Storage...");
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Error listing buckets:", error);
  } else {
    console.log("Success! Active buckets:", buckets.map(b => ({ id: b.id, name: b.name, public: b.public })));
  }
}
list();
