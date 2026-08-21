import re
with open("src/index.html", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'</body>\s*</body>\s*</html>', '</body>\n</html>', content, flags=re.DOTALL)

with open("src/index.html", "w", encoding="utf-8") as f:
    f.write(content)
