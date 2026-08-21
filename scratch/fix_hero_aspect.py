import re
with open("src/css/17-responsive.css", "r", encoding="utf-8") as f:
    content = f.read()

# Replace aspect-ratio: 4 / 5 !important; with aspect-ratio: 16 / 9 !important;
content = re.sub(r'aspect-ratio:\s*4\s*/\s*5\s*!important;', 'aspect-ratio: 16 / 9 !important;', content)
# Also remove min-height: 400px;
content = re.sub(r'min-height:\s*400px;', 'min-height: unset;', content)

with open("src/css/17-responsive.css", "w", encoding="utf-8") as f:
    f.write(content)
