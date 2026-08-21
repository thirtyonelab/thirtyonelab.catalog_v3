import re

def check_file(filepath):
    print(f"--- Checking {filepath} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check unclosed comments
    if content.count('/*') != content.count('*/'):
        print("ERROR: Unmatched comment delimiters /* and */")

    # Check braces balance line by line tracking
    depth = 0
    lines = content.split('\n')
    for idx, line in enumerate(lines, 1):
        # strip string contents / comments for brace counting
        code = re.sub(r'/\*.*?\*/', '', line)
        for char in code:
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth < 0:
                    print(f"ERROR: Negative brace depth at line {idx}: {line}")
    if depth != 0:
        print(f"ERROR: Unmatched braces, final depth: {depth}")
    else:
        print("Brace balance: OK")

check_file('src/css/19-v3-mobile-hub.css')
check_file('src/css/12-lightbox.css')
