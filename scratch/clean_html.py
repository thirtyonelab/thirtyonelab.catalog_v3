import re

with open("src/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Remove Hero Section
content = re.sub(r'<!-- ==========================================\s*5\. HERO LIFESTYLE SECTION\s*========================================== -->\s*<section class="hero-section" id="home">.*?</section>', '', content, flags=re.DOTALL)

# Remove catalog grid
content = re.sub(r'<!-- Hidden / Offscreen dynamic data holder for Supabase & catalog rendering -->\s*<div id="catalogGrid" style="display: none;"></div>', '', content, flags=re.DOTALL)

# Remove Legacy Tutorial Modal
content = re.sub(r'<!-- Legacy Quote Modals & Tutorial Overlay kept inert and hidden -->\s*<div style="display: none !important;">.*?</div>', '', content, flags=re.DOTALL)

# Remove unused css links
unused_css = ['css/04-hero.css?v=2.1', 'css/05-how-it-works.css?v=2.2', 'css/06-shop-catalog.css?v=2.2', 'css/07-filters.css?v=3.5', 'css/08-product-grid.css?v=6.0', 'css/09-custom-layout-grids.css?v=3.0', 'css/10-pagination.css?v=2.2', 'css/11-about-contact.css?v=4.8']
for css in unused_css:
    content = re.sub(rf'<link rel="stylesheet" href="{re.escape(css)}">\s*', '', content)

with open("src/index.html", "w", encoding="utf-8") as f:
    f.write(content)
