with open("src/css/04-hero.css", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("width: 100%;", "width: 100%;\n    max-width: 650px;\n    margin-left: auto;\n    margin-right: auto;")

with open("src/css/04-hero.css", "w", encoding="utf-8") as f:
    f.write(content)
