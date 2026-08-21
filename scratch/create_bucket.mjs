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

async function create() {
  console.log("Trying to create bucket 'product-image'...");
  const { data, error } = await supabase.storage.createBucket('product-image', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/*']
  });
  if (error) {
    console.error("Error creating bucket:", error);
  } else {
    console.log("Success! Bucket created:", data);
  }
}
create();
