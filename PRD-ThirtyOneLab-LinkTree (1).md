# PRD — ThirtyOne Lab Link Tree

## 1. Ringkasan Projek

Membina satu halaman "link tree" (senarai pautan) untuk ThirtyOne Lab yang mengumpulkan semua saluran digital brand (website catalog, WhatsApp order, dan sosial media) dalam satu laman ringkas — sesuai diletakkan sebagai satu-satu link dalam bio Instagram/TikTok.

## 2. Objektif

- Sediakan satu destinasi pautan yang kemas untuk semua saluran ThirtyOne Lab
- Selaraskan identiti visual dengan website catalog sedia ada (`31lab.pages.dev`)
- Struktur ringan, cepat dimuatkan, mudah diselenggara (static HTML)

## 3. Skop

**Dalam skop:**
- Satu halaman statik (HTML/CSS)
- Senarai pautan: Website Catalog, WhatsApp Order, Instagram, TikTok, Facebook
- Logo dan background custom (disediakan oleh klien — imej)
- Icon sosial media custom (disediakan oleh klien — imej, bukan emoji/icon generik)

**Luar skop:**
- Backend/database (tiada logik dinamik diperlukan)
- Analytics/tracking (boleh ditambah kemudian jika perlu)

## 4. Hosting & Struktur URL

- Dihoskan di bawah domain sedia ada: `31lab.pages.dev`
- Cadangan laluan: `31lab.pages.dev/links`
- Tiada sub-domain baru diperlukan (domain `.pages.dev` adalah milik Cloudflare, bukan domain sendiri — sub-domain custom hanya boleh dibuat jika beli domain sendiri seperti `thirtyonelab.com`)
- Repo GitHub lokal (main project, sama dengan website catalog): `C:\Users\User\Documents\GitHub\thirtyonelab.catalog_v3`
- Struktur fail dalam repo:

```
thirtyonelab.catalog_v3/
├── index.html          → 31lab.pages.dev
├── about.html          → 31lab.pages.dev/about
├── contact.html        → 31lab.pages.dev/contact
└── links/
    └── index.html      → 31lab.pages.dev/links   ← link tree
```

- Deploy flow: tambah fail dalam folder `links/`, commit & push ke GitHub → Cloudflare Pages auto build & deploy

## 5. Keperluan Reka Bentuk

Rujukan rasmi: Brand Identity System ThirtyOne Lab

| Elemen | Keperluan |
|---|---|
| Font heading | **Montserrat** (Bold 700 / Heavy 800 / Black 900) |
| Font sub-text/body | **Inter** (400/500/600) |
| Warna — Boutique Red | `#C51B27` (primary — aksen, teks link hover, logo bg) |
| Warna — ThirtyOne Black | `#111111` (teks utama) |
| Warna — Warm Sand | `#FAF9F6` (background utama) |
| Logo | Disediakan oleh klien (imej) — placeholder buat masa ini |
| Background | Disediakan oleh klien (imej) — placeholder buat masa ini |
| Icon pautan | Disediakan oleh klien (imej custom) — **BUKAN emoji, bukan icon generik/stock** |
| Layout | Kad pautan menegak (vertical stack), responsive mobile-first |

## 6. Senarai Pautan (Content)

1. Website Catalog Rasmi → `https://31lab.pages.dev`
2. Order via WhatsApp → `https://wa.me/601125614436`
3. Instagram → `https://www.instagram.com/thirtyonelab`
4. TikTok → `https://www.tiktok.com/@thirtyonelabofficial`
5. Facebook → `https://www.facebook.com/thirtyonelab`

## 7. Wireframe (ASCII)

```
┌───────────────────────────────────┐
│                                     │
│         [ BACKGROUND IMAGE ]       │
│                                     │
│            ┌─────────┐             │
│            │  LOGO   │             │
│            │ (image) │             │
│            └─────────┘             │
│                                     │
│           THIRTYONELAB®            │
│      Custom Jerseys, Elevated      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ [icon]  Website Catalog       │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ [icon]  Order via WhatsApp    │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ [icon]  Instagram             │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ [icon]  TikTok                │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ [icon]  Facebook              │ │
│  └───────────────────────────────┘ │
│                                     │
│      © 2026 ThirtyOne Lab          │
│                                     │
└───────────────────────────────────┘
```

## 8. Nota Teknikal

- Icon akan dimasukkan sebagai `<img>` tag (custom image dari klien), gantikan sepenuhnya penggunaan emoji dalam draf awal
- Logo dan background akan dimasukkan sebagai `<img>`/`background-image` sebaik sahaja fail imej diterima
- Font akan di-import (Google Fonts / self-hosted) sebaik sahaja nama font disahkan

## 9. Status

- [x] Struktur & pautan asas siap
- [x] Font disahkan (Montserrat heading / Inter body)
- [ ] Logo diterima
- [ ] Background diterima
- [ ] Icon sosial media diterima
