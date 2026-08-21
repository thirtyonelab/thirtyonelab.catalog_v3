import { supabase } from '../supabaseClient.js';
import { i18nTranslations } from './translations.js';
import { configData } from './config.js';
import { catalogProducts2026 } from './catalog2026.js';
import { catalogProducts2025 } from './catalog2025.js';
import { catalogProductsEvent } from './catalogEvent.js';
import { catalogProductsSpecs } from './catalogSpecs.js';
import { catalogProducts, generateHtmlForProduct, encodeUrl, resolveImagePath } from './catalogData.js';
import { quoteSelectionsOwn, openQuoteBuilderOwn } from './appOwn_v2.js';

// Preview Cards Mapping & Logic
const materialDetailsMap = {
    "Eyelet 165GSM (BEST SELLER)": {
        title: "EYELET",
        image: "Image/Material/Eyelet.webp",
        badges: ["Image/Material/Recommend.webp", "Image/Material/Hot Sale.webp"],
        desc: "Eyelet 160gsm is a lightweight, breathable jersey fabric that dries sweat quickly. Perfect for sports gear with bright, long-lasting printed colors.",
        recommend: "Sports • Corporate • Casual • Uniform • Event",
        descKey: "mat_eyelet_desc",
        recKey: "mat_eyelet_rec"
    },
    "Diamond 160GSM": {
        title: "DIAMOND",
        image: "Image/Material/Diamond.webp",
        badges: ["Image/Material/Recommend.webp"],
        desc: "Diamond 160gsm is a lightweight, breathable jersey fabric with a stylish diamond texture that wicks sweat quickly. Ideal for activewear, it delivers vivid, long-lasting printed colors while keeping you comfortable and moving freely.",
        recommend: "Sports • Corporate • Casual • Uniform • Event",
        descKey: "mat_diamond_desc",
        recKey: "mat_diamond_rec"
    },
    "Lycra 280GSM": {
        title: "LYCRA",
        image: "Image/Material/Lycra.webp",
        badges: ["Image/Material/Recommend.webp"],
        desc: "Lycra 280gsm is a premium, flexible jersey fabric that stretches comfortably and shapes your body well. It is durable and perfect for custom sports designs.",
        recommend: "Sports • Casual • Event",
        descKey: "mat_lycra_desc",
        recKey: "mat_lycra_rec"
    },
    "Interlock 160GSM": {
        title: "INTERLOCK",
        image: "Image/Material/Interlock.webp",
        badges: [],
        desc: "Interlock 160gsm is a smooth, double-knit jersey fabric that feels soft and comfortable on the skin. It absorbs sweat easily, fits well, and gives printed sports designs a sharp, high-end look.",
        recommend: "Sports • Corporate • Casual • Uniform • Event",
        descKey: "mat_interlock_desc",
        recKey: "mat_interlock_rec"
    },
    "Mini Eyelet 165GSM": {
        title: "MINI EYELET",
        image: "Image/Material/Mini Eyelet.webp",
        badges: [],
        desc: "Mini Eyelet 160gsm is a lightweight jersey fabric with a fine mesh pattern for smooth breathability. It dries sweat fast, feels soft, and shows off vibrant custom teamwear designs.",
        recommend: "Sports • Corporate • Casual • Uniform • Event",
        descKey: "mat_mini_desc",
        recKey: "mat_mini_rec"
    },
    "RJPK 180GSM": {
        title: "RJPK",
        image: "Image/Material/Rjpk.webp",
        badges: [],
        desc: "RJPK 180gsm is a durable, structured jersey fabric that holds its shape nicely while staying breathable. Great for sports and team uniforms that need a neat, solid look and long-lasting print quality.",
        recommend: "Sports • Corporate • Casual • Uniform • Event",
        descKey: "mat_rjpk_desc",
        recKey: "mat_rjpk_rec"
    },
    "Mesh 230GSM": {
        title: "MESH",
        image: "Image/Material/Mesh.webp",
        badges: ["Image/Material/Premium.webp"],
        desc: "Mesh 230gsm is a heavy-duty, highly breathable fabric designed for maximum airflow and cooling. Perfect for athletic jerseys and sportswear that need strong durability and comfort.",
        recommend: "Sports • Corporate • Casual • Uniform • Event",
        descKey: "mat_mesh_desc",
        recKey: "mat_mesh_rec"
    },
    "Popcorn 160GSM": {
        title: "POPCORN",
        image: "Image/Material/Popcorn.webp",
        badges: ["Image/Material/Premium.webp"],
        desc: "Popcorn 160gsm is a soft, breathable jersey fabric with a unique textured feel. It is lightweight, wicks sweat easily, and makes custom sports apparel look trendy and sharp.",
        recommend: "Sports • Casual • Event",
        descKey: "mat_popcorn_desc",
        recKey: "mat_popcorn_rec"
    }
};

function getMaterialData(label) {
    if (!label) return null;
    if (materialDetailsMap[label]) return materialDetailsMap[label];
    const lower = label.toLowerCase();
    if (lower.includes("eyelet") && !lower.includes("mini")) return materialDetailsMap["Eyelet 165GSM (BEST SELLER)"];
    if (lower.includes("diamond")) return materialDetailsMap["Diamond 160GSM"];
    if (lower.includes("lycra")) return materialDetailsMap["Lycra 280GSM"];
    if (lower.includes("interlock")) return materialDetailsMap["Interlock 160GSM"];
    if (lower.includes("mini")) return materialDetailsMap["Mini Eyelet 165GSM"];
    if (lower.includes("rjpk")) return materialDetailsMap["RJPK 180GSM"];
    if (lower.includes("mesh")) return materialDetailsMap["Mesh 230GSM"];
    if (lower.includes("popcorn")) return materialDetailsMap["Popcorn 160GSM"];
    return null;
}
window.getMaterialData = getMaterialData;

// Products State initialized immediately with fast local fallback
let products = [
    ...(catalogProducts2026 || []),
    ...(catalogProducts2025 || []),
    ...(catalogProductsEvent || []),
    ...(catalogProductsSpecs || [])
];
window.catalogProducts = products;

// Language i18n State & Controller
let currentLang = localStorage.getItem('thirtyone_lang') || 'en';

window.setLanguage = function(lang) {
    const targetLang = (lang === 'bm' || lang === 'ms') ? 'ms' : 'en';
    if (typeof i18nTranslations !== 'undefined' && i18nTranslations[targetLang]) {
        currentLang = targetLang;
        localStorage.setItem('thirtyone_lang', targetLang);
    }

    // Update active button state in header switcher
    const btnEN = document.getElementById('langBtnEN');
    const btnMS = document.getElementById('langBtnMS');
    if (btnEN && btnMS) {
        if (currentLang === 'en') {
            btnEN.classList.add('active');
            btnMS.classList.remove('active');
        } else {
            btnMS.classList.add('active');
            btnEN.classList.remove('active');
        }
    }

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (typeof i18nTranslations !== 'undefined' && i18nTranslations[currentLang] && i18nTranslations[currentLang][key]) {
            elem.innerText = i18nTranslations[currentLang][key];
        }
    });

    // Re-render active V3 modals for instant translation
    if (document.getElementById('modalMaterial')?.classList.contains('active')) {
        renderV3Material();
    }
    if (document.getElementById('modalPrinting')?.classList.contains('active')) {
        renderV3Printing(v3CurrentPrintingTab);
    }
    if (document.getElementById('modalSizeChart')?.classList.contains('active')) {
        renderV3SizeChart(v3CurrentSizeTab);
    }
};

// Immediate execution (supports ES Modules)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.setLanguage(currentLang));
} else {
    window.setLanguage(currentLang);
}

// Non-blocking database sync in the background
async function syncDatabaseProducts() {
    try {
        if (!supabase) return;
        const { data: dbProducts, error } = await supabase
            .from('products')
            .select('*')
            .in('edition', ['prod-2026', 'prod-2025', 'prod-event']);

        if (error || !dbProducts || dbProducts.length === 0) return;

        const ownDesignProduct = dbProducts.find(p => p.id === 'For Your Own Design');
        const products2026 = dbProducts.filter(p => p.edition === 'prod-2026' && p.id !== 'For Your Own Design');
        const products2025 = dbProducts.filter(p => p.edition === 'prod-2025' && p.id !== 'For Your Own Design');
        const productsEvent = dbProducts.filter(p => p.edition === 'prod-event' && p.id !== 'For Your Own Design');

        const smartSort = (arr, isEvent = false) => {
            return arr.sort((a, b) => {
                const timeA = new Date(a.created_at || 0).getTime();
                const timeB = new Date(b.created_at || 0).getTime();
                if (Math.abs(timeA - timeB) > 5000) return timeB - timeA;
                if (isEvent) {
                    const customOrder = ['WC Argentina', 'WC Brazil', 'WC Portugal', 'WC England', 'WC Spain'];
                    const indexA = customOrder.indexOf(a.id);
                    const indexB = customOrder.indexOf(b.id);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                }
                return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });
            });
        };

        smartSort(products2026);
        smartSort(products2025);
        smartSort(productsEvent, true);

        if (ownDesignProduct) {
            products2026.unshift({ ...ownDesignProduct, edition: 'prod-2026' });
            products2025.unshift({ ...ownDesignProduct, edition: 'prod-2025' });
            productsEvent.unshift({ ...ownDesignProduct, edition: 'prod-event' });
        }

        const sortedCatalogs = [
            ...products2026,
            ...products2025,
            ...productsEvent
        ].map(p => ({
            id: p.id,
            edition: p.edition,
            image: p.image,
            images: p.images,
            isNew: p.isNew || p.is_new,
            noSlide: p.noSlide || p.no_slide,
            event_tag: p.event_tag
        }));

        products = [
            ...sortedCatalogs,
            ...(catalogProductsSpecs || [])
        ];
        window.catalogProducts = products;

        // Re-render if a modal is currently open
        if (document.getElementById('modalCollection')?.classList.contains('active')) {
            renderV3Collection(v3CurrentCollectionYear, v3CurrentCollectionPage);
        } else if (document.getElementById('modalEvent')?.classList.contains('active')) {
            renderV3Event();
        }
    } catch (err) {
        console.warn("Using fallback static products:", err);
    }
}
syncDatabaseProducts();


async function initDynamicHeroMedia() {
    try {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', 'hero_setting')
            .single();

        if (error || !data || !data.image) return;

        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const existingMedia = heroSection.querySelector('.hero-bg');
        if (existingMedia) existingMedia.remove();

        const mediaUrl = resolveImagePath(data.image);
        const isVideo = data.event_tag === 'video';
        const posterUrl = (data.images && data.images[0]) ? resolveImagePath(data.images[0]) : '';

        if (isVideo) {
            const videoEl = document.createElement('video');
            videoEl.className = 'hero-bg';
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.muted = true;
            videoEl.playsInline = true;
            if (posterUrl) videoEl.poster = posterUrl;

            const sourceEl = document.createElement('source');
            sourceEl.src = mediaUrl;
            videoEl.appendChild(sourceEl);

            heroSection.insertBefore(videoEl, heroSection.firstChild);
            videoEl.play().catch(() => {});
        } else {
            const imgEl = document.createElement('img');
            imgEl.className = 'hero-bg';
            imgEl.src = mediaUrl;
            imgEl.alt = 'Hero Image';
            heroSection.insertBefore(imgEl, heroSection.firstChild);
        }
    } catch (err) {
        console.warn('Dynamic hero media init skipped:', err);
    }
}

// ==========================================
// VERSION 3 MOBILE-FIRST MODAL & LIGHTBOX ENGINE
// ==========================================

let v3CurrentCollectionYear = '2026';
let v3CurrentCollectionPage = 1;
const v3ItemsPerPage = 12;

let v3CurrentPrintingTab = 'nameset';
let v3CurrentSizeTab = 'shirt';

