js_file = 'src/js/app_v2.js'
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Reset zoom on closeLightbox
close_func = """function closeLightbox() {
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const content = document.querySelector('.lightbox-content');
    const navPrev = document.getElementById('lightboxPrev');
    const navNext = document.getElementById('lightboxNext');
    const lightboxImg = document.getElementById('lightboxImg');

    if (content) content.style.opacity = '0';"""

new_close_func = """function closeLightbox() {
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const content = document.querySelector('.lightbox-content');
    const navPrev = document.getElementById('lightboxPrev');
    const navNext = document.getElementById('lightboxNext');
    const lightboxImg = document.getElementById('lightboxImg');

    // Reset Zoom
    if (typeof currentZoom !== 'undefined') currentZoom = 1;
    if (lightboxImg) lightboxImg.style.transform = 'scale(1)';

    if (content) content.style.opacity = '0';"""

if close_func in js_content:
    js_content = js_content.replace(close_func, new_close_func)

# Reset zoom on switch slide
switch_func = """window.switchV3LightboxSlide = function(dir) {
    if (v3LightboxImages.length <= 1) return;"""

new_switch_func = """window.switchV3LightboxSlide = function(dir) {
    if (v3LightboxImages.length <= 1) return;
    
    // Reset Zoom
    if (typeof currentZoom !== 'undefined') currentZoom = 1;
    const lightboxImg = document.getElementById('lightboxImg');
    if (lightboxImg) lightboxImg.style.transform = 'scale(1)';
"""

if switch_func in js_content:
    js_content = js_content.replace(switch_func, new_switch_func)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)
