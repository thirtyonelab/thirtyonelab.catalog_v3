import re
with open("src/index.html", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'<div class="tut-info-box" id="tutInfoBox">.*?</div>\s*<div id="onboardingPopup"></div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)

with open("src/index.html", "w", encoding="utf-8") as f:
    f.write(content)