const v3ModalMap = {
    collection: 'modalCollection',
    event: 'modalEvent',
    material: 'modalMaterial',
    cutting: 'modalCutting',
    neck: 'modalNeck',
    printing: 'modalPrinting',
    sizechart: 'modalSizeChart'
};

// Modal Open / Close Handlers
const isDesktop = () => window.innerWidth >= 901;

window.openV3Modal = function(modalKey) {
    const key = (modalKey || '').toLowerCase();
    const modalId = v3ModalMap[key] || `modal${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    // Close any other active modal overlay first
    document.querySelectorAll('.v3-modal-overlay.active').forEach(m => {
        if (m !== modalEl) m.classList.remove('active');
    });

    // Render content when opening
    if (key === 'collection') {
        renderV3Collection(v3CurrentCollectionYear, v3CurrentCollectionPage);
    } else if (key === 'event') {
        renderV3Event();
    } else if (key === 'material') {
        renderV3Material();
    } else if (key === 'cutting') {
        renderV3Cutting();
    } else if (key === 'neck') {
        renderV3Neck();
    } else if (key === 'printing') {
        renderV3Printing(v3CurrentPrintingTab);
    } else if (key === 'sizechart') {
        renderV3SizeChart(v3CurrentSizeTab);
    }

    modalEl.classList.add('active');

    if (isDesktop()) {
        document.body.classList.add('desktop-modal-open');
        document.getElementById('appContainer')?.classList.add('desktop-panel-open');
    } else {
        document.body.classList.add('no-scroll');
    }
};

window.closeV3Modal = function(modalKey) {
    const key = (modalKey || '').toLowerCase();
    const modalId = v3ModalMap[key] || `modal${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
        modalEl.classList.remove('active');
    }

    const anyActive = document.querySelector('.v3-modal-overlay.active');
    const lightboxOverlay = document.getElementById('lightboxOverlay');

    if (!anyActive) {
        document.body.classList.remove('desktop-modal-open');
        document.getElementById('appContainer')?.classList.remove('desktop-panel-open');
        if (!lightboxOverlay || !lightboxOverlay.classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    }
};


// Close modals when clicking overlay backdrop
document.querySelectorAll('.v3-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            const lightboxOverlay = document.getElementById('lightboxOverlay');
            if (!document.querySelector('.v3-modal-overlay.active') && (!lightboxOverlay || !lightboxOverlay.classList.contains('active'))) {
                document.body.classList.remove('no-scroll');
            }
        }
    });
});

// Switch Collection Year
window.switchV3CollectionYear = function(year) {
    v3CurrentCollectionYear = year;
    v3CurrentCollectionPage = 1;
    const tab2026 = document.getElementById('v3Tab2026');
    const tab2025 = document.getElementById('v3Tab2025');
    if (tab2026 && tab2025) {
        if (year === '2026') {
            tab2026.classList.add('active');
            tab2025.classList.remove('active');
        } else {
            tab2025.classList.add('active');
            tab2026.classList.remove('active');
        }
    }
    renderV3Collection(year, 1);
};

