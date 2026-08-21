import { supabase } from '../supabaseClient.js';
import { catalogProducts2026 } from '../js/catalog2026.js';
import { catalogProducts2025 } from '../js/catalog2025.js';
import { catalogProductsEvent } from '../js/catalogEvent.js';

// Static products lookup map
const staticProductsMap = new Map();
[...catalogProducts2026, ...catalogProducts2025, ...catalogProductsEvent].forEach(p => {
    if (p && p.id) {
        staticProductsMap.set(p.id, p);
    }
});

// --- Local State ---
let allProducts = [];
let currentEditingId = null; // null means adding a new product
let currentPage = 1;
const itemsPerPage = 16;

// --- DOM Elements ---
const loginPage = document.getElementById('loginPage');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');

const adminLayout = document.getElementById('adminLayout');
const signOutBtn = document.getElementById('signOutBtn');

// Dashboard Stats
const statTotal = document.getElementById('statTotal');
const stat2026 = document.getElementById('stat2026');
const stat2025 = document.getElementById('stat2025');
const statEvent = document.getElementById('statEvent');

// Toolbar & Listing
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const addProductBtn = document.getElementById('addProductBtn');
const catalogGrid = document.getElementById('catalogGrid');
const paginationContainer = document.getElementById('paginationContainer');

// Modal Elements
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Form Inputs
const productIdInput = document.getElementById('productId');
const productEditionSelect = document.getElementById('productEdition');
const productIsNewCheckbox = document.getElementById('productIsNew');
const productNoSlideCheckbox = document.getElementById('productNoSlide');

// Event Tag Inputs
const eventTagGroup = document.getElementById('eventTagGroup');
const productEventTagSelect = document.getElementById('productEventTagSelect');
const productEventTagCustom = document.getElementById('productEventTagCustom');

// File Upload inputs
const mainImageFileInput = document.getElementById('mainImageFile');
const mainImageUrlInput = document.getElementById('mainImageUrl');
const mainProgressContainer = document.getElementById('mainProgressContainer');
const mainProgressBar = document.getElementById('mainProgressBar');
const mainImagePreviewArea = document.getElementById('mainImagePreviewArea');

const additionalImagesFileInput = document.getElementById('additionalImagesFile');
const additionalImagesUrlsTextarea = document.getElementById('additionalImagesUrls');
const additionalProgressContainer = document.getElementById('additionalProgressContainer');
const additionalProgressBar = document.getElementById('additionalProgressBar');
const additionalImagesPreviewArea = document.getElementById('additionalImagesPreviewArea');
const latestIdVal = document.getElementById('latestIdVal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Check initial session status
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Session check error:', error);
    }
    
    if (session) {
        showDashboard();
    } else {
        showLogin();
    }
});

// --- Auth Operations ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('d-none');
    loginError.innerText = '';
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        loginError.innerText = error.message;
        loginError.classList.remove('d-none');
        showToast('Login Gagal: ' + error.message, 'error');
    } else {
        showToast('Log Masuk Berjaya!', 'success');
        showDashboard();
    }
});

signOutBtn.addEventListener('signOutBtn', () => {}); // placeholder
signOutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showToast('Ralat Log Keluar: ' + error.message, 'error');
    } else {
        showToast('Log Keluar Berjaya!', 'success');
        showLogin();
    }
});

function showLogin() {
    loginPage.classList.remove('d-none');
    adminLayout.classList.add('d-none');
    // Clear forms
    loginForm.reset();
}

function showDashboard() {
    loginPage.classList.add('d-none');
    adminLayout.classList.remove('d-none');
    fetchProducts();
}

// --- CRUD Operations ---
async function fetchProducts() {
    catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-primary); font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase;">Loading Products...</div>';
    
    try {
        const { data: dbProducts, error } = await supabase
            .from('products')
            .select('*')
            .in('edition', ['prod-2026', 'prod-2025', 'prod-event']);

        if (error) throw error;

        const dbProductIds = new Set((dbProducts || []).map(p => p.id));
        
        let mergedProducts = (dbProducts || []).map(p => {
            const staticRef = staticProductsMap.get(p.id);
            const resolvedImages = (p.images && p.images.length > 0) ? p.images : (staticRef ? staticRef.images : null);
            const hasExtraImages = resolvedImages && Array.isArray(resolvedImages) && resolvedImages.length > 0;
            // Slide show is disabled (no_slide = true) by default for ALL products unless explicitly enabled with extra images
            const isSlideEnabled = hasExtraImages && p.no_slide === false;
            return {
                ...p,
                image: p.image || (staticRef ? staticRef.image : ''),
                images: resolvedImages,
                no_slide: !isSlideEnabled
            };
        });

        allProducts = mergedProducts;
        updateStats();
        renderCatalog();
    } catch (err) {
        console.error('Fetch products error:', err);
        showToast('Gagal memuat turun produk: ' + err.message, 'error');
        catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--primary-red);">Error loading products from Database.</div>';
    }
}

