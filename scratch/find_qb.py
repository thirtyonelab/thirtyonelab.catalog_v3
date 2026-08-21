import re
with open("src/js/app_v2.js", "r", encoding="utf-8") as f:
    content = f.read()

# Find lines around openQuoteBuilder to understand where it is called from lightbox
lines = content.split("\n")
for i, line in enumerate(lines):
    if "openQuoteBuilder" in line:
        print(f"Line {i+1}: {line.strip()}")