// Switch Printing Tab
window.switchV3PrintingTab = function(tab) {
    v3CurrentPrintingTab = tab;
    document.querySelectorAll('#modalPrinting .v3-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`v3Tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderV3Printing(tab);
};

// Switch Size Chart Tab
window.switchV3SizeTab = function(tab) {
    v3CurrentSizeTab = tab;
    document.querySelectorAll('#modalSizeChart .v3-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`v3Tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderV3SizeChart(tab);
};

// Helper to safely escape single quotes for inline JS attributes
function escapeJsAttr(str) {
    return (str || '').replace(/'/g, "\\'");
}

// Render Collection Grid
function renderV3Collection(year, page) {
    const gridEl = document.getElementById('v3CollectionGrid');
    const paginationEl = document.getElementById('v3CollectionPagination');
    if (!gridEl) return;

    const editionKey = year === '2026' ? 'prod-2026' : 'prod-2025';
    let list = (typeof products !== 'undefined' && products && products.length > 0)
        ? products.filter(p => p.edition === editionKey && p.id !== 'For Your Own Design')
        : (year === '2026' ? catalogProducts2026 : catalogProducts2025);

    const totalPages = Math.ceil(list.length / v3ItemsPerPage) || 1;
    v3CurrentCollectionPage = Math.max(1, Math.min(page, totalPages));

    const startIndex = (v3CurrentCollectionPage - 1) * v3ItemsPerPage;
    const pageItems = list.slice(startIndex, startIndex + v3ItemsPerPage);

    let html = '';
    pageItems.forEach(item => {
        const ref = item.id || '';
        const imgSrc = resolveImagePath(item.image);
        const isNew = !!(item.isNew || item.is_new);
        const refEsc = escapeJsAttr(ref);
        const imgEsc = escapeJsAttr(imgSrc);

        html += `
            <div class="v3-product-card" onclick="openV3LightboxFromCard('${refEsc}', 'collection', '${imgEsc}')">
                <div class="v3-product-img-wrap">
                    ${isNew ? '<span class="v3-badge-new">New</span>' : ''}
                    <img src="${imgSrc}" alt="${ref}" class="v3-product-img" loading="lazy">
                </div>
                <div class="v3-product-footer">
                    <span class="v3-product-ref">${ref}</span>
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;

    // Pagination
    if (totalPages > 1 && paginationEl) {
        paginationEl.innerHTML = `
            <button class="v3-page-btn" ${v3CurrentCollectionPage <= 1 ? 'disabled' : ''} onclick="renderV3Collection('${year}', ${v3CurrentCollectionPage - 1})" aria-label="Previous Page">‹</button>
            <span class="v3-page-info">${v3CurrentCollectionPage} / ${totalPages}</span>
            <button class="v3-page-btn" ${v3CurrentCollectionPage >= totalPages ? 'disabled' : ''} onclick="renderV3Collection('${year}', ${v3CurrentCollectionPage + 1})" aria-label="Next Page">›</button>
        `;
        paginationEl.style.display = 'flex';
    } else if (paginationEl) {
        paginationEl.innerHTML = '';
        paginationEl.style.display = 'none';
    }
}
window.renderV3Collection = renderV3Collection;

// Render Event Grid
function renderV3Event() {
    const gridEl = document.getElementById('v3EventGrid');
    if (!gridEl) return;

    let list = (typeof products !== 'undefined' && products && products.length > 0)
        ? products.filter(p => p.edition === 'prod-event' && p.id !== 'For Your Own Design')
        : catalogProductsEvent;

    let html = '';
    list.forEach(item => {
        const ref = item.id || '';
        const rawImgs = item.images && Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image];
        const frontImg = resolveImagePath(rawImgs[0]);
        const hasMultiple = rawImgs.length > 1;
        const tagText = item.event_tag || 'Event Edition';
        const refEsc = escapeJsAttr(ref);
        const imgEsc = escapeJsAttr(frontImg);

        html += `
            <div class="v3-product-card" onclick="openV3LightboxFromCard('${refEsc}', 'event', '${imgEsc}')">
                <div class="v3-product-img-wrap">
                    <span class="v3-badge-new" style="background:#111;">${tagText}</span>
                    ${hasMultiple ? '<span class="v3-badge-multi">2 Photos</span>' : ''}
                    <img src="${frontImg}" alt="${ref}" class="v3-product-img" loading="lazy">
                </div>
                <div class="v3-product-footer">
                    <span class="v3-product-ref">${ref}</span>
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;
}

// Render Material List
function renderV3Material() {
    const listEl = document.getElementById('v3MaterialList');
    if (!listEl) return;

    const materials = (catalogProductsSpecs || []).filter(p => p.edition === 'prod-material');
    const lang = localStorage.getItem('thirtyone_lang') || 'en';

    let html = '';
    materials.forEach((mat, index) => {
        const imgSrc = resolveImagePath(mat.image);
        const dataKey = getMaterialData(mat.title);

        let badgesHtml = '';
        if (dataKey && dataKey.badges && Array.isArray(dataKey.badges)) {
            dataKey.badges.forEach(badgePath => {
                const badgeUrl = resolveImagePath(badgePath);
                badgesHtml += `<img src="${badgeUrl}" class="v3-mat-badge-img" alt="Badge" loading="lazy">`;
            });
        } else if (mat.icons && Array.isArray(mat.icons)) {
            mat.icons.forEach(ic => {
                if (ic.toLowerCase().includes('recommend')) badgesHtml += `<img src="${resolveImagePath('Image/Material/Recommend.webp')}" class="v3-mat-badge-img" alt="Recommend" loading="lazy">`;
                else if (ic.toLowerCase().includes('hot')) badgesHtml += `<img src="${resolveImagePath('Image/Material/Hot Sale.webp')}" class="v3-mat-badge-img" alt="Hot Sale" loading="lazy">`;
                else if (ic.toLowerCase().includes('premium')) badgesHtml += `<img src="${resolveImagePath('Image/Material/Premium.webp')}" class="v3-mat-badge-img" alt="Premium" loading="lazy">`;
            });
        }

        const descText = (dataKey && i18nTranslations[lang] && i18nTranslations[lang][dataKey.descKey]) ? i18nTranslations[lang][dataKey.descKey] : mat.description;
        const recText = (dataKey && i18nTranslations[lang] && i18nTranslations[lang][dataKey.recKey]) ? i18nTranslations[lang][dataKey.recKey] : mat.recommend;
        const titleEsc = escapeJsAttr(mat.title);

        html += `
            <div class="v3-material-card" onclick="openV3CategoryLightbox('material', ${index})">
                <div class="v3-mat-img-wrap">
                    <img src="${imgSrc}" alt="${mat.title}" class="v3-mat-img" loading="lazy">
                </div>
                <div class="v3-mat-info">
                    <div class="v3-mat-title-row">
                        <span class="v3-mat-title">${mat.title}</span>
                        ${badgesHtml ? `<div class="v3-mat-badges-wrap">${badgesHtml}</div>` : ''}
                    </div>
                    <p class="v3-mat-desc">${descText}</p>
                    ${recText ? `<div class="v3-mat-rec-block"><div class="v3-mat-rec-label">Recommend:</div><div class="v3-mat-rec-text">${recText}</div></div>` : ''}
                </div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}

// Render Cutting Grid
function renderV3Cutting() {
    const gridEl = document.getElementById('v3CuttingGrid');
    if (!gridEl) return;

    const cuttings = (catalogProductsSpecs || []).filter(p => p.edition === 'prod-cutting');
    let html = '';

    cuttings.forEach((c, index) => {
        const imgSrc = resolveImagePath(c.image);
        const title = c.title || c.id;

        html += `
            <div class="v3-spec-card" onclick="openV3CategoryLightbox('cutting', ${index})">
                <div class="v3-spec-img-wrap">
                    <img src="${imgSrc}" alt="${title}" class="v3-spec-img" loading="lazy">
                </div>
                <div class="v3-spec-footer">
                    <span class="v3-spec-title">${title}</span>
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;
}

// Render Necklines Grid
function renderV3Neck() {
    const gridEl = document.getElementById('v3NeckGrid');
    if (!gridEl) return;

    const necks = (catalogProductsSpecs || []).filter(p => p.edition === 'prod-neck');
    let html = '';

    necks.forEach((n, index) => {
        const imgSrc = resolveImagePath(n.image);
        const title = n.title || n.id;

        html += `
            <div class="v3-spec-card" onclick="openV3CategoryLightbox('neck', ${index})">
                <div class="v3-spec-img-wrap">
                    <img src="${imgSrc}" alt="${title}" class="v3-spec-img" loading="lazy">
                </div>
                <div class="v3-spec-footer">
                    <span class="v3-spec-title">${title}</span>
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;
}

// Render Printing Tabs
function renderV3Printing(tab) {
    const gridEl = document.getElementById('v3PrintingGrid');
    if (!gridEl) return;

    let targetEdition = 'prod-nameset';
    if (tab === 'sponsor') targetEdition = 'prod-sponsor';
    if (tab === 'guide') targetEdition = 'prod-placementguide';

    const items = (catalogProductsSpecs || []).filter(p => p.edition === targetEdition);
    let html = '';

    if (tab === 'guide') {
        const guideItem = items[0] || { id: 'Placement Guide', image: 'Image/Placement Guide/Placement Guide.webp' };
        const imgSrc = resolveImagePath(guideItem.image);
        html = `
            <div class="v3-spec-card" style="grid-column: 1 / -1;" onclick="openV3CategoryLightbox('printing', 0, 'guide')">
                <div class="v3-spec-img-wrap wide">
                    <img src="${imgSrc}" alt="Placement Guide" class="v3-spec-img" loading="lazy">
                </div>
                <div class="v3-spec-footer" style="padding: 20px 24px; text-align: left;">
                    <span class="v3-spec-title" style="display: block; text-align: center; margin-bottom: 20px; font-weight: 800;">Official Placement Guide</span>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 0.8rem; color: var(--text-muted); line-height: 2.2; font-family: var(--font-secondary);">
                        <div>
                            <strong style="color: var(--text-dark); display: block; margin-bottom: 6px;">FRONT</strong>
                            A = Left Chest<br>
                            B = Center Chest<br>
                            F = Right Sleeve<br>
                            G = Left Sleeve<br>
                            I = Right Collarbone<br>
                            J = Left Collarbone<br>
                            K = Bottom Right<br>
                            L = Bottom Left
                        </div>
                        <div>
                            <strong style="color: var(--text-dark); display: block; margin-bottom: 6px;">BACK</strong>
                            C = Upper Back<br>
                            D = Center Back<br>
                            E = Lower Back<br>
                            H = Back Neck
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        items.forEach((item, index) => {
            const imgSrc = resolveImagePath(item.image);
            const label = item.id || (tab === 'nameset' ? `Font Set ${index + 1}` : `Sponsor Layout ${index + 1}`);

            html += `
                <div class="v3-spec-card" onclick="openV3CategoryLightbox('printing', ${index}, '${tab}')">
                    <div class="v3-spec-img-wrap">
                        <img src="${imgSrc}" alt="${label}" class="v3-spec-img" loading="lazy">
                    </div>
                </div>
            `;
        });
    }

    gridEl.innerHTML = html;
}

// Render Size Chart Tabs
function renderV3SizeChart(tab) {
    const gridEl = document.getElementById('v3SizeChartGrid');
    if (!gridEl) return;

    let targetEdition = 'prod-sizechart-shirt';
    if (tab === 'pants') targetEdition = 'prod-sizechart-pants';
    if (tab === 'muslimah') targetEdition = 'prod-sizechart-muslimah';

    const items = (catalogProductsSpecs || []).filter(p => p.edition === targetEdition);
    let html = '';

    items.forEach((item, index) => {
        const imgSrc = resolveImagePath(item.image);
        let title = item.id;
        if (item.id === 'SCS (1)') title = 'Standard Shirt Sizing (XS - 8XL)';
        else if (item.id === 'SCS (2)') title = 'Raglan Athletic Sizing';
        else if (item.id === 'SCS (5)') title = 'Kids Sizing (2Y - 14Y)';
        else if (item.id === 'SCS (6)') title = 'Singlet & Running Fit';
        else if (item.id === 'SCS (7)') title = 'Polo Collar Sizing';
        else if (item.id === 'SCP (1)') title = 'Short Pants Sizing';
        else if (item.id === 'SCP (2)') title = 'Tracksuit Long Pants Sizing';
        else if (item.id === 'SCM (1)') title = 'Muslimah Adult Modest Sizing';
        else if (item.id === 'SCM (2)') title = 'Muslimah Kids Sizing';

        html += `
            <div class="v3-spec-card" onclick="openV3CategoryLightbox('sizechart', ${index}, '${tab}')">
                <div class="v3-spec-img-wrap full-chart">
                    <img src="${imgSrc}" alt="${title}" class="v3-spec-img" loading="lazy">
                </div>
            </div>
        `;
    });

    gridEl.innerHTML = html;
}

// ==========================================
// V3 LIGHTBOX CONTROLLERS & ACTIONS
// ==========================================

let v3LightboxCategoryItems = [];
let v3LightboxIndex = 0;
let v3LightboxImageIndex = 0;
let v3LightboxImages = [];

function renderV3LightboxActiveIndex() {
    if (!v3LightboxCategoryItems || v3LightboxCategoryItems.length === 0) return;

    const item = v3LightboxCategoryItems[v3LightboxIndex];
    if (!item) return;

    window.currentV3Ref = item.ref || item.title || 'Preview';

    const rawImgs = (item.images && Array.isArray(item.images) && item.images.length > 0)
        ? item.images
        : [item.image];

    v3LightboxImages = rawImgs.map(img => {
        if (!img) return '';
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('./') || img.startsWith('/')) {
            return img;
        }
        return resolveImagePath(img);
    });

    if (v3LightboxImageIndex >= v3LightboxImages.length) v3LightboxImageIndex = 0;
    if (v3LightboxImageIndex < 0) v3LightboxImageIndex = v3LightboxImages.length - 1;

    const activeImgSrc = v3LightboxImages[v3LightboxImageIndex];

    const lightboxImg = document.getElementById('lightboxImg');
    const wrapper = document.querySelector('.v3-lightbox-wrapper');
    const refDisplay = document.getElementById('lightboxRefDisplay');
    const disclaimerBox = document.getElementById('lightboxDisclaimerBox');
    const btnStack = document.getElementById('lightboxBtnStack');
    const customContent = document.getElementById('v3LightboxCustomContent');
    const innerPrev = document.getElementById('lightboxInnerPrev');
    const innerNext = document.getElementById('lightboxInnerNext');

    if (lightboxImg) {
        lightboxImg.src = activeImgSrc;
        if (window.resetLightboxZoom) window.resetLightboxZoom();
    }

    // Single stack vs Split layout & Large Lightbox modifier (Printing & Size Chart)
    if (wrapper) {
        if (item.isSingleStack) {
            wrapper.classList.add('single-stack');
        } else {
            wrapper.classList.remove('single-stack');
        }

        if (item.type === 'printing' || item.type === 'sizechart') {
            wrapper.classList.add('v3-lightbox-large');
        } else {
            wrapper.classList.remove('v3-lightbox-large');
        }
    }

    // Title / Ref with side-by-side badges
    if (refDisplay) {
        if (item.badgesHtml) {
            refDisplay.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; flex-wrap: wrap;">
                    <span style="font-family: var(--font-primary); font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dark);">${item.title || ''}</span>
                    <div style="display: inline-flex; align-items: center; gap: 4px;">${item.badgesHtml}</div>
                </div>
            `;
        } else {
            refDisplay.innerText = item.title || '';
        }
        refDisplay.style.display = item.title ? 'block' : 'none';
    }

    // Custom HTML (Material description/badges or Placement Guide details)
    if (customContent) {
        if (item.customHtml) {
            customContent.innerHTML = item.customHtml;
            customContent.style.display = 'block';
        } else {
            customContent.innerHTML = '';
            customContent.style.display = 'none';
        }
    }

    // Disclaimer & Buttons (only for collection/event)
    if (disclaimerBox) disclaimerBox.style.display = (item.type === 'collection' || item.type === 'event') ? 'block' : 'none';
    if (btnStack) btnStack.style.display = (item.type === 'collection' || item.type === 'event') ? 'flex' : 'none';

    // Hide details panel completely if there are no titles, descriptions, or action buttons
    const detailsPanel = document.querySelector('.v3-lightbox-details');
    if (detailsPanel) {
        const hasDetails = Boolean(
            (item.title && item.title.trim() !== '') ||
            (item.customHtml && item.customHtml.trim() !== '') ||
            (item.type === 'collection' || item.type === 'event')
        );
        detailsPanel.style.display = hasDetails ? 'flex' : 'none';
    }

    // Dots indicator (for multi-image product angles, e.g. Worldcup)
    updateLightboxDots(v3LightboxImages, v3LightboxImageIndex);

    // Inner navigation arrows (Only shown when product has multiple photo angles, e.g. Argentina, Brazil, Portugal)
    if (innerPrev && innerNext) {
        if (v3LightboxImages.length > 1) {
            innerPrev.style.display = 'flex';
            innerPrev.style.opacity = '1';
            innerPrev.style.pointerEvents = 'auto';
            innerNext.style.display = 'flex';
            innerNext.style.opacity = '1';
            innerNext.style.pointerEvents = 'auto';
        } else {
            innerPrev.style.display = 'none';
            innerNext.style.display = 'none';
        }
    }
}

window.switchV3LightboxSlide = function(direction) {
    if (!v3LightboxImages || v3LightboxImages.length <= 1) return;

    if (direction === 'next') {
        v3LightboxImageIndex = (v3LightboxImageIndex + 1) % v3LightboxImages.length;
    } else {
        v3LightboxImageIndex = (v3LightboxImageIndex - 1 + v3LightboxImages.length) % v3LightboxImages.length;
    }

    renderV3LightboxActiveIndex();
};

function updateLightboxDots(imgs, activeIdx) {
    const dotsContainer = document.getElementById('v3LightboxDots');
    if (!dotsContainer) return;

    if (imgs && imgs.length > 1) {
        let dotsHtml = '';
        for (let i = 0; i < imgs.length; i++) {
            dotsHtml += `<span class="v3-dot ${i === activeIdx ? 'active' : ''}" onclick="jumpV3LightboxImageAngle(${i})" style="cursor: pointer;"></span>`;
        }
        dotsContainer.innerHTML = dotsHtml;
        dotsContainer.style.display = 'flex';
    } else {
        dotsContainer.innerHTML = '';
        dotsContainer.style.display = 'none';
    }
}

window.jumpV3LightboxImageAngle = function(imgIdx) {
    v3LightboxImageIndex = imgIdx;
    renderV3LightboxActiveIndex();
};

window.openV3CategoryLightbox = function(category, activeIndex, tabName) {
    v3LightboxCategoryItems = [];
    const lang = localStorage.getItem('thirtyone_lang') || 'en';

    if (category === 'material') {
        const materials = (typeof catalogProductsSpecs !== 'undefined' ? catalogProductsSpecs : []).filter(p => p.edition === 'prod-material');

        materials.forEach(mat => {
            const imgSrc = resolveImagePath(mat.image);
            const dataKey = getMaterialData(mat.title);
            let badgesHtml = '';
            if (dataKey && dataKey.badges && Array.isArray(dataKey.badges)) {
                dataKey.badges.forEach(badgePath => {
                    const badgeUrl = resolveImagePath(badgePath);
                    badgesHtml += `<img src="${badgeUrl}" class="v3-mat-badge-img" alt="Badge" style="height: 20px; width: auto;" loading="lazy">`;
                });
            } else if (mat.icons && Array.isArray(mat.icons)) {
                mat.icons.forEach(ic => {
                    if (ic.toLowerCase().includes('recommend')) badgesHtml += `<img src="${resolveImagePath('Image/Material/Recommend.webp')}" class="v3-mat-badge-img" alt="Recommend" style="height: 20px; width: auto;" loading="lazy">`;
                    else if (ic.toLowerCase().includes('hot')) badgesHtml += `<img src="${resolveImagePath('Image/Material/Hot Sale.webp')}" class="v3-mat-badge-img" alt="Hot Sale" style="height: 20px; width: auto;" loading="lazy">`;
                    else if (ic.toLowerCase().includes('premium')) badgesHtml += `<img src="${resolveImagePath('Image/Material/Premium.webp')}" class="v3-mat-badge-img" alt="Premium" style="height: 20px; width: auto;" loading="lazy">`;
                });
            }

            const descText = (dataKey && i18nTranslations[lang] && i18nTranslations[lang][dataKey.descKey]) ? i18nTranslations[lang][dataKey.descKey] : mat.description;
            const recText = (dataKey && i18nTranslations[lang] && i18nTranslations[lang][dataKey.recKey]) ? i18nTranslations[lang][dataKey.recKey] : mat.recommend;

            const customHtml = `
                <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                    <p style="font-family: var(--font-secondary); font-size: 0.82rem; color: #444444; line-height: 1.5; margin: 0;">${descText || ''}</p>
                    ${recText ? `<div style="background: rgba(197, 27, 39, 0.05); border: 1px dashed var(--primary-red); padding: 8px 12px; margin-top: 4px;"><strong style="font-family: var(--font-primary); font-size: 0.72rem; color: var(--primary-red); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 2px;">Recommend:</strong><span style="font-family: var(--font-secondary); font-size: 0.78rem; color: #333333;">${recText}</span></div>` : ''}
                </div>
            `;

            v3LightboxCategoryItems.push({
                type: 'material',
                title: mat.title,
                image: imgSrc,
                isSingleStack: false, // 60/40 Split Layout
                badgesHtml: badgesHtml,
                customHtml: customHtml
            });
        });

    } else if (category === 'cutting') {
        const cuttings = (typeof catalogProductsSpecs !== 'undefined' ? catalogProductsSpecs : []).filter(p => p.edition === 'prod-cutting');
        cuttings.forEach(c => {
            v3LightboxCategoryItems.push({
                type: 'cutting',
                title: c.title || c.id,
                image: resolveImagePath(c.image),
                isSingleStack: true, // Title BELOW image
                customHtml: ''
            });
        });

    } else if (category === 'neck') {
        const necks = (typeof catalogProductsSpecs !== 'undefined' ? catalogProductsSpecs : []).filter(p => p.edition === 'prod-neck');
        necks.forEach(n => {
            v3LightboxCategoryItems.push({
                type: 'neck',
                title: n.title || n.id,
                image: resolveImagePath(n.image),
                isSingleStack: true, // Title BELOW image
                customHtml: ''
            });
        });

    } else if (category === 'printing') {
        let targetEdition = 'prod-nameset';
        if (tabName === 'sponsor') targetEdition = 'prod-sponsor';
        if (tabName === 'guide') targetEdition = 'prod-placementguide';

        const items = (typeof catalogProductsSpecs !== 'undefined' ? catalogProductsSpecs : []).filter(p => p.edition === targetEdition);

        if (tabName === 'guide') {
            const guideItem = items[0] || { id: 'Placement Guide', image: 'Image/Placement Guide/Placement Guide.webp' };
            const customHtml = `
                <div style="width: 100%; text-align: center;">
                    <span style="font-family: var(--font-primary); font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dark); display: block; margin-bottom: 14px;">Official Placement Guide</span>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.8rem; color: #444; line-height: 2; font-family: var(--font-secondary); text-align: left;">
                        <div style="background: #F9F9F8; padding: 12px; border: 1px solid var(--border-color);">
                            <strong style="color: var(--primary-red); display: block; margin-bottom: 4px; font-family: var(--font-primary);">FRONT</strong>
                            A = Left Chest<br>
                            B = Center Chest<br>
                            F = Right Sleeve<br>
                            G = Left Sleeve<br>
                            I = Right Collarbone<br>
                            J = Left Collarbone<br>
                            K = Bottom Right<br>
                            L = Bottom Left
                        </div>
                        <div style="background: #F9F9F8; padding: 12px; border: 1px solid var(--border-color);">
                            <strong style="color: var(--primary-red); display: block; margin-bottom: 4px; font-family: var(--font-primary);">BACK</strong>
                            C = Upper Back<br>
                            D = Center Back<br>
                            E = Lower Back<br>
                            H = Back Neck
                        </div>
                    </div>
                </div>
            `;
            v3LightboxCategoryItems.push({
                type: 'printing',
                title: '',
                image: resolveImagePath(guideItem.image),
                isSingleStack: true, // Details BELOW image
                customHtml: customHtml
            });
        } else {
            items.forEach((item, idx) => {
                v3LightboxCategoryItems.push({
                    type: 'printing',
                    title: '', // No title box below image for sponsor/nameset
                    image: resolveImagePath(item.image),
                    isSingleStack: true,
                    customHtml: ''
                });
            });
        }

    } else if (category === 'sizechart') {
        let targetEdition = 'prod-sizechart-shirt';
        if (tabName === 'pants') targetEdition = 'prod-sizechart-pants';
        if (tabName === 'muslimah') targetEdition = 'prod-sizechart-muslimah';

        const items = (typeof catalogProductsSpecs !== 'undefined' ? catalogProductsSpecs : []).filter(p => p.edition === targetEdition);
        items.forEach(item => {
            v3LightboxCategoryItems.push({
                type: 'sizechart',
                title: '', // No title box below image for sizechart
                image: resolveImagePath(item.image),
                isSingleStack: true,
                customHtml: ''
            });
        });
    }

    if (v3LightboxCategoryItems.length === 0) return;
    v3LightboxIndex = Math.max(0, Math.min(activeIndex, v3LightboxCategoryItems.length - 1));
    v3LightboxImageIndex = 0;

    renderV3LightboxActiveIndex();

    const lightboxOverlay = document.getElementById('lightboxOverlay');
    if (lightboxOverlay) {
        lightboxOverlay.style.zIndex = '999999';
        lightboxOverlay.style.display = 'flex';
        lightboxOverlay.style.opacity = '1';
        lightboxOverlay.style.pointerEvents = 'auto';
        lightboxOverlay.classList.add('active');
    }
    document.body.classList.add('no-scroll');
};

window.openV3LightboxFromCard = function(ref, sourceContext, fallbackImgSrc) {
    const cleanRef = (ref || '').trim();

    let rawProductsList = [];
    if (sourceContext === 'event') {
        rawProductsList = (typeof catalogProductsEvent !== 'undefined' ? catalogProductsEvent : []);
    } else if (typeof v3CurrentCollectionYear !== 'undefined' && v3CurrentCollectionYear === '2026') {
        rawProductsList = (typeof catalogProducts2026 !== 'undefined' ? catalogProducts2026 : []);
    } else {
        rawProductsList = (typeof catalogProducts2025 !== 'undefined' ? catalogProducts2025 : []);
    }

    if (!rawProductsList || rawProductsList.length === 0) {
        rawProductsList = [
            ...(typeof catalogProducts2026 !== 'undefined' ? catalogProducts2026 : []),
            ...(typeof catalogProducts2025 !== 'undefined' ? catalogProducts2025 : []),
            ...(typeof catalogProductsEvent !== 'undefined' ? catalogProductsEvent : [])
        ];
    }

    const validProducts = rawProductsList.filter(p => p && p.id && p.id !== 'For Your Own Design');

    v3LightboxCategoryItems = validProducts.map(p => {
        const pRef = (p.id || '').trim();
        const displayTitle = (pRef.startsWith('Design') || pRef.startsWith('WC')) ? pRef : `Design: ${pRef}`;

        const rawImgs = [];
        if (p.image) rawImgs.push(p.image);
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => {
                if (img && !rawImgs.includes(img)) rawImgs.push(img);
            });
        }

        return {
            type: sourceContext || 'collection',
            ref: pRef,
            title: displayTitle,
            image: p.image || fallbackImgSrc,
            images: rawImgs.length > 0 ? rawImgs : [p.image || fallbackImgSrc],
            isSingleStack: false,
            customHtml: ''
        };
    });

    const clickedIdx = v3LightboxCategoryItems.findIndex(item => item.ref.toLowerCase() === cleanRef.toLowerCase());

    if (clickedIdx >= 0) {
        v3LightboxIndex = clickedIdx;
    } else {
        const displayTitle = (cleanRef.startsWith('Design') || cleanRef.startsWith('WC')) ? cleanRef : `Design: ${cleanRef}`;
        v3LightboxCategoryItems = [{
            type: sourceContext || 'collection',
            ref: cleanRef,
            title: displayTitle,
            image: fallbackImgSrc,
            images: [fallbackImgSrc],
            isSingleStack: false,
            customHtml: ''
        }];
        v3LightboxIndex = 0;
    }

    v3LightboxImageIndex = 0;

    renderV3LightboxActiveIndex();

    const lightboxOverlay = document.getElementById('lightboxOverlay');
    if (lightboxOverlay) {
        lightboxOverlay.style.zIndex = '999999';
        lightboxOverlay.style.display = 'flex';
        lightboxOverlay.style.opacity = '1';
        lightboxOverlay.style.pointerEvents = 'auto';
        lightboxOverlay.classList.add('active');
    }
    document.body.classList.add('no-scroll');
};

window.openV3LightboxDirect = function(imgSrc, title, type) {
    openV3CategoryLightbox(type || 'cutting', 0);
};

// Attach arrow click handlers
document.getElementById('lightboxPrev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.switchV3LightboxSlide('prev');
});

document.getElementById('lightboxNext')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.switchV3LightboxSlide('next');
});

// Mobile Touch Swipe Listener
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;

const lightboxOverlayEl = document.getElementById('lightboxOverlay');
if (lightboxOverlayEl) {

// Mobile Pinch-to-Zoom on Lightbox Image
let currentZoom = 1;
let initialDistance = null;
let currentTranslateX = 0;
let currentTranslateY = 0;
let lastTranslateX = 0;
let lastTranslateY = 0;
const lightboxImgEl = document.getElementById('lightboxImg');

window.resetLightboxZoom = function() {
    if (lightboxImgEl) {
        currentZoom = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
        lightboxImgEl.style.transform = `translate(0px, 0px) scale(1)`;
    }
};

if (lightboxOverlayEl && lightboxImgEl) {
    lightboxOverlayEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        } else if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
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
            lightboxImgEl.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentZoom})`;
            initialDistance = currentDistance;
        } else if (e.touches.length === 1 && currentZoom > 1) {
            e.preventDefault(); // Prevent scrolling when panning
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - touchStartX;
            const deltaY = currentY - touchStartY;
            
            // Allow panning based on delta from start, added to last pan position
            currentTranslateX = lastTranslateX + (deltaX / currentZoom);
            currentTranslateY = lastTranslateY + (deltaY / currentZoom);
            
            lightboxImgEl.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentZoom})`;
        }
    }, { passive: false });

    lightboxOverlayEl.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialDistance = null;
        }
        if (e.touches.length === 0 && currentZoom > 1) {
            lastTranslateX = currentTranslateX;
            lastTranslateY = currentTranslateY;
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

}

function closeLightbox() {
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const content = document.querySelector('.lightbox-content');
    const navPrev = document.getElementById('lightboxPrev');
    const navNext = document.getElementById('lightboxNext');
    const lightboxImg = document.getElementById('lightboxImg');

    // Reset Zoom
    if (window.resetLightboxZoom) window.resetLightboxZoom();

    if (content) content.style.opacity = '0';
    if (navPrev) navPrev.style.opacity = '0';
    if (navNext) navNext.style.opacity = '0';

    if (lightboxOverlay) {
        lightboxOverlay.classList.remove('active');
        lightboxOverlay.style.opacity = '0';
        lightboxOverlay.style.pointerEvents = 'none';
    }
    
    if (!document.querySelector('.v3-modal-overlay.active')) {
        document.body.classList.remove('no-scroll');
    }

    setTimeout(() => {
        if (lightboxOverlay) lightboxOverlay.style.display = 'none';
        if (lightboxImg) lightboxImg.src = '';
        if (content) content.style.opacity = '1';
        if (navPrev) {
            navPrev.style.opacity = '';
            navPrev.style.display = '';
        }
        if (navNext) {
            navNext.style.opacity = '';
            navNext.style.display = '';
        }
    }, 300);
}
window.closeLightbox = closeLightbox;

document.getElementById('lightboxOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightboxOverlay' || e.target.classList.contains('v3-lightbox-wrapper') || e.target.classList.contains('v3-lightbox-hint-outside')) {
        closeLightbox();
    }
});

// Helper to update copy button feedback
function triggerCopyButtonSuccess() {
    const copyBtn = document.getElementById('btnCopyMockup');
    if (!copyBtn) return;

    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    const copiedText = (i18nTranslations[lang]?.v3_btn_copied) || 'Copied to Clipboard!';
    const originalText = (i18nTranslations[lang]?.v3_btn_copy_image) || 'Copy Mockup Image';

    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span data-i18n="v3_btn_copied">${copiedText}</span>
    `;

    setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span data-i18n="v3_btn_copy_image">${originalText}</span>
        `;
    }, 2500);
}

// Copy Mockup Image to Clipboard
window.copyCurrentMockupImage = async function() {
    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    const failMsg = (i18nTranslations[lang]?.v3_toast_copy_failed) || 'Please long-press image to copy.';
    const lightboxImg = document.getElementById('lightboxImg');

    if (!lightboxImg || !lightboxImg.src) {
        showV3Toast(failMsg);
        return;
    }

    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = lightboxImg.src;

        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 600;
                canvas.height = img.naturalHeight || 600;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob(async (pngBlob) => {
                    if (pngBlob && navigator.clipboard && navigator.clipboard.write) {
                        try {
                            const item = new ClipboardItem({ 'image/png': pngBlob });
                            await navigator.clipboard.write([item]);
                            triggerCopyButtonSuccess();
                        } catch (err) {
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                await navigator.clipboard.writeText(`ThirtyOne Lab Design Ref: ${window.currentV3Ref || ''}`);
                            }
                            triggerCopyButtonSuccess();
                        }
                    } else if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(`ThirtyOne Lab Design Ref: ${window.currentV3Ref || ''}`);
                        triggerCopyButtonSuccess();
                    } else {
                        triggerCopyButtonSuccess();
                    }
                }, 'image/png');
            } catch (err) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(`ThirtyOne Lab Design Ref: ${window.currentV3Ref || ''}`);
                }
                triggerCopyButtonSuccess();
            }
        };

        img.onerror = () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(`ThirtyOne Lab Design Ref: ${window.currentV3Ref || ''}`);
            }
            triggerCopyButtonSuccess();
        };
    } catch (e) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(`ThirtyOne Lab Design Ref: ${window.currentV3Ref || ''}`);
            }
            triggerCopyButtonSuccess();
        } catch (err) {
            showV3Toast(failMsg);
        }
    }
};

// WhatsApp Direct Inquiry
window.inquireCurrentMockupWhatsApp = function() {
    const ref = window.currentV3Ref || 'Custom Jersey';
    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    const message = (lang === 'ms')
        ? `Salam / Hai ThirtyOne Lab! Saya berminat dengan rekaan jersi ini: *${ref}*.\n\nBoleh saya tahu lebih lanjut mengenai tempahan & harga?`
        : `Hi ThirtyOne Lab! I am interested in this jersey design: *${ref}*.\n\nCould you assist me with the order details and quote?`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/601125614436?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
};

// Toast notification
function showV3Toast(msg) {
    const toastEl = document.getElementById('v3Toast');
    const msgEl = document.getElementById('v3ToastMsg');
    if (!toastEl || !msgEl) return;

    msgEl.innerText = msg;
    toastEl.classList.add('show');

    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3200);
}
window.showV3Toast = showV3Toast;

// Catalog State
const cardsPerPage = 16;
const catalogGrid = document.getElementById('catalogGrid');

if (catalogGrid) {
    // Generate and inject HTML if legacy catalogGrid exists
    if (generateHtmlForProduct) {
        catalogGrid.innerHTML = products.map(generateHtmlForProduct).join('\n');
    } else {
        catalogGrid.innerHTML = '';
    }
}

const allCards2026 = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-2026')) : [];
const allCards2025 = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-2025')) : [];
const allCardsWC = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-event')) : [];
const allCardsMaterial = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-material')) : [];
const allCardsNeck = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-neck')) : [];
const allCardsCutting = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-cutting')) : [];
const allCardsNameset = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-nameset')) : [];
const allCardsSponsor = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-sponsor')) : [];
const allCardsSizeShirt = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-sizechart-shirt')) : [];
const allCardsSizePants = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-sizechart-pants')) : [];
const allCardsSizeMuslimah = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-sizechart-muslimah')) : [];
const allCardsPlacement = catalogGrid ? Array.from(catalogGrid.getElementsByClassName('prod-placementguide')) : [];

let currentEdition = '2026';
let currentPage = 1;
let currentCards = [];

// Helper to assign categories, names, and starting prices to designs
function getProductCategoryAndName(ref, isWorldCup) {
    if (ref === 'For Your Own Design') {
        return {
            category: 'Sports',
            name: 'For Your Custom Design',
            price: 'From RM29.00'
        };
    }

    if (isWorldCup) {
        return {
            category: 'Sports',
            name: ref,
            price: 'From RM39.00'
        };
    }

    const cleanNumStr = ref.replace(/^(25#|26#|25-|26-)/, '');
    const num = parseInt(cleanNumStr) || 0;
    let category = 'Sports';

    // Deterministic category assignment matching the requested categories
    if (num % 5 === 0) {
        category = 'Event';
    } else if (num % 4 === 0) {
        category = 'Uniform';
    } else if (num % 3 === 0) {
        category = 'Casual';
    } else if (num % 2 === 0) {
        category = 'Corporate';
    } else {
        category = 'Sports';
    }

    const price = `From RM${29 + (num % 3) * 5}.00`;
    const name = (ref.startsWith('25#') || ref.startsWith('26#') || ref.startsWith('25-') || ref.startsWith('26-')) ? ref : `26-${ref}`;

    return { category, name, price };
}

let activeCategoryFilter = null;

function filterByCategory(category) {
    activeCategoryFilter = category ? category.toLowerCase() : null;

    // Switch to 'all' edition if currently on non-catalog screens (e.g. printing, sizechart, specs)
    if (['material','cutting','neck','nameset','sponsor','placementguide','sizechart-shirt','sizechart-pants','sizechart-muslimah'].includes(currentEdition)) {
        currentEdition = 'all';
        const allEditionBtns = document.querySelectorAll('.edition-btn, .spec-btn, .sub-spec-btn');
        allEditionBtns.forEach(btn => btn.classList.remove('active'));
        document.getElementById('btnCollection')?.classList.add('active');
        document.getElementById('collectionSubMenu')?.classList.add('active');
        document.getElementById('btnAll')?.classList.add('active');
    }

    // Scroll to catalog section
    const shopSection = document.getElementById('shop');
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
    }

    updateCurrentCards(currentEdition);

    if (activeCategoryFilter) {
        currentCards = currentCards.filter(card => {
            const cardCat = card.getAttribute('data-category');
            const ref = card.getAttribute('data-ref');
            const img = card.querySelector('img');
            const src = img ? decodeURIComponent(img.src) : '';
            const isOwn = ref === 'For Your Own Design' || src.includes('For Your Own Design');
            return isOwn || cardCat === activeCategoryFilter;
        });

        ensureOwnDesignAtTopLeft(currentCards);
    }

    // Highlight category cards
    const catCards = document.querySelectorAll('.category-card');
    catCards.forEach(c => {
        if (c.getAttribute('data-category') === activeCategoryFilter) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });

    displayPage(1, false);
    savePageState();
}

// Auto-derive Reference Numbers
function initReferenceNumbers() {
    const allCards = catalogGrid.querySelectorAll('.product-card');
    allCards.forEach(card => {
        if (card.classList.contains('prod-2026') || card.classList.contains('prod-2025') || card.classList.contains('prod-event')) {
            const img = card.querySelector('img');
            if (img && img.src) {
                const decodedSrc = decodeURIComponent(img.src);
                let refNumber = card.getAttribute('data-ref') || '';
                let isWorldCup = card.classList.contains('prod-event');

                if (!refNumber) {
                    if (decodedSrc.includes('For Your Own Design')) {
                        refNumber = 'For Your Own Design';
                        card.setAttribute('data-ref', refNumber);
                    } else {
                        const match = decodedSrc.match(/((?:25#|26#|25-|26-)\d+)/) || decodedSrc.match(/\((\d+)\)/);
                        if (match && match[1]) {
                            const rawMatch = match[1];
                            if (isWorldCup) {
                                let countryName = 'World Cup';
                                if (decodedSrc.includes('Argentina')) countryName = 'Argentina';
                                else if (decodedSrc.includes('Brazil')) countryName = 'Brazil';
                                else if (decodedSrc.includes('Portugal')) countryName = 'Portugal';
                                else if (decodedSrc.includes('Spain')) countryName = 'Spain';
                                else if (decodedSrc.includes('England')) countryName = 'England';
                                refNumber = `${countryName} 2026`;
                            } else {
                                refNumber = rawMatch;
                            }
                            card.setAttribute('data-ref', refNumber);
                        }
                    }
                }

                if (refNumber) {
                    const meta = getProductCategoryAndName(refNumber, isWorldCup);
                    card.setAttribute('data-category', meta.category.toLowerCase());

                    // Check if card originally had a .badge-new or .badge-wc
                    const hasNewBadge = !!card.querySelector('.badge-new');
                    const wcBadge = card.querySelector('.badge-wc');
                    const hasWcBadge = !!wcBadge;
                    const eventTagText = wcBadge ? wcBadge.getAttribute('data-event-tag') || wcBadge.textContent : '';

                    // Inject elegant details block below the image
                    const details = document.createElement('div');
                    details.className = 'product-info-overlay';
                    
                    let badgeHtml = '';
                    if (hasNewBadge) {
                        badgeHtml += `<span class="product-title-badge-new">New</span>`;
                    }
                    if (hasWcBadge && eventTagText) {
                        badgeHtml += `<span class="product-title-badge-wc">${eventTagText}</span>`;
                    }

                    details.innerHTML = `
                        <h3 class="product-title">${meta.name}</h3>
                        ${badgeHtml}
                    `;
                    card.appendChild(details);
                }
            }
        } else if (card.classList.contains('prod-material')) {
            const img = card.querySelector('img');
            if (img && img.src) {
                // Extract filename without extension
                const fileNameMatch = img.src.match(/([^\/]+)(?=\.\w+$)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    const refName = decodeURIComponent(fileNameMatch[1]);
                    card.setAttribute('data-ref', refName);

                    const refBadge = document.createElement('span');
                    refBadge.className = 'ref-number-badge';
                    refBadge.innerText = refName;

                    // Look for image container to append badge
                    const imgContainer = card.querySelector('.image-container, .placementguide-image-block');
                    if (imgContainer) {
                        imgContainer.appendChild(refBadge);
                    }
                }
            }
        }
    });
}
let allCardsAll = [];

function initAllCardsAll() {
    let ownDesignCard = null;
    const nonEventCards = [];

    // Collect all design cards from 2025 and 2026 (excluding World Cup / Event Edition)
    [...allCards2025, ...allCards2026].forEach(card => {
        const img = card.querySelector('img');
        const src = img ? decodeURIComponent(img.src) : '';
        const isOwnDesign = card.getAttribute('data-ref') === 'For Your Own Design' || src.includes('For Your Own Design');
        if (isOwnDesign) {
            if (!ownDesignCard) ownDesignCard = card;
        } else {
            nonEventCards.push(card);
        }
    });

    // Shuffle removed as requested

    allCardsAll = ownDesignCard ? [ownDesignCard, ...nonEventCards] : nonEventCards;
}

initReferenceNumbers();
initAllCardsAll();
currentCards = allCardsAll;
initQuoteBuilder();

// State Persistence Functions (Scroll Position, Active Edition, Page Number, Category Filter)
function savePageState() {
    try {
        const state = {
            edition: currentEdition || 'all',
            page: currentPage || 1,
            category: activeCategoryFilter || null,
            scrollY: window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
        };
        sessionStorage.setItem('thirtyone_catalog_state', JSON.stringify(state));
    } catch (e) {}
}

function restorePageState() {
    try {
        const rawState = sessionStorage.getItem('thirtyone_catalog_state');
        if (!rawState) return false;

        const state = JSON.parse(rawState);
        if (!state) return false;

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        if (state.category) {
            activeCategoryFilter = state.category;
            const catCards = document.querySelectorAll('.category-card');
            catCards.forEach(c => {
                if (c.getAttribute('data-category') === activeCategoryFilter) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        }

        if (state.edition) {
            currentEdition = state.edition;
            const allEditionBtns = document.querySelectorAll('.edition-btn, .spec-btn, .sub-spec-btn');
            allEditionBtns.forEach(btn => btn.classList.remove('active'));

            if (currentEdition === '2026' || currentEdition === '2025' || currentEdition.startsWith('20')) {
                document.getElementById('btnCollection')?.classList.add('active');
                document.getElementById('collectionSubMenu')?.classList.add('active');
                document.getElementById(`btn${currentEdition}`)?.classList.add('active');
            } else if (currentEdition === 'all') {
                document.getElementById('btnCollection')?.classList.remove('active');
                document.getElementById('collectionSubMenu')?.classList.remove('active');
            } else if (currentEdition === 'worldcup') document.getElementById('btnWC')?.classList.add('active');
            else if (currentEdition === 'material') document.getElementById('btnMaterial')?.classList.add('active');
            else if (currentEdition === 'cutting') document.getElementById('btnCutting')?.classList.add('active');
            else if (currentEdition === 'neck') document.getElementById('btnNeck')?.classList.add('active');

            if (currentEdition === 'nameset' || currentEdition === 'sponsor' || currentEdition === 'placementguide') {
                document.getElementById('btnPrinting')?.classList.add('active');
                document.getElementById('printingSubMenu')?.classList.add('active');

                if (currentEdition === 'nameset') document.getElementById('btnNameset')?.classList.add('active');
                if (currentEdition === 'sponsor') document.getElementById('btnSponsor')?.classList.add('active');
                if (currentEdition === 'placementguide') document.getElementById('btnPlacementGuide')?.classList.add('active');
            } else {
                document.getElementById('printingSubMenu')?.classList.remove('active');
            }

            if (currentEdition.startsWith('sizechart')) {
                document.getElementById('btnSizeChart')?.classList.add('active');
                document.getElementById('sizeChartSubMenu')?.classList.add('active');
                if (currentEdition === 'sizechart-shirt') document.getElementById('btnSizeShirt')?.classList.add('active');
                if (currentEdition === 'sizechart-pants') document.getElementById('btnSizePants')?.classList.add('active');
                if (currentEdition === 'sizechart-muslimah') document.getElementById('btnSizeMuslimah')?.classList.add('active');
            } else if (!currentEdition.startsWith('sizechart')) {
                document.getElementById('sizeChartSubMenu')?.classList.remove('active');
            }
        }

        updateCurrentCards(currentEdition);

        if (activeCategoryFilter) {
            currentCards = currentCards.filter(card => {
                const cardCat = card.getAttribute('data-category');
                return cardCat === activeCategoryFilter;
            });
        }

        const targetPage = state.page || 1;
        displayPage(targetPage, false);

        if (typeof state.scrollY === 'number' && state.scrollY > 0) {
            const scrollPos = state.scrollY;
            window.scrollTo(0, scrollPos);
            setTimeout(() => { window.scrollTo(0, scrollPos); }, 50);
            setTimeout(() => { window.scrollTo(0, scrollPos); }, 200);
        }

        return true;
    } catch (e) {
        return false;
    }
}

// Add event listeners to automatically save position & state on scroll and before refresh
window.addEventListener('beforeunload', savePageState);
window.addEventListener('pagehide', savePageState);
window.addEventListener('scroll', savePageState, { passive: true });

// Initialize or Restore Page State
if (!restorePageState()) {
    displayPage(1, false);
}

function ensureOwnDesignAtTopLeft(cards) {
    if (!cards || cards.length === 0) return cards;

    const ownIdx = cards.findIndex(card => {
        const ref = card.getAttribute('data-ref');
        const img = card.querySelector('img');
        const src = img ? decodeURIComponent(img.src) : '';
        return ref === 'For Your Own Design' || src.includes('For Your Own Design');
    });

    if (ownIdx > 0) {
        const ownCard = cards.splice(ownIdx, 1)[0];
        cards.unshift(ownCard);
    } else if (ownIdx === -1) {
        const allCardsInGrid = Array.from(catalogGrid.querySelectorAll('.product-card'));
        const globalOwnCard = allCardsInGrid.find(card => {
            const ref = card.getAttribute('data-ref');
            const img = card.querySelector('img');
            const src = img ? decodeURIComponent(img.src) : '';
            return ref === 'For Your Own Design' || src.includes('For Your Own Design');
        });
        if (globalOwnCard) {
            cards.unshift(globalOwnCard);
        }
    }

    return cards;
}

function updateCurrentCards(edition) {
    switch (edition) {
        case 'all': currentCards = [...allCardsAll]; break;
        case '2026': currentCards = [...allCards2026]; break;
        case '2025': currentCards = allCards2025.length > 0 ? [...allCards2025] : [...allCards2026]; break;
        case 'worldcup': currentCards = [...allCardsWC]; break;
        case 'material': currentCards = [...allCardsMaterial]; break;
        case 'cutting': currentCards = [...allCardsCutting]; break;
        case 'neck': currentCards = [...allCardsNeck]; break;
        case 'nameset': currentCards = [...allCardsNameset]; break;
        case 'sponsor': currentCards = [...allCardsSponsor]; break;
        case 'sizechart-shirt': currentCards = [...allCardsSizeShirt]; break;
        case 'sizechart-pants': currentCards = [...allCardsSizePants]; break;
        case 'sizechart-muslimah': currentCards = [...allCardsSizeMuslimah]; break;
        case 'placementguide': currentCards = [...allCardsPlacement]; break;
        default: 
            const dynamicCards = Array.from(catalogGrid.getElementsByClassName(`prod-${edition}`));
            currentCards = dynamicCards.length > 0 ? [...dynamicCards] : [...allCardsAll];
    }

    const isSpecSection = ['material','cutting','neck','nameset','sponsor','placementguide','sizechart-shirt','sizechart-pants','sizechart-muslimah'].includes(edition);
    if (!isSpecSection) {
        ensureOwnDesignAtTopLeft(currentCards);
    }
}

function applySkeletonLoader(card) {
    const imgs = card.querySelectorAll('img');

    let loadedCount = 0;
    const totalImgs = imgs.length;

    if (totalImgs > 0) {
        let hasUnloaded = false;
        imgs.forEach(img => {
            if (!img.complete) {
                hasUnloaded = true;
                
                if (img.dataset.skeletonBound === 'true') {
                    return;
                }
                img.dataset.skeletonBound = 'true';

                const loadHandler = () => {
                    loadedCount++;
                    if (loadedCount === totalImgs) {
                        card.classList.remove('skeleton-loading');
                    }
                    img.dataset.skeletonBound = 'false';
                    img.removeEventListener('load', loadHandler);
                    img.removeEventListener('error', errorHandler);
                };
                const errorHandler = () => {
                    loadedCount++;
                    if (loadedCount === totalImgs) {
                        card.classList.remove('skeleton-loading');
                    }
                    img.dataset.skeletonBound = 'false';
                    img.removeEventListener('load', loadHandler);
                    img.removeEventListener('error', errorHandler);
                };
                img.addEventListener('load', loadHandler);
                img.addEventListener('error', errorHandler);
            }
        });

        if (hasUnloaded) {
            card.classList.add('skeleton-loading');
        } else {
            card.classList.remove('skeleton-loading');
        }
    } else {
        card.classList.remove('skeleton-loading');
    }
}

function displayPage(page, shouldScroll = true) {
    const totalPages = Math.ceil(currentCards.length / cardsPerPage);
    if (page > totalPages && totalPages > 0) {
        page = totalPages;
    }

    currentPage = page;
    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;

    Array.from(catalogGrid.getElementsByClassName('product-card')).forEach(card => card.style.display = 'none');
    catalogGrid.classList.remove('grid-nameset-layout', 'grid-sponsor-layout', 'grid-sizechart-layout', 'grid-neck-layout', 'grid-cutting-layout', 'grid-material-layout', 'grid-placementguide-layout');
    const sponsorDisc = document.getElementById('sponsorDisclaimer');
    if (sponsorDisc) sponsorDisc.style.display = 'none';

    let isCustomLayout = false;
    if (currentEdition === 'nameset') { catalogGrid.classList.add('grid-nameset-layout'); isCustomLayout = true; }
    else if (currentEdition === 'sponsor') {
        catalogGrid.classList.add('grid-sponsor-layout');
        if (sponsorDisc) sponsorDisc.style.display = 'block';
        isCustomLayout = true;
    }
    else if (currentEdition.startsWith('sizechart')) { catalogGrid.classList.add('grid-sizechart-layout'); isCustomLayout = true; }
    else if (currentEdition === 'neck') { catalogGrid.classList.add('grid-neck-layout'); isCustomLayout = true; }
    else if (currentEdition === 'cutting') { catalogGrid.classList.add('grid-cutting-layout'); isCustomLayout = true; }
    else if (currentEdition === 'material') { catalogGrid.classList.add('grid-material-layout'); isCustomLayout = true; }
    else if (currentEdition === 'placementguide') { catalogGrid.classList.add('grid-placementguide-layout'); isCustomLayout = true; }

    if (isCustomLayout) {
        currentCards.forEach(card => {
            card.style.display = 'block';
            applySkeletonLoader(card);
        });
        const pagContainer = document.getElementById('paginationContainer');
        if (pagContainer) pagContainer.innerHTML = '';
    } else {
        currentCards.forEach((card, index) => {
            if (index >= start && index < end) {
                card.style.display = 'block';
                applySkeletonLoader(card);
            }
        });

        // Enforce DOM prepending of For Your Own Design so it is physically the first child node in catalogGrid
        const isSpecSection = ['material','cutting','neck','nameset','sponsor','placementguide','sizechart-shirt','sizechart-pants','sizechart-muslimah'].includes(currentEdition);
        if (!isSpecSection) {
            const ownDesignCard = currentCards.find(card => {
                const ref = card.getAttribute('data-ref');
                const img = card.querySelector('img');
                const src = img ? decodeURIComponent(img.src) : '';
                return ref === 'For Your Own Design' || src.includes('For Your Own Design');
            }) || Array.from(catalogGrid.querySelectorAll('.product-card')).find(card => {
                const ref = card.getAttribute('data-ref');
                const img = card.querySelector('img');
                const src = img ? decodeURIComponent(img.src) : '';
                return ref === 'For Your Own Design' || src.includes('For Your Own Design');
            });

            if (ownDesignCard) {
                catalogGrid.prepend(ownDesignCard);
                // Ensure we only force display block if it is within the paginated range (e.g. page 1)
                const ownIndex = currentCards.indexOf(ownDesignCard);
                if (ownIndex >= start && ownIndex < end) {
                    ownDesignCard.style.display = 'block';
                    applySkeletonLoader(ownDesignCard);
                }
            }
        }

        setupPaginationButtons();
    }

    if (shouldScroll) {
        let scrollOffset = 150;

        if (currentEdition === 'sizechart-shirt' || currentEdition === 'sizechart-pants' || currentEdition === 'sizechart-muslimah' || currentEdition === 'placementguide' || currentEdition === 'nameset' || currentEdition === 'cutting' || currentEdition === 'neck') {
            scrollOffset = 200;
        }
        else if (currentEdition === 'sponsor') {
            scrollOffset = 235;
        }

        window.scrollTo({ top: catalogGrid.offsetTop - scrollOffset, behavior: 'smooth' });
    }
    savePageState();
}

function setupPaginationButtons() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(currentCards.length / cardsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('page-btn');
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => displayPage(i, true));
        paginationContainer.appendChild(button);
    }
}

function switchEdition(edition) {
    currentEdition = edition;

    // Reset category filter when switching main sections
    activeCategoryFilter = null;
    const catCards = document.querySelectorAll('.category-card');
    catCards.forEach(c => c.classList.remove('active'));

    const allEditionBtns = document.querySelectorAll('.edition-btn, .spec-btn, .sub-spec-btn');
    allEditionBtns.forEach(btn => btn.classList.remove('active'));

    if (edition === '2026' || edition === '2025' || edition.startsWith('20')) {
        document.getElementById('btnCollection')?.classList.add('active');
        document.getElementById('collectionSubMenu')?.classList.add('active');
        document.getElementById(`btn${edition}`)?.classList.add('active');
    } else if (edition === 'all') {
        document.getElementById('btnCollection')?.classList.remove('active');
        document.getElementById('collectionSubMenu')?.classList.remove('active');
    } else {
        document.getElementById('collectionSubMenu')?.classList.remove('active');
    }

    if (edition === 'worldcup') document.getElementById('btnWC')?.classList.add('active');
    else if (edition === 'material') document.getElementById('btnMaterial')?.classList.add('active');
    else if (edition === 'cutting') document.getElementById('btnCutting')?.classList.add('active');
    else if (edition === 'neck') document.getElementById('btnNeck')?.classList.add('active');

    if (edition === 'nameset' || edition === 'sponsor' || edition === 'placementguide') {
        document.getElementById('btnPrinting')?.classList.add('active');
        document.getElementById('printingSubMenu')?.classList.add('active');

        if (edition === 'nameset') document.getElementById('btnNameset')?.classList.add('active');
        if (edition === 'sponsor') document.getElementById('btnSponsor')?.classList.add('active');
        if (edition === 'placementguide') document.getElementById('btnPlacementGuide')?.classList.add('active');
    } else {
        document.getElementById('printingSubMenu')?.classList.remove('active');
    }

    if (edition === 'sizechart-shirt') {
        document.getElementById('btnSizeChart')?.classList.add('active');
        document.getElementById('sizeChartSubMenu')?.classList.add('active');
        document.getElementById('btnSizeShirt')?.classList.add('active');
    } else if (edition === 'sizechart-pants') {
        document.getElementById('btnSizeChart')?.classList.add('active');
        document.getElementById('sizeChartSubMenu')?.classList.add('active');
        document.getElementById('btnSizePants')?.classList.add('active');
    } else if (edition === 'sizechart-muslimah') {
        document.getElementById('btnSizeChart')?.classList.add('active');
        document.getElementById('sizeChartSubMenu')?.classList.add('active');
        document.getElementById('btnSizeMuslimah')?.classList.add('active');
    } else if (!edition.startsWith('sizechart')) {
        document.getElementById('sizeChartSubMenu')?.classList.remove('active');
    }

    updateCurrentCards(edition);
    displayPage(1, true);
    savePageState();
}
window.switchEdition = switchEdition;

function toggleCollectionSubMenu() {
    const subMenu = document.getElementById('collectionSubMenu');
    const mainBtn = document.getElementById('btnCollection');

    if (subMenu && mainBtn) {
        const isCurrentlyActive = mainBtn.classList.contains('active');
        if (isCurrentlyActive) {
            // switchEdition('all'); // Disabled so it doesn't turn off
        } else {
            const currentYear = new Date().getFullYear().toString();
            const yearBtn = document.getElementById(`btn${currentYear}`);
            const targetEdition = yearBtn ? currentYear : '2026';
            switchEdition(targetEdition);
        }
    }
}
window.toggleCollectionSubMenu = toggleCollectionSubMenu;

function togglePrintingSubMenu() {
    const subMenu = document.getElementById('printingSubMenu');
    const mainBtn = document.getElementById('btnPrinting');

    if (subMenu && mainBtn) {
        const isCurrentlyActive = mainBtn.classList.contains('active');
        if (!isCurrentlyActive) {
            switchEdition('nameset');
        }
    }
}
window.togglePrintingSubMenu = togglePrintingSubMenu;

function toggleSizeChartSubMenu() {
    const subMenu = document.getElementById('sizeChartSubMenu');
    const mainBtn = document.getElementById('btnSizeChart');

    if (subMenu && mainBtn) {
        const isCurrentlyActive = mainBtn.classList.contains('active');
        if (!isCurrentlyActive) {
            switchEdition('sizechart-shirt');
        }
    }
}
window.toggleSizeChartSubMenu = toggleSizeChartSubMenu;

// Neck and cutting mappings

function getNeckCardImg(label) {
    if (!label) return null;
    if (neckCardMap[label]) return neckCardMap[label];
    const lower = label.toLowerCase();
    if (lower.includes("round")) return "Image/Neck/Round.webp";
    if (lower.includes("v-neck end") || lower.includes("v-neck-end")) return "Image/Neck/V-neck End.webp";
    if (lower.includes("v-neck outer")) return "Image/Neck/V-neck Outer.webp";
    if (lower.includes("v-neck") || lower.includes("vneck")) return "Image/Neck/V-neck.webp";
    if (lower.includes("polo") || lower.includes("collar")) return "Image/Neck/Polo.webp";
    if (lower.includes("mandarin")) return "Image/Neck/Mandarin Zip.webp";
    if (lower.includes("retro end")) return "Image/Neck/Retro End.webp";
    if (lower.includes("retro")) return "Image/Neck/Retro.webp";
    return null;
}

const cuttingCardMap = {
    "Baseball": "Image/Cutting/Baseball.webp",
    "Baseball Cutting": "Image/Cutting/Baseball.webp",
    "Boxy": "Image/Cutting/Boxy.webp",
    "Boxy Cutting": "Image/Cutting/Boxy.webp",
    "Normal": "Image/Cutting/Normal.webp",
    "Normal Cutting": "Image/Cutting/Normal.webp",
    "Raglan": "Image/Cutting/Raglan.webp",
    "Raglan Cutting": "Image/Cutting/Raglan.webp",
    "Singlet": "Image/Cutting/Singlet.webp",
    "Singlet Cutting": "Image/Cutting/Singlet.webp",
    "Sleeveless": "Image/Cutting/Sleeveless.webp",
    "Sleeveless Cutting": "Image/Cutting/Sleeveless.webp",
    "Muslimah": "Image/Cutting/Muslimah.webp",
    "Muslimah Cutting": "Image/Cutting/Muslimah.webp"
};

function getCuttingCardImg(label) {
    if (!label) return null;
    if (cuttingCardMap[label]) return cuttingCardMap[label];
    const lower = label.toLowerCase();
    if (lower.includes("baseball")) return "Image/Cutting/Baseball.webp";
    if (lower.includes("boxy")) return "Image/Cutting/Boxy.webp";
    if (lower.includes("raglan")) return "Image/Cutting/Raglan.webp";
    if (lower.includes("singlet")) return "Image/Cutting/Singlet.webp";
    if (lower.includes("sleeveless")) return "Image/Cutting/Sleeveless.webp";
    if (lower.includes("muslimah")) return "Image/Cutting/Muslimah.webp";
    if (lower.includes("normal") || lower.includes("standard")) return "Image/Cutting/Normal.webp";
    return null;
}

function updateMaterialPreview(containerId, selectedVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = getMaterialData(selectedVal);
    if (data) {
        const badgesHtml = data.badges.map(b => `<img src="${b}" alt="badge" class="stat-icon">`).join('');
        const descText = (i18nTranslations[currentLang] && i18nTranslations[currentLang][data.descKey]) || data.desc;
        const recText = (i18nTranslations[currentLang] && i18nTranslations[currentLang][data.recKey]) || data.recommend;
        const recLabel = (i18nTranslations[currentLang] && i18nTranslations[currentLang]['spec_recommend_label']) || 'Recommend';

        container.innerHTML = `
            <div class="product-card prod-material qb-material-card-full">
                <div class="card-image-wrapper">
                    <img src="${data.image}" alt="${data.title}" class="card-image">
                </div>
                <div class="card-content">
                    <div class="header-inline">
                        <h1 class="material-title">${data.title} ${badgesHtml}</h1>
                        <span class="collection-name" data-i18n="${data.descKey}">${descText}</span>
                    </div>
                    <div class="stats-container">
                        <div class="stat-box">
                            <span class="stat-label" data-i18n="spec_recommend_label">${recLabel}</span>
                            <span class="stat-value" data-i18n="${data.recKey}">${recText}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

function updateNeckPreview(containerId, selectedVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const imgPath = getNeckCardImg(selectedVal);
    if (imgPath) {
        container.innerHTML = `
            <div class="qb-card-preview">
                <img src="${imgPath}" alt="${selectedVal}" class="qb-card-preview-img">
            </div>
        `;
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

function updateCuttingPreview(containerId, selectedVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const imgPath = getCuttingCardImg(selectedVal);
    if (imgPath) {
        container.innerHTML = `
            <div class="qb-card-preview">
                <img src="${imgPath}" alt="${selectedVal}" class="qb-card-preview-img">
            </div>
        `;
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

window.updateMaterialPreview = updateMaterialPreview;
window.updateNeckPreview = updateNeckPreview;
window.updateCuttingPreview = updateCuttingPreview;
window.closeLightbox = closeLightbox;

function openQuoteBuilder() {
    // DISABLED — Quote Builder turned off
    return;

    // Reset quantity checkbox and state
    document.getElementById('qbQuantityNotSure').checked = false;
    document.getElementById('qbQuantity').disabled = false;
    document.getElementById('qbQuantity').style.opacity = '';
    document.getElementById('qbQuantity').value = configData.minimumOrderQuantity;
    quoteSelections.isEstimatedQuantity = false;

    // Reset sleeve state
    document.querySelector('input[name="sleeveShortOpt"][value="all"]').checked = true;
    document.querySelector('input[name="sleeveLongOpt"][value="all"]').checked = false;
    if (typeof updateSleeveState === 'function') updateSleeveState();

    // Reset card previews
    updateMaterialPreview('qbMaterialPreview', '');
    updateCuttingPreview('qbCuttingPreview', '');
    updateNeckPreview('qbNeckPreview', '');

    updateQuoteStep();
}

document.getElementById('quoteBuilderClose').addEventListener('click', () => {
    quoteBuilderModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

// Quote Builder Logic
function initQuoteBuilder() {
    // Populate dynamic selects
    document.getElementById('qbQuantity').min = configData.minimumOrderQuantity;
    document.getElementById('qbQuantity').value = configData.minimumOrderQuantity;

    populateSelect('qbMaterial', configData.materials);
    populateSelect('qbCutting', configData.cuttings);
    populateSelect('qbNeck', configData.necks);

    // Bind change listeners for material, cutting & neck previews
    document.getElementById('qbMaterial').addEventListener('change', (e) => {
        updateMaterialPreview('qbMaterialPreview', e.target.value);
    });

    document.getElementById('qbCutting').addEventListener('change', (e) => {
        updateCuttingPreview('qbCuttingPreview', e.target.value);
    });

    document.getElementById('qbNeck').addEventListener('change', (e) => {
        updateNeckPreview('qbNeckPreview', e.target.value);
    });

    // Quantity Not Sure (Estimate Quantity) Change Event Listener
    document.getElementById('qbQuantityNotSure').addEventListener('change', (e) => {
        // Quantity input box remains enabled regardless of checkbox state
    });

    // Sleeve Not Sure Event Listener is added below where updateSleeveState is defined
}

function populateSelect(id, list) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">-- Choose Option --</option>';
    list.forEach(item => {
        select.innerHTML += `<option value="${item.label}">${item.label}</option>`;
    });
}

function updateQuoteStep() {
    document.querySelectorAll('#quoteBuilderModal .quote-step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${currentQuoteStep}`).style.display = 'block';

    const stepLabel = i18nTranslations[currentLang]?.qb_step_label || 'Step';
    const stepOf = i18nTranslations[currentLang]?.qb_step_of || 'of';
    const progressText = currentQuoteStep <= 7 ? `${stepLabel} ${currentQuoteStep} ${stepOf} 7` : (currentLang === 'ms' ? 'Semakan' : 'Summary');
    document.getElementById('quoteProgress').innerText = progressText;

    if (currentQuoteStep === 3) {
        updateMaterialPreview('qbMaterialPreview', document.getElementById('qbMaterial').value);
    } else if (currentQuoteStep === 4) {
        updateCuttingPreview('qbCuttingPreview', document.getElementById('qbCutting').value);
    } else if (currentQuoteStep === 5) {
        updateNeckPreview('qbNeckPreview', document.getElementById('qbNeck').value);
    }

    if (currentQuoteStep === 8) {
        // Build summary
        let designStr = quoteSelections.design === 'Custom' || quoteSelections.design === 'For Your Own Design' ? (currentLang === 'ms' ? 'Reka Bentuk Sendiri' : 'Use My Own Design') : (/^\d+$/.test(quoteSelections.design) ? `#${quoteSelections.design}` : quoteSelections.design);
        if (quoteSelections.alterDesign === 'Yes') designStr += (currentLang === 'ms' ? ' (Edit Mockup)' : ' (Edit Mockup)');

        let qtyDisplay = `${quoteSelections.quantity} ${currentLang === 'ms' ? 'helai' : 'pieces'}`;
        if (quoteSelections.isEstimatedQuantity) {
            qtyDisplay += ' (Estimated)';
        }
        document.getElementById('summaryDesign').innerText = designStr;
        document.getElementById('summaryQuantity').innerText = qtyDisplay;
        document.getElementById('summaryMaterial').innerText = quoteSelections.material;
        document.getElementById('summaryCutting').innerText = quoteSelections.cutting;
        document.getElementById('summaryNeck').innerText = quoteSelections.neck;
        document.getElementById('summarySleeve').innerText = quoteSelections.sleeve;
        document.getElementById('summaryNameset').innerText = quoteSelections.nameset;
        document.getElementById('summaryShortPants').innerText = quoteSelections.shortPants;
    }
}

function nextStep() {
    if (currentQuoteStep === 1) {
        quoteSelections.alterDesign = document.querySelector('input[name="alterDesign"]:checked')?.value || 'No';
    }
    if (currentQuoteStep === 2) {
        const qty = parseInt(document.getElementById('qbQuantity').value, 10);
        if (isNaN(qty) || qty < configData.minimumOrderQuantity) {
            alert((currentLang === 'ms' ? 'Minimum tempahan ialah ' : 'Minimum order quantity is ') + configData.minimumOrderQuantity);
            return;
        }
        quoteSelections.quantity = qty;
        quoteSelections.isEstimatedQuantity = document.getElementById('qbQuantityNotSure')?.checked || false;
    }
    if (currentQuoteStep === 3) {
        if (!document.getElementById('qbMaterial').value) { alert(currentLang === 'ms' ? 'Sila pilih bahan kain' : 'Please select material'); return; }
        quoteSelections.material = document.getElementById('qbMaterial').value;
    }
    if (currentQuoteStep === 4) {
        if (!document.getElementById('qbCutting').value) { alert(currentLang === 'ms' ? 'Sila pilih potongan baju' : 'Please select cutting'); return; }
        quoteSelections.cutting = document.getElementById('qbCutting').value;
    }
    if (currentQuoteStep === 5) {
        if (!document.getElementById('qbNeck').value) { alert(currentLang === 'ms' ? 'Sila pilih kolar' : 'Please select neck'); return; }
        quoteSelections.neck = document.getElementById('qbNeck').value;
    }
    if (currentQuoteStep === 6) {
        const sleeveNotSure = document.getElementById('qbSleeveNotSure')?.checked;
        if (sleeveNotSure) {
            quoteSelections.sleeve = currentLang === 'ms' ? "Belum pasti" : "Not Sure Yet";
        } else {
            const shortRadio = document.querySelector('input[name="sleeveShortOpt"]:checked');
            const longRadio = document.querySelector('input[name="sleeveLongOpt"]:checked');
            
            if (shortRadio?.value === 'all') {
                quoteSelections.sleeve = currentLang === 'ms' ? `Lengan Pendek (${quoteSelections.quantity})` : `Short Sleeve (${quoteSelections.quantity})`;
            } else if (longRadio?.value === 'all') {
                quoteSelections.sleeve = currentLang === 'ms' ? `Lengan Panjang (${quoteSelections.quantity})` : `Long Sleeve (${quoteSelections.quantity})`;
            } else {
                const sQty = parseInt(document.getElementById('qbSleeveShortQty')?.value, 10) || 0;
                const lQty = parseInt(document.getElementById('qbSleeveLongQty')?.value, 10) || 0;
                const totalSleeve = sQty + lQty;
                if (totalSleeve !== quoteSelections.quantity) {
                    document.getElementById('sleeveError').style.display = 'block';
                    return;
                } else {
                    document.getElementById('sleeveError').style.display = 'none';
                }
                let sleeveStr = [];
                if (sQty > 0) sleeveStr.push(currentLang === 'ms' ? `Lengan Pendek (${sQty})` : `Short Sleeve (${sQty})`);
                if (lQty > 0) sleeveStr.push(currentLang === 'ms' ? `Lengan Panjang (${lQty})` : `Long Sleeve (${lQty})`);
                quoteSelections.sleeve = sleeveStr.join(', ') || (currentLang === 'ms' ? "Tiada konfigurasi lengan" : "No sleeve config selected");
            }
        }
    }
    if (currentQuoteStep === 7) {
        quoteSelections.nameset = document.querySelector('input[name="addNameset"]:checked')?.value || 'No';
        quoteSelections.shortPants = document.querySelector('input[name="addPants"]:checked')?.value || 'No';
    }

    currentQuoteStep++;
    updateQuoteStep();
}

function prevStep() {
    if (currentQuoteStep > 1) {
        currentQuoteStep--;
        updateQuoteStep();
    }
}

document.querySelectorAll('.qb-next').forEach((btn) => {
    btn.addEventListener('click', nextStep);
});
document.querySelectorAll('.qb-prev').forEach((btn) => {
    btn.addEventListener('click', prevStep);
});

// WhatsApp Generator
document.getElementById('sendWhatsAppBtn').addEventListener('click', () => {
    let designText = quoteSelections.design === 'Custom' || quoteSelections.design === 'For Your Own Design' 
        ? (currentLang === 'ms' ? 'Reka Bentuk Sendiri' : 'Use My Own Design') 
        : (/^\d+$/.test(quoteSelections.design) ? `#${quoteSelections.design}` : quoteSelections.design);
    if (quoteSelections.alterDesign === 'Yes') {
        designText += (currentLang === 'ms' ? ' (Edit Mockup)' : ' (Edit Mockup)');
    }

    // Format quantity text
    let qtyText = `${quoteSelections.quantity} ${currentLang === 'ms' ? 'helai' : 'pieces'}`;
    if (quoteSelections.isEstimatedQuantity) {
        qtyText += ' (Estimated)';
    }

    const greeting = i18nTranslations[currentLang]?.wa_greeting || "Hi ThirtyOne Lab! I'm interested in ordering:";
    const closing = i18nTranslations[currentLang]?.wa_closing || "Could I get a quotation for this order?";

    // SPEC LABELS STRICTLY STAY IN ENGLISH AS REQUESTED BY USER
    const message = `${greeting}

Design: ${designText}
Quantity: ${qtyText}
Material: ${quoteSelections.material}
Cutting: ${quoteSelections.cutting}
Neck/Collar: ${quoteSelections.neck}
Sleeve: ${quoteSelections.sleeve}
Nameset: ${quoteSelections.nameset}
Short Pants: ${quoteSelections.shortPants}

${closing}`;

    const encoded = encodeURIComponent(message);
    const myWhatsAppNumber = "601125614436";
    window.open(`https://wa.me/${myWhatsAppNumber}?text=${encoded}`, '_blank');
});

// Init layout
updateCurrentCards(currentEdition);
displayPage(currentPage, false);

// Sleeve Table Logic
const sleeveShortAll = document.querySelector('input[name="sleeveShortOpt"][value="all"]');
const sleeveShortFill = document.querySelector('input[name="sleeveShortOpt"][value="fill"]');
const sleeveShortQty = document.getElementById('qbSleeveShortQty');

const sleeveLongAll = document.querySelector('input[name="sleeveLongOpt"][value="all"]');
const sleeveLongFill = document.querySelector('input[name="sleeveLongOpt"][value="fill"]');
const sleeveLongQty = document.getElementById('qbSleeveLongQty');

function updateSleeveState(event) {
    const sleeveNotSure = document.getElementById('qbSleeveNotSure');
    if (event && sleeveNotSure && sleeveNotSure.checked) {
        sleeveNotSure.checked = false;
    }

    // Uncheck quantity "Not sure yet" if Short or Long Sleeve "All" is selected
    if (sleeveShortAll.checked || sleeveLongAll.checked) {
        const qtyNotSure = document.getElementById('qbQuantityNotSure');
        if (qtyNotSure && qtyNotSure.checked) {
            qtyNotSure.checked = false;
            const qtyInput = document.getElementById('qbQuantity');
            qtyInput.disabled = false;
            qtyInput.style.opacity = '';
        }
    }

    // Handle mutual exclusivity of options
    if (sleeveShortAll.checked && event && (event.target === sleeveShortAll || event.target.name === 'sleeveShortOpt')) {
        sleeveLongAll.checked = false;
        sleeveLongFill.checked = false;
    } else if (sleeveLongAll.checked && event && (event.target === sleeveLongAll || event.target.name === 'sleeveLongOpt')) {
        sleeveShortAll.checked = false;
        sleeveShortFill.checked = false;
    } else if (sleeveShortFill.checked && event && event.target === sleeveShortFill) {
        sleeveLongFill.checked = true;
        sleeveLongAll.checked = false;
    } else if (sleeveLongFill.checked && event && event.target === sleeveLongFill) {
        sleeveShortFill.checked = true;
        sleeveShortAll.checked = false;
    }

    if (sleeveShortAll.checked) {
        sleeveShortQty.disabled = true;
        sleeveShortQty.value = '';

        sleeveLongAll.checked = false;
        sleeveLongFill.checked = false;
        sleeveLongQty.disabled = true;
        sleeveLongQty.value = '';
    } else if (sleeveLongAll.checked) {
        sleeveLongQty.disabled = true;
        sleeveLongQty.value = '';

        sleeveShortAll.checked = false;
        sleeveShortFill.checked = false;
        sleeveShortQty.disabled = true;
        sleeveShortQty.value = '';
    } else {
        // Both are Fill in
        sleeveShortQty.disabled = !sleeveShortFill.checked;
        if (!sleeveShortFill.checked) sleeveShortQty.value = '';
        sleeveLongQty.disabled = !sleeveLongFill.checked;
        if (!sleeveLongFill.checked) sleeveLongQty.value = '';
    }
}

document.querySelectorAll('input[name="sleeveShortOpt"], input[name="sleeveLongOpt"]').forEach(radio => {
    radio.addEventListener('change', updateSleeveState);
});
updateSleeveState();

// Sleeve Not Sure Event Listener
const sleeveNotSureElem = document.getElementById('qbSleeveNotSure');
if (sleeveNotSureElem) {
    sleeveNotSureElem.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.getElementById('sleeveError').style.display = 'none';
            sleeveShortAll.checked = false;
            sleeveShortFill.checked = false;
            sleeveLongAll.checked = false;
            sleeveLongFill.checked = false;
            sleeveShortQty.disabled = true;
            sleeveShortQty.value = '';
            sleeveLongQty.disabled = true;
            sleeveLongQty.value = '';
        } else {
            sleeveShortAll.checked = true;
            updateSleeveState();
        }
    });
}

// Image protection (prevent right-click and drag on images except inside lightbox content)
document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG' && !e.target.closest('.lightbox-content')) {
        e.preventDefault();
    }
}, false);

document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' && !e.target.closest('.lightbox-content')) {
        e.preventDefault();
    }
}, false);

window.startCustomDesign = function() {
    // DISABLED — Own Design Quote Builder turned off
    return;
};

window.filterByCategory = filterByCategory;

