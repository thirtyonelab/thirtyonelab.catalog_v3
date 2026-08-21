with open("src/css/17-responsive.css", "r", encoding="utf-8") as f:
    content = f.read()

old_css = """    .hero-section {
        aspect-ratio: 16 / 9 !important;
        height: auto;
        min-height: unset;
        margin-bottom: 0px;
        align-items: flex-start;
        padding-top: 20px;
    }"""

new_css = """    .hero-section {
        aspect-ratio: 4 / 5 !important;
        height: auto;
        min-height: 400px;
        margin-bottom: 0px;
        align-items: center;
        padding-top: 0px;
    }"""

content = content.replace(old_css, new_css)

with open("src/css/17-responsive.css", "w", encoding="utf-8") as f:
    f.write(content)
