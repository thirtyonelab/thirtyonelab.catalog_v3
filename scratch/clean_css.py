with open("src/css/19-v3-mobile-hub.css", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("""/* Hide old sections */
.catalog-section, .about-section, .contact-section {
    display: none !important;
}""", "")

with open("src/css/19-v3-mobile-hub.css", "w", encoding="utf-8") as f:
    f.write(content)
