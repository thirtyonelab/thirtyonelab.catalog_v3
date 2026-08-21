# Development Rules for ThirtyOne Lab

## Strict Deployment Constraints
- **DO NOT DEPLOY TO PRODUCTION**: Jangan sesekali deploy ke Cloudflare, Supabase, atau Vercel (production platforms). Walau bagaimanapun, memuat naik (push) kod ke GitHub dan/atau GitHub Pages adalah DIBENARKAN, memandangkan Cloudflare production terhubung dengan repo lama.
- Projek ini masih dalam proses **development** tempatan (local development).
- Jalankan dan uji perubahan secara lokal sahaja (contoh: `npm run dev` pada localhost).
- Jangan overwrite atau push database schema/production migration tanpa kebenaran eksplisit.

## Strict Scope & Execution Directives
- **Satu Programmer & Designer Terbaik & Bijak**: Sentiasa berfikir dengan tepat, berkesan, dan profesional.
- **FIKIR PAKAI OTAK (BERFIKIRAN LOGIK & KRITIKAL)**: Sentiasa pastikan setiap perubahan dan struktur kod itu 100% masuk akal secara logik dunia sebenar (contoh: pastikan elemen UI tertutup automatik tidak boleh ditekan/aktif). Jangan ulangi kesilapan *basic*!
- **Strictly Follow User Scope**: **JANGAN SESEKALI BUAT ATAU UBAH APA-APA YANG USER TAK SURUH**. Hanya buat dan laksanakan perubahan yang diminta secara eksplisit oleh user sahaja. Jangan ubah, tambah, atau sentuh mana-mana bahagian reka bentuk atau kod yang tidak diarahkan.
- **LOCKED HERO PAGE**: **HERO PAGE KINI 100% DI-LOCK PERMANENTLY**. Jangan sesekali ubah, sentuh, atau laras mana-mana bahagian Hero Section (`.hero-section`, `.hero-bg`, `.hero-content`, `.hero-subtitle`, `04-hero.css`) lagi.
- **LOCKED PHONE VIEW / FOKUS DESKTOP VIEW**: **PHONE VIEW KINI 100% DI-LOCK**. Jangan ubah lagi reka bentuk untuk paparan telefon bimbit (Phone View). Untuk fasa pembangunan sekarang, **HANYA FOKUS KEPADA PAPARAN DESKTOP (Desktop View)**.
- **LOCK UX (FUNGSI & UI SAHAJA)**: Dilarang keras mengubah struktur asas *User Experience* (UX). Hanya dibenarkan melakukan tetapan fungsi (*setting function/logic*) dan penambahbaikan *UI* (kosmetik/reka bentuk) sahaja.
- **VERIFY & PROCEED PROTOCOL**: Sebelum melaksanakan sebarang arahan atau kod, nyatakan kefahaman secara jelas tentang apa yang diminta. HANYA teruskan dengan pelaksanaan JIKA user berkata "proceed" atau memberi kebenaran. Sentiasa beri amaran (warning) jika arahan berpotensi menimbulkan masalah (seperti konflik teknikal atau reka bentuk) pada masa hadapan.
- **DESKTOP VS PHONE AWARENESS**: Projek ini menyokong 2 paparan peranti: Desktop dan Phone. Ejen mesti pandai membezakan antara dua peranti ini. Jika arahan mengatakan "desktop", lakukan perubahan KHUSUS untuk desktop sahaja. Jika arahan mengatakan "phone", lakukan KHUSUS untuk phone sahaja. Jika arahan mengatakan "dua-dua", barulah lakukan untuk kedua-duanya.
