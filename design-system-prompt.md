# UX/UI Design System Prompt — "Muted Luxury Boutique Minimalist"
*(Extracted from ThirtyOne Lab's website — reuse this for any new site that wants the same look & feel)*

Copy the block below and paste it into a new AI conversation whenever you start a new website project.

---

## PROMPT TO REUSE

> Design and build this website using a **muted luxury minimalist boutique aesthetic**, inspired by Zara / COS / Aritzia — calm and understated, never vibrant or saturated.
>
> **Color Palette**
> - `#C51B27` (deep boutique red) and `#FAF9F6` (warm off-white) are the brand's trademark colors — keep these exact two hex values unchanged, they are non-negotiable.
> - Use the red sparingly and deliberately (CTAs, active states, small accents) — never as a large background fill or a bright, dominant color.
> - Everything else in the palette should be muted/desaturated to sit quietly around the two trademark colors: hover state `#A1141E`, light tint `#FDF2F3`
> - Cards/surfaces: pure white `#FFFFFF`
> - Text: near-black `#111111` for headings/body, `#666666` for muted text, `#8E8B82` for light/tertiary text
> - Borders: soft warm gray `#E6E2DC`, turning red `#C51B27` on hover/active only
> - No extra hues, no bright/saturated additions, no neon or glossy gradients. Shadows should stay soft and low-opacity so the overall feel reads as calm and muted, not vibrant.
>
> **Typography**
> - Headings & UI text: **Montserrat** (weights 300–900), uppercase with wide letter-spacing (2–3px) for labels/nav/tags — gives a premium boutique-label feel
> - Body/secondary text: **Inter**
> - Small "section tag" labels above headings: 0.75rem, bold, uppercase, 3px letter-spacing, in the red accent color
>
> **Layout**
> - Max content width: 1300px, centered, with 24px side padding
> - Generous white space between sections (60–80px+ vertical padding)
> - Flat, squared-off corners on primary buttons/logo (`border-radius: 0`) for an editorial/boutique look — but small pill/rounded corners (16–20px) are fine for tags, toggles, and small UI chips
>
> **Components**
> - Sticky header: semi-transparent white (90% opacity) with `backdrop-filter: blur(20px)` — a frosted-glass sticky nav
> - Buttons: two variants — solid red primary (`background: var(--primary-red)`, white text) and outlined secondary (transparent bg, 1px border, fills on hover). Sharp corners, smooth transition on hover (`all 0.4s cubic-bezier(0.16, 1, 0.3, 1)`)
> - Cards (product/category cards): white background, soft shadow (`0 12px 30px rgba(0,0,0,0.05)` for resting state, slightly deeper shadow like `0 15px 35px rgba(0,0,0,0.08)` on hover), subtle lift on hover — never a bright glow
> - Modals/overlays: large soft shadow (`0 25px 60px rgba(0,0,0,0.06–0.08)`), generous internal padding, no harsh borders
> - All interactive elements use a consistent easing transition — smooth, never abrupt (`cubic-bezier(0.16, 1, 0.3, 1)`, ~0.4s)
>
> **Overall mood**
> - Editorial, calm, high-end retail — plenty of breathing room, understated typography, one confident-but-muted accent color, soft/diffused shadows instead of hard borders, and smooth micro-interactions on hover. Avoid bright/saturated colors, hard-edged shadows, or busy layouts.

---

## Reference Design Tokens (for direct CSS reuse)

```css
:root {
    --primary-red: #C51B27;       /* trademark — keep exact */
    --primary-red-hover: #A1141E;
    --primary-red-light: #FDF2F3;
    --white: #FFFFFF;
    --off-white-bg: #FAF9F6;      /* trademark — keep exact */
    --off-white-card: #FFFFFF;
    --text-dark: #111111;
    --text-muted: #666666;
    --text-light: #8E8B82;
    --border-color: #E6E2DC;
    --border-color-hover: #C51B27;
    --font-primary: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-secondary: 'Inter', sans-serif;
    --transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
```

Google Fonts import used:
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap
```
