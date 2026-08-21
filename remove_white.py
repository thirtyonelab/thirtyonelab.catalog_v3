import os
from PIL import Image

dir_path = r"C:\Users\User\Documents\GitHub\testing\public\Image\Collaboration With (Customer)"

for filename in os.listdir(dir_path):
    if filename.endswith((".webp", ".png", ".jpg", ".jpeg")):
        filepath = os.path.join(dir_path, filename)
        try:
            img = Image.open(filepath).convert("RGBA")
            datas = img.getdata()

            newData = []
            for item in datas:
                # If pixel is close to white (R,G,B all > 230), make it transparent
                if item[0] > 230 and item[1] > 230 and item[2] > 230:
                    newData.append((255, 255, 255, 0))
                else:
                    newData.append(item)

            img.putdata(newData)
            img.save(filepath, "WEBP")
            print(f"Processed and made transparent: {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Done processing all images.")