function updateStats() {
    const total = allProducts.length;
    const count2026 = allProducts.filter(p => p.edition === 'prod-2026').length;
    const count2025 = allProducts.filter(p => p.edition === 'prod-2025').length;
    const countEvent = allProducts.filter(p => p.edition === 'prod-event').length;

    statTotal.innerText = total;
    stat2026.innerText = count2026;
    stat2025.innerText = count2025;
    statEvent.innerText = countEvent;
}

function renderCatalog() {
    catalogGrid.innerHTML = '';
    
    const searchQuery = searchInput.value.trim().toLowerCase();
    const filterEdition = filterSelect.value;

    // Filter products locally (excluding For Your Own Design)
    const filteredProducts = allProducts.filter(p => {
        const matchesSearch = p.id.toLowerCase().includes(searchQuery);
        const matchesEdition = filterEdition === 'all' || p.edition === filterEdition;
        return matchesSearch && matchesEdition && p.id !== 'For Your Own Design';
    });

    // Sort: 2026 first, then 2025, then event
    filteredProducts.sort((a, b) => {
        // First sort by edition
        if (a.edition !== b.edition) {
            const order = { 'prod-2026': 1, 'prod-2025': 2, 'prod-event': 3 };
            return (order[a.edition] || 9) - (order[b.edition] || 9);
        }
        // Within same edition, prioritize newest updates (timestamp diff > 5s)
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        if (Math.abs(timeA - timeB) > 5000) {
            return timeB - timeA; // Newest first
        }
        // Special sorting fallback for prod-event (seeded items)
        if (a.edition === 'prod-event') {
            const customOrder = ['WC Argentina', 'WC Brazil', 'WC Portugal', 'WC England', 'WC Spain'];
            const indexA = customOrder.indexOf(a.id);
            const indexB = customOrder.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
        }
        // Then sort descending by ID
        return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Prepend "For Your Own Design" if it exists in allProducts (and matches search)
    const ownDesign = allProducts.find(p => p.id === 'For Your Own Design');
    if (ownDesign && ownDesign.id.toLowerCase().includes(searchQuery)) {
        const targetEdition = filterEdition === 'all' ? 'prod-2026' : filterEdition;
        filteredProducts.unshift({
            ...ownDesign,
            edition: targetEdition
        });
    }

    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Validate current page index
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }

    if (totalItems === 0) {
        catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No products found.</div>';
        paginationContainer.innerHTML = '';
        paginationContainer.style.display = 'none';
        return;
    }

    // Slice products list to match currentPage items
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'admin-product-card';

        // Image source
        const staticRef = staticProductsMap.get(product.id);
        let displayImg = product.image;
        if (!displayImg && product.images && product.images.length > 0) {
            displayImg = product.images[0];
        }
        if (!displayImg && staticRef) {
            displayImg = staticRef.image || (staticRef.images && staticRef.images[0]);
        }
        const fallbackImg = resolveImageUrl('Image/Favicon/Logo Favicon.webp');
        displayImg = resolveImageUrl(displayImg) || fallbackImg;

        // Flags HTML
        let flagsHtml = '';
        if (product.is_new) {
            flagsHtml += '<span class="flag-chip">NEW</span>';
        }
        if (product.no_slide) {
            flagsHtml += '<span class="flag-chip secondary">NO SLIDE</span>';
        }
        if (product.event_tag) {
            flagsHtml += `<span class="flag-chip secondary">${product.event_tag.toUpperCase()}</span>`;
        }
        if (product.images && product.images.length > 1) {
            flagsHtml += `<span class="flag-chip secondary">${product.images.length} IMAGES</span>`;
        }

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${displayImg}" alt="${product.id}" class="card-image" onerror="this.onerror=null;this.src='${fallbackImg}'">
            </div>
            <div class="card-info">
                <span class="card-title">${product.id}</span>
                <span class="card-edition">${product.edition}</span>
                <div class="card-flags">${flagsHtml}</div>
            </div>
            <div class="card-actions">
                <button class="btn-card-action btn-card-edit" data-id="${product.id}">Edit</button>
                <button class="btn-card-action btn-card-delete" data-id="${product.id}">Delete</button>
            </div>
        `;

        // Attach action events
        card.querySelector('.btn-card-edit').addEventListener('click', () => openModal(product));
        card.querySelector('.btn-card-delete').addEventListener('click', () => deleteProduct(product.id));

        catalogGrid.appendChild(card);
    });

    // Render page numbers navigation block
    renderPagination(totalPages);
}

function getBasePath() {
    var path = window.location.pathname;
    var parts = path.split('/').filter(Boolean);
    if (parts.length > 0 && parts[0] === 'thirtyonelab.catalog_v3') {
        return '/thirtyonelab.catalog_v3/';
    }
    return '/';
}

function encodeUrl(str) {
    return encodeURI(str).replace(/#/g, '%23');
}

// Helper to resolve relative image paths for routing
function resolveImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return encodeUrl(url);
    }
    const base = getBasePath();
    const cleanPath = url.replace(/^(\.\.\/|\.\/|\/)+/, '');
    return encodeUrl(base + cleanPath);
}

// Search and filter listeners
searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderCatalog();
});
filterSelect.addEventListener('change', () => {
    currentPage = 1;
    renderCatalog();
});

// Helper to render pagination controls
function renderPagination(totalPages) {
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    paginationContainer.style.display = 'flex';
    
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `admin-page-btn${currentPage === i ? ' active' : ''}`;
        btn.innerText = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderCatalog();
            // Scroll to the top of catalog container
            catalogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        paginationContainer.appendChild(btn);
    }
}

// Show/Hide event tag based on selected edition and update latest ID hint
productEditionSelect.addEventListener('change', () => {
    if (productEditionSelect.value === 'prod-event') {
        eventTagGroup.classList.remove('d-none');
    } else {
        eventTagGroup.classList.add('d-none');
    }
    updateLatestIdHint();
});

// Helper to determine and display the latest product ID for the selected edition
function updateLatestIdHint() {
    const selectedEdition = productEditionSelect.value;
    
    // Filter out 'For Your Own Design' since it's a template
    const productsInEdition = allProducts.filter(p => p.edition === selectedEdition && p.id !== 'For Your Own Design');
    
    if (productsInEdition.length === 0) {
        latestIdVal.innerText = '-';
        return;
    }
    
    // Sort them descending by created_at (newest first)
    productsInEdition.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        if (Math.abs(timeA - timeB) > 5000) {
            return timeB - timeA;
        }
        if (selectedEdition === 'prod-event') {
            const customOrder = ['WC Argentina', 'WC Brazil', 'WC Portugal', 'WC England', 'WC Spain'];
            const indexA = customOrder.indexOf(a.id);
            const indexB = customOrder.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
        }
        return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    const latestProduct = productsInEdition[0];
    latestIdVal.innerText = latestProduct.id;
}

// Show/Hide custom event tag input based on select value
productEventTagSelect.addEventListener('change', () => {
    if (productEventTagSelect.value === 'custom') {
        productEventTagCustom.classList.remove('d-none');
        productEventTagCustom.required = true;
    } else {
        productEventTagCustom.classList.add('d-none');
        productEventTagCustom.required = false;
    }
});

// --- Modal & Form Handlers ---
addProductBtn.addEventListener('click', () => openModal(null));
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

function openModal(product) {
    productForm.reset();
    mainImagePreviewArea.innerHTML = '';
    additionalImagesPreviewArea.innerHTML = '';
    mainProgressContainer.style.display = 'none';
    additionalProgressContainer.style.display = 'none';
    updateLatestIdHint();
    
    if (product) {
        currentEditingId = product.id;
        modalTitle.innerText = 'Edit Catalog Item';
        productIdInput.value = product.id;
        productIdInput.disabled = true; // Disable editing primary key ID
        
        productEditionSelect.value = product.edition;
        productIsNewCheckbox.checked = !!product.is_new;
        productNoSlideCheckbox.checked = !product.no_slide; // Checked = Enable Slide Show
        
        // Populate Event Tag field
        if (product.edition === 'prod-event') {
            eventTagGroup.classList.remove('d-none');
            const tagVal = product.event_tag || '';
            if (tagVal === 'World Cup' || tagVal === 'Merdeka' || tagVal === '') {
                productEventTagSelect.value = tagVal;
                productEventTagCustom.classList.add('d-none');
                productEventTagCustom.value = '';
                productEventTagCustom.required = false;
            } else {
                productEventTagSelect.value = 'custom';
                productEventTagCustom.classList.remove('d-none');
                productEventTagCustom.value = tagVal;
                productEventTagCustom.required = true;
            }
        } else {
            eventTagGroup.classList.add('d-none');
            productEventTagSelect.value = 'World Cup';
            productEventTagCustom.value = '';
            productEventTagCustom.classList.add('d-none');
            productEventTagCustom.required = false;
        }
        
        mainImageUrlInput.value = product.image || '';
        if (product.image) {
            showImagePreview(product.image, mainImagePreviewArea);
        }

        // Additional Images
        if (product.images && Array.isArray(product.images)) {
            additionalImagesUrlsTextarea.value = product.images.join('\n');
            product.images.forEach(img => showImagePreview(img, additionalImagesPreviewArea));
        } else {
            additionalImagesUrlsTextarea.value = '';
        }
    } else {
        currentEditingId = null;
        modalTitle.innerText = 'Add Catalog Item';
        productIdInput.disabled = false;
        productIdInput.value = '';
        productEditionSelect.value = 'prod-2026';
        productIsNewCheckbox.checked = false;
        productNoSlideCheckbox.checked = false; // Unticked by default = Disable Slide Show (no_slide = true)
        mainImageUrlInput.value = '';
        additionalImagesUrlsTextarea.value = '';

        // Reset Event Tag fields
        eventTagGroup.classList.add('d-none');
        productEventTagSelect.value = 'World Cup';
        productEventTagCustom.value = '';
        productEventTagCustom.classList.add('d-none');
        productEventTagCustom.required = false;
    }

    productModal.classList.add('active');
}

function closeModal() {
    productModal.classList.remove('active');
    currentEditingId = null;
    eventTagGroup.classList.add('d-none');
    productEventTagCustom.classList.add('d-none');
}

// Helper to show thumbnail previews in the form
function showImagePreview(url, container) {
    const img = document.createElement('img');
    img.src = resolveImageUrl(url);
    img.className = 'preview-thumb';
    img.onerror = () => { img.src = resolveImageUrl('Image/Favicon/Logo Favicon.webp'); };
    container.appendChild(img);
}

// File Upload helper to Supabase Storage
async function uploadFile(file, progressCallback) {
    // Sanitize file name
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const folder = productEditionSelect.value === 'prod-event' ? 'event' : productEditionSelect.value.replace('prod-', '');
    const filePath = `${folder}/${Date.now()}_${sanitizedName}`;

    // Perform upload
    const { data, error } = await supabase.storage
        .from('product-image')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
        throw error;
    }

    // Get Public URL
    const { data: urlData } = supabase.storage
        .from('product-image')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

// Main Image File input listener
mainImageFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    mainProgressContainer.style.display = 'block';
    mainProgressBar.style.width = '0%';
    mainImagePreviewArea.innerHTML = '';

    try {
        const publicUrl = await uploadFile(file, (percent) => {
            mainProgressBar.style.width = percent + '%';
        });

        mainImageUrlInput.value = publicUrl;
        showImagePreview(publicUrl, mainImagePreviewArea);
        showToast('Imej utama berjaya dimuat naik!', 'success');
    } catch (err) {
        console.error('Upload main image error:', err);
        showToast('Gagal memuat naik imej: ' + err.message, 'error');
    } finally {
        setTimeout(() => {
            mainProgressContainer.style.display = 'none';
        }, 1000);
    }
});

// Additional Images File input listener
additionalImagesFileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    additionalProgressContainer.style.display = 'block';
    additionalProgressBar.style.width = '0%';
    additionalImagesPreviewArea.innerHTML = '';

    const uploadedUrls = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
        try {
            const publicUrl = await uploadFile(files[i], (percent) => {
                const stepPercent = Math.round(((i + percent / 100) / files.length) * 100);
                additionalProgressBar.style.width = stepPercent + '%';
            });
            uploadedUrls.push(publicUrl);
            showImagePreview(publicUrl, additionalImagesPreviewArea);
            successCount++;
        } catch (err) {
            console.error(`Upload error for file ${files[i].name}:`, err);
            showToast(`Gagal memuat naik ${files[i].name}`, 'error');
        }
    }

    if (uploadedUrls.length > 0) {
        const urlsJoined = uploadedUrls.join('\n');
        const existingText = additionalImagesUrlsTextarea.value.trim();
        additionalImagesUrlsTextarea.value = existingText ? `${existingText}\n${urlsJoined}` : urlsJoined;
        showToast(`${successCount} imej tambahan berjaya dimuat naik!`, 'success');
    }

    setTimeout(() => {
        additionalProgressContainer.style.display = 'none';
    }, 1000);
});

// Form Submit Handler (Save / Update product)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = productIdInput.value.trim();
    const edition = productEditionSelect.value;
    const isNew = productIsNewCheckbox.checked;
    const enableSlide = productNoSlideCheckbox.checked;
    const noSlide = !enableSlide; // If Enable Slide Show is checked, no_slide = false

    // Resolve main image URL
    const mainImageUrl = mainImageUrlInput.value.trim();
    if (!mainImageUrl) {
        showToast('Sila muat naik imej utama atau masukkan URL imej!', 'error');
        return;
    }

    // Resolve additional images
    const adUrlsText = additionalImagesUrlsTextarea.value.trim();
    let additionalUrlsArray = null;
    if (adUrlsText) {
        additionalUrlsArray = adUrlsText.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    }

    // Resolve event tag
    let eventTagValue = null;
    if (edition === 'prod-event') {
        if (productEventTagSelect.value === 'custom') {
            eventTagValue = productEventTagCustom.value.trim();
        } else {
            eventTagValue = productEventTagSelect.value;
        }
    }

    // Build product payload
    const payload = {
        edition: edition,
        image: mainImageUrl,
        images: additionalUrlsArray,
        is_new: isNew,
        no_slide: noSlide,
        event_tag: eventTagValue
    };

    try {
        if (currentEditingId) {
            // Edit flow
            const { error } = await supabase
                .from('products')
                .update(payload)
                .eq('id', currentEditingId);

            if (error) throw error;
            showToast('Produk berjaya dikemaskini!', 'success');
        } else {
            // Add flow
            // First check if ID already exists to prevent key constraint violations
            const { data: existing, error: checkError } = await supabase
                .from('products')
                .select('id')
                .eq('id', id)
                .maybeSingle();

            if (checkError) throw checkError;
            if (existing) {
                showToast(`Produk dengan ID ${id} sudah wujud!`, 'error');
                return;
            }

            // Insert new product
            const { error } = await supabase
                .from('products')
                .insert([{ id, ...payload }]);

            if (error) throw error;
            showToast('Produk berjaya ditambah!', 'success');
        }

        closeModal();
        fetchProducts();
    } catch (err) {
        console.error('Save product error:', err);
        showToast('Gagal menyimpan produk: ' + err.message, 'error');
    }
});

// Delete Product Operation
async function deleteProduct(id) {
    if (!confirm(`Adakah anda pasti mahu memadam produk ${id}?`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast(`Produk ${id} berjaya dipadam!`, 'success');
        fetchProducts();
    } catch (err) {
        console.error('Delete product error:', err);
        showToast(`Gagal memadam produk: ${err.message}`, 'error');
    }
}

// --- Toast Utility ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
    `;

    const toastContainer = document.getElementById('toastContainer');
    toastContainer.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// --- Hero Page Media Modal Logic ---
const editHeroBtn = document.getElementById('editHeroBtn');
const heroModal = document.getElementById('heroModal');
const closeHeroModalBtn = document.getElementById('closeHeroModalBtn');
const cancelHeroModalBtn = document.getElementById('cancelHeroModalBtn');
const heroForm = document.getElementById('heroForm');
const heroMediaType = document.getElementById('heroMediaType');
const heroDropZone = document.getElementById('heroDropZone');
const heroBrowseBtn = document.getElementById('heroBrowseBtn');
const heroFileInput = document.getElementById('heroFileInput');
const heroMediaUrlInput = document.getElementById('heroMediaUrlInput');
const heroPosterUrlInput = document.getElementById('heroPosterUrlInput');
const heroPreviewArea = document.getElementById('heroPreviewArea');

if (editHeroBtn) {
    editHeroBtn.addEventListener('click', openHeroModal);
}
if (closeHeroModalBtn) {
    closeHeroModalBtn.addEventListener('click', closeHeroModal);
}
if (cancelHeroModalBtn) {
    cancelHeroModalBtn.addEventListener('click', closeHeroModal);
}
if (heroBrowseBtn && heroFileInput) {
    heroBrowseBtn.addEventListener('click', () => heroFileInput.click());
    heroFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleHeroFileUpload(e.target.files[0]);
        }
    });
}
if (heroDropZone) {
    heroDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        heroDropZone.classList.add('dragover');
    });
    heroDropZone.addEventListener('dragleave', () => heroDropZone.classList.remove('dragover'));
    heroDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        heroDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleHeroFileUpload(e.dataTransfer.files[0]);
        }
    });
}
if (heroForm) {
    heroForm.addEventListener('submit', handleHeroSubmit);
}
if (heroMediaUrlInput) {
    heroMediaUrlInput.addEventListener('input', updateHeroPreview);
}
if (heroMediaType) {
    heroMediaType.addEventListener('change', updateHeroPreview);
}

