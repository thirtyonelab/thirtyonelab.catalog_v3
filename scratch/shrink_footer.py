import re
with open("src/css/15-footer.css", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'height:\s*28px;', 'height: 20px;', content)
content = re.sub(r'font-size:\s*0\.7rem;', 'font-size: 0.6rem;', content)
content = re.sub(r'margin-bottom:\s*12px;', 'margin-bottom: 8px;', content)

with open("src/css/15-footer.css", "w", encoding="utf-8") as f:
    f.write(content)
