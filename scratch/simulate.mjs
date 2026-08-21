import fs from 'fs';
import path from 'path';

// 1. Ambil catalog data dari fail JS
function readCatalogFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const startIndex = content.indexOf('[');
  const endIndex = content.lastIndexOf(']');
  const arrayString = content.substring(startIndex, endIndex + 1);
  return JSON.parse(arrayString.replace(/,(\s*[\]}])/g, '$1'));
}

const p2026 = readCatalogFile('src/js/catalog2026.js');
const p2025 = readCatalogFile('src/js/catalog2025.js');
const pEvent = readCatalogFile('src/js/catalogEvent.js');

// Uruskan sorting sama seperti app_v2.js
const products2026 = [...p2026].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));
const products2025 = [...p2025].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));
const productsEvent = [...pEvent];

const sortedCatalogs = [
  ...products2026,
  ...products2025,
  ...productsEvent
];

console.log("First 5 products in sorted catalog:");
sortedCatalogs.slice(0, 5).forEach((p, i) => {
  console.log(`Index ${i}: ID=${p.id}, Image=${p.image || (p.images ? p.images[0] : 'None')}`);
});