async function openHeroModal() {
    heroModal.classList.add('active');
    heroMediaUrlInput.value = '';
    heroPosterUrlInput.value = '';
    heroPreviewArea.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">Memuat turun tetapan...</span>';

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', 'hero_setting')
            .single();

        if (data) {
            heroMediaType.value = data.event_tag === 'image' ? 'image' : 'video';
            heroMediaUrlInput.value = data.image || '';
            heroPosterUrlInput.value = (data.images && data.images[0]) || '';
            updateHeroPreview();
        } else {
            heroMediaType.value = 'image';
            heroMediaUrlInput.value = 'Image/Hero Page/Hero Page.webp';
            updateHeroPreview();
        }
    } catch (err) {
        console.log('No hero setting found, using default');
        heroMediaType.value = 'image';
        heroMediaUrlInput.value = 'Image/Hero Page/Hero Page.webp';
        updateHeroPreview();
    }
}

function closeHeroModal() {
    heroModal.classList.remove('active');
}

function updateHeroPreview() {
    const url = heroMediaUrlInput.value.trim();
    if (!url) {
        heroPreviewArea.innerHTML = '';
        return;
    }
    const resolved = resolveImageUrl(url);
    if (heroMediaType.value === 'video') {
        heroPreviewArea.innerHTML = `<video src="${resolved}" controls style="max-width: 100%; max-height: 180px; border-radius: 6px;"></video>`;
    } else {
        heroPreviewArea.innerHTML = `<img src="${resolved}" alt="Hero Preview" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 6px;">`;
    }
}

