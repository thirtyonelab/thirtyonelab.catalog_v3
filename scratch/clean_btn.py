import re
with open("src/css/19-v3-mobile-hub.css", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'\.v3-btn-primary-hub\.event-edition\s*\{[^}]*\}', '', content)

with open("src/css/19-v3-mobile-hub.css", "w", encoding="utf-8") as f:
    f.write(content)
