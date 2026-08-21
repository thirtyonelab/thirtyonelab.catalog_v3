import re
with open("backup_desktop_legacy/index.html", "r", encoding="utf-8") as f:
    content = f.read()

hero_match = re.search(r'(<!-- ==========================================\s*5\. HERO LIFESTYLE SECTION\s*========================================== -->\s*<section class="hero-section" id="home">.*?</section>)', content, flags=re.DOTALL)
if hero_match:
    hero_code = hero_match.group(1)
    with open("scratch/hero_backup.html", "w", encoding="utf-8") as out:
        out.write(hero_code)
    print("Hero code extracted successfully.")
else:
    print("Hero code not found!")
