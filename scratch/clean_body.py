with open("src/index.html", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("</body>\n    \n        \n</body>", "</body>")
content = content.replace("</body>\n    \n        \n\n</body>", "</body>")

with open("src/index.html", "w", encoding="utf-8") as f:
    f.write(content)
