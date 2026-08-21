import os
from PIL import Image

def convert_to_webp(source_dir, dest_dir, quality=85):
    """
    Convert all PNG and JPG images in source_dir to WEBP format in dest_dir.
    """
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    # Allowed extensions
    valid_extensions = ('.png', '.jpg', '.jpeg')
    count = 0

    print(f"Mencari imej dalam folder: {source_dir}...")

    for filename in os.listdir(source_dir):
        ext = os.path.splitext(filename)[1].lower()
        if ext in valid_extensions:
            source_path = os.path.join(source_dir, filename)
            # Create new filename with .webp extension
            base_name = os.path.splitext(filename)[0]
            webp_filename = f"{base_name}.webp"
            dest_path = os.path.join(dest_dir, webp_filename)

            try:
                # Open image
                with Image.open(source_path) as img:
                    # Convert to RGB if it's RGBA and we want to drop alpha
                    # WebP supports alpha, so we can save it as-is for PNGs
                    img.save(dest_path, 'WEBP', quality=quality)
                    print(f"[\u2713] Berjaya convert: {filename} -> {webp_filename}")
                    count += 1
            except Exception as e:
                print(f"[X] Gagal convert {filename}: {e}")

    print(f"\nSelesai! {count} imej telah ditukar kepada WEBP.")
    print(f"Anda boleh semak folder: {dest_dir}")

if __name__ == "__main__":
    # Folder input dan output (tukar jika perlu)
    input_folder = "images_to_convert"
    output_folder = "images_webp"

    # Create input directory if it doesn't exist
    if not os.path.exists(input_folder):
        os.makedirs(input_folder)
        print(f"Folder '{input_folder}' telah dicipta. Sila letak imej anda di dalamnya dan jalankan script ini semula.")
    else:
        convert_to_webp(input_folder, output_folder)
