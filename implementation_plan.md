# Rekaan Footer Premium V3 (Landing Page)

Memandangkan reka bentuk V3 Hub ini berkonsepkan premium dan elegan (gelap/kemas), *footer* putih sedia ada (.site-footer) nampak tidak sepadan dan 'terputus' dari rekaan keseluruhan. Saya mencadangkan kita bina satu *footer* khas untuk Landing Page V3 ini sahaja.

## Open Questions
- Adakah anda mahu saya alihkan ikon media sosial (TikTok, IG, FB, WhatsApp) yang ada di bawah butang utama sekarang terus masuk ke dalam *footer* baru ini supaya lebih kemas?
- Adakah anda perlukan pautan tambahan seperti 'Terms & Conditions' atau 'Privacy Policy'?

## Proposed Changes

### Komponen Baru (index.html)
- **[NEW]** <footer class="v3-hub-footer"> akan diletakkan di bahagian paling bawah Landing Page (di dalam .v3-hub-section).
- Ia akan mengandungi:
  1. Logo ThirtyOne Lab versi kecil (monochrome atau asal).
  2. Susunan ikon media sosial (jika dialihkan).
  3. Teks hak cipta (Copyright 2026).
  4. Slogan "Wear With Pride.dY~S".

### CSS Baru (19-v3-mobile-hub.css)
- **[NEW]** Gaya CSS untuk .v3-hub-footer.
- Latar belakang gelap (secocok dengan tema V3), teks berwarna kelabu cair/putih, dan garisan sempadan (border) atas yang halus supaya nampak eksklusif.
- Menyorokkan (hide) .site-footer yang lama secara automatik pada paparan telefon bimbit supaya tidak berlaku pertindihan.

## Verification Plan
- Semak paparan di peranti mudah alih.
- Pastikan *footer* baru nampak bersepadu dengan Landing Page dan tidak mengganggu fungsi butang-butang lain.
