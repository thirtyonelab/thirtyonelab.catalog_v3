import os
from PIL import Image

dir_path = r"C:\Users\User\Documents\GitHub\testing\public\Image\Collaboration With (Customer)"

for filename in os.listdir(dir_path):
    if filename.endswith((".webp", ".png", ".jpg", ".jpeg")):
        filepath = os.path.join(dir_path, filename)
        try:
            img = Image.open(filepath).convert("RGBA")
            
            # getbbox returns a tuple (left, upper, right, lower)
            # bounding box of the non-zero alpha regions
            bbox = img.getbbox()
            
            if bbox:
                # Crop the image to the bounding box
                cropped_img = img.crop(bbox)
                # Save it back
                cropped_img.save(filepath, "WEBP")
                print(f"Cropped and saved: {filename}")
            else:
                print(f"Empty image (all transparent): {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Done cropping all images.")
