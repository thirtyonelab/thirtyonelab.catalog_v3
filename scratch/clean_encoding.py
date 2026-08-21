import glob

for path in glob.glob('src/css/*.css'):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # Replace weird mojibake characters
    text = text.replace('â€”', ' - ')
    text = text.replace('â€™', "'")
    text = text.replace('â€œ', '"')
    text = text.replace('â€', '"')
    text = text.replace('—', ' - ')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

print("All CSS files cleaned and saved as UTF-8.")