async function handleHeroFileUpload(file) {
    heroPreviewArea.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">Memuat naik fail hero...</span>';
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `hero_${Date.now()}.${fileExt}`;
        const filePath = `hero/${fileName}`;

        const { data, error } = await supabase.storage
            .from('product-image')
            .upload(filePath, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('product-image')
            .getPublicUrl(filePath);

        heroMediaUrlInput.value = publicUrlData.publicUrl;
        if (file.type.startsWith('video/')) {
            heroMediaType.value = 'video';
        } else {
            heroMediaType.value = 'image';
        }
        updateHeroPreview();
        showToast('Fail Hero berjaya dimuat naik!', 'success');
    } catch (err) {
        console.error('Hero file upload error:', err);
        showToast('Gagal memuat naik fail hero: ' + err.message, 'error');
        heroPreviewArea.innerHTML = '';
    }
}

async function handleHeroSubmit(e) {
    e.preventDefault();
    const mediaUrl = heroMediaUrlInput.value.trim();
    const mediaType = heroMediaType.value;
    const posterUrl = heroPosterUrlInput.value.trim();

    if (!mediaUrl) {
        showToast('Sila masukkan fail/URL hero media', 'error');
        return;
    }

    const payload = {
        id: 'hero_setting',
        edition: 'hero-setting',
        image: mediaUrl,
        event_tag: mediaType,
        images: posterUrl ? [posterUrl] : null,
        no_slide: true
    };

    try {
        const { error } = await supabase
            .from('products')
            .upsert(payload, { onConflict: 'id' });

        if (error) throw error;

        showToast('Tetapan Hero Page berjaya disimpan!', 'success');
        closeHeroModal();
    } catch (err) {
        console.error('Save hero setting error:', err);
        showToast('Gagal menyimpan tetapan hero: ' + err.message, 'error');
    }
}
