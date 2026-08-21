import re
with open("src/index.html", "r", encoding="utf-8") as f:
    content = f.read()

with open("scratch/hero_backup.html", "r", encoding="utf-8") as f:
    hero_html = f.read()

# Insert hero html
content = content.replace("<!-- ==========================================\n       5A. VERSION 3 LANDING PAGE HUB (PHONE-FIRST)\n       ========================================== -->", hero_html + "\n\n    <!-- ==========================================\n       5A. VERSION 3 LANDING PAGE HUB (PHONE-FIRST)\n       ========================================== -->")

# Insert CSS link
css_link = '    <link rel="stylesheet" href="css/04-hero.css?v=2.2">\n'
content = content.replace("<!-- Desktop Specific Styles -->", "<!-- Desktop Specific Styles -->\n" + css_link)

with open("src/index.html", "w", encoding="utf-8") as f:
    f.write(content)
