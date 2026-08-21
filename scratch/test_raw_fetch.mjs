import fs from 'fs';
import path from 'path';

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

async function testFetch() {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/products?select=*`;
  console.log("Fetching from REST URL:", url);
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    console.log("Response Status:", res.status);
    console.log("Response Headers:", Object.fromEntries(res.headers.entries()));
    const body = await res.json();
    console.log("Response Body (rows count):", body.length);
    if (body.length > 0) {
      console.log("Sample:", body[0]);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
testFetch();
