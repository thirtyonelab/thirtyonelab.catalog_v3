import re
with open("src/js/app_v2.js", "r", encoding="utf-8") as f:
    content = f.read()

# Remove observer logic
content = re.sub(r'const observer = new IntersectionObserver.*?\n}\);', '', content, flags=re.DOTALL)
content = re.sub(r'document\.querySelectorAll\([^)]*\)\.forEach\([^)]*\)\.observe\(section\);\s*}\);', '', content, flags=re.DOTALL)

with open("src/js/app_v2.js", "w", encoding="utf-8") as f:
    f.write(content)
