import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Baca .env secara manual
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Ralat: Maklumat Supabase tidak dijumpai dalam .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Fungsi untuk baca dan parse fail JS data
function parseJsDataFile(filePath, variableName) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Ambil teks di dalam array [...]
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf(']');
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Gagal mencari array di dalam ${filePath}`);
  }
  const arrayString = content.substring(startIndex, endIndex + 1);
  
  // Parse sebagai JSON
  try {
    return JSON.parse(arrayString);
  } catch (err) {
    console.error(`Gagal parse JSON secara terus untuk ${filePath}. Cuba bersihkan...`);
    const cleaned = arrayString.replace(/,(\s*[\]}])/g, '$1');
    return JSON.parse(cleaned);
  }
}

async function seed() {
  console.log("Memulakan proses migrasi data ke Supabase...");
  
  try {
    const p2026 = parseJsDataFile('src/js/catalog2026.js', 'catalogProducts2026');
    const p2025 = parseJsDataFile('src/js/catalog2025.js', 'catalogProducts2025');
    const pEvent = parseJsDataFile('src/js/catalogEvent.js', 'catalogProductsEvent');
    const pSpecs = parseJsDataFile('src/js/catalogSpecs.js', 'catalogProductsSpecs');

    const allProducts = [...p2026, ...p2025, ...pEvent, ...pSpecs];
    console.log(`Jumlah produk dijumpai secara lokal: ${allProducts.length}`);

    // Petakan ke struktur table Supabase dan buang duplikasi ID jika ada
    const uniqueProducts = [];
    const seenIds = new Set();
    for (const p of allProducts) {
      if (!p.id) continue;
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniqueProducts.push(p);
      } else {
        console.warn(`Mengabaikan ID pendua: ${p.id}`);
      }
    }

    const dbRows = uniqueProducts.map(p => ({
      id: p.id,
      edition: p.edition,
      image: p.image || '',
      images: p.images || null,
      is_new: p.isNew || false,
      no_slide: p.noSlide || false
    }));

    // Masukkan data dalam kelompok (chunks of 100) untuk elak timeout
    const chunkSize = 100;
    for (let i = 0; i < dbRows.length; i += chunkSize) {
      const chunk = dbRows.slice(i, i + chunkSize);
      console.log(`Memasukkan baris ${i + 1} hingga ${Math.min(i + chunkSize, dbRows.length)}...`);
      
      const { error } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        throw error;
      }
    }

    console.log("Migrasi data ke Supabase BERJAYA sepenuhnya! 🎉");
  } catch (err) {
    console.error("Ralat semasa migrasi data:", err);
  }
}

seed();
