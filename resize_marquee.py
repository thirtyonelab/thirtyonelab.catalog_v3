import os
from PIL import Image

source_dir = "public/Image/2026"
dest_dir = "public/Image/Mobile Marquee"

os.makedirs(dest_dir, exist_ok=True)

files = [
    "26-0007",
    "26-0030",
    "26-0025",
    "26-0026",
    "26-0004",
    "26-0003",
    "26-0012",
    "26-0011",
    "26-0015",
    "26-0041"
]

for filename in files:
    src_path = os.path.join(source_dir, filename + ".webp")
    dest_path = os.path.join(dest_dir, filename + ".webp")
    
    if os.path.exists(src_path):
        try:
            with Image.open(src_path) as img:
                # Resize image to 150x200
                img = img.resize((150, 200), Image.Resampling.LANCZOS)
                # Save as WebP
                img.save(dest_path, "WEBP", quality=90)
            print(f"Successfully processed {filename}.webp")
        except Exception as e:
            print(f"Error processing {filename}.webp: {e}")
    else:
        print(f"File not found: {src_path}")
