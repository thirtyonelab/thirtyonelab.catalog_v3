import glob

# 1. Update HTML Viewport
html_files = glob.glob('src/*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">')
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Add Pinch-to-Zoom logic to app_v2.js
js_file = 'src/js/app_v2.js'
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

zoom_logic = """
// Mobile Pinch-to-Zoom on Lightbox Image
let currentZoom = 1;
let initialDistance = null;
const lightboxImgEl = document.getElementById('lightboxImg');

if (lightboxOverlayEl && lightboxImgEl) {
    lightboxOverlayEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        } else if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
        }
    }, { passive: false });

    lightboxOverlayEl.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance) {
            e.preventDefault(); // Prevent default zoom
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scale = currentDistance / initialDistance;
            currentZoom = Math.min(Math.max(1, currentZoom * scale), 4); // Max zoom 4x
            lightboxImgEl.style.transform = `scale(${currentZoom})`;
            initialDistance = currentDistance;
        }
    }, { passive: false });

    lightboxOverlayEl.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = null;
        }
        if (e.changedTouches && e.changedTouches.length === 1 && !initialDistance) {
            // Handle swipe if not zoomed
            if (currentZoom <= 1.1) {
                touchEndX = e.changedTouches[0].clientX;
                const diffX = touchEndX - touchStartX;
                if (Math.abs(diffX) > 40 && v3LightboxImages.length > 1) {
                    if (diffX < 0) {
                        window.switchV3LightboxSlide('next');
                    } else {
                        window.switchV3LightboxSlide('prev');
                    }
                }
            }
        }
    }, { passive: false });
}
"""

# Replace the existing swipe logic with the new combined swipe + zoom logic
old_logic = """    lightboxOverlayEl.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    lightboxOverlayEl.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
            touchEndX = e.changedTouches[0].clientX;
            const diffX = touchEndX - touchStartX;
            if (Math.abs(diffX) > 40 && v3LightboxImages.length > 1) {
                if (diffX < 0) {
                    window.switchV3LightboxSlide('next'); // Swipe left -> next image
                } else {
                    window.switchV3LightboxSlide('prev'); // Swipe right -> prev image
                }
            }
        }
    }, { passive: true });"""

if old_logic in js_content:
    js_content = js_content.replace(old_logic, zoom_logic)
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
else:
    print("Old logic not found!")
