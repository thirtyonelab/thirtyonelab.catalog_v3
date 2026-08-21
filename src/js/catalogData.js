// Catalog Data Assembler
// Merges split sub-catalogs and dynamically generates the HTML layout at runtime.

import { catalogProducts2026 } from './catalog2026.js';
import { catalogProducts2025 } from './catalog2025.js';
import { catalogProductsEvent } from './catalogEvent.js';
import { catalogProductsSpecs } from './catalogSpecs.js';

export { catalogProducts2026, catalogProducts2025, catalogProductsEvent, catalogProductsSpecs };

export let catalogProducts = [
  ...catalogProducts2026,
  ...catalogProducts2025,
  ...catalogProductsEvent,
  ...catalogProductsSpecs
];

export function getBasePath() {
    // Detect base path from current URL pathname
    // e.g. '/thirtyonelab.catalog/index.html' -> '/thirtyonelab.catalog/'
    // e.g. '/thirtyonelab.catalog/' -> '/thirtyonelab.catalog/'
    // e.g. '/' -> '/'
    var path = window.location.pathname;
    // Find the repo name segment (second slash)
    var parts = path.split('/').filter(Boolean);
    if (parts.length > 0 && (parts[0] === 'thirtyonelab.catalog_v3' || parts[0] === 'testing')) {
        return '/' + parts[0] + '/';
    }
    return '/';
}

export function encodeUrl(str) {
    return str.replace(/#/g, '%23');
}

export function resolveImagePath(path) {
    if (!path) return '';
    // Already an absolute URL (Supabase storage, https, etc.) — return as-is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return encodeUrl(path);
    // Relative path — prefix with base
    const base = getBasePath();
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return encodeUrl(base + cleanPath);
}

export function generateHtmlForProduct(p) {
    const mainImg = p.image ? resolveImagePath(p.image) : '';
    const addImgs = p.images ? p.images.map(img => resolveImagePath(img)) : [];
    
    // Combine all available images into one unique array
    const allImagesList = [];
    if (mainImg) allImagesList.push(mainImg);
    addImgs.forEach(img => {
        if (img && !allImagesList.includes(img)) allImagesList.push(img);
    });

    const hasMultipleImages = allImagesList.length > 1;
    const isNoSlide = p.noSlide || !hasMultipleImages;
    const noSlideClass = isNoSlide ? ' no-slide' : '';

    const frontImgSrc = allImagesList[0] || '';
    const backImgSrc = allImagesList[1] || '';
    const encodedImg = frontImgSrc;
    
    if (p.edition === 'prod-2026' || p.edition === 'prod-2025') {
        const badge = p.isNew ? '<span class="badge-new">New</span>' : '';
        let imgHtml = '';
        if (hasMultipleImages) {
            imgHtml = `<img src="${frontImgSrc}" alt="${p.id} Front" class="img-front"><img src="${backImgSrc}" alt="${p.id} Back" class="img-back">`;
        } else {
            const filename = p.image ? p.image.substring(p.image.lastIndexOf('/') + 1) : p.id;
            imgHtml = `<img src="${frontImgSrc}" alt="${filename}" class="img-front">`;
        }
        return `            <div class="product-card ${p.edition}${noSlideClass}" data-ref="${p.id}">
                <div class="image-container">${imgHtml}${badge ? badge : ''}</div>
            </div>`;
    }
    
    if (p.edition === 'prod-event') {
        const newBadge = p.isNew ? '<span class="badge-new">New</span>' : '';
        const eventTag = p.event_tag !== undefined ? p.event_tag : 'World Cup';
        const eventBadge = eventTag ? `<span class="badge-wc" data-event-tag="${eventTag}">${eventTag}</span>` : '';
        
        let imgHtml = '';
        if (hasMultipleImages) {
            imgHtml = `\n                    <img src="${frontImgSrc}" alt="${p.id} Front" class="img-front">\n                    <img src="${backImgSrc}" alt="${p.id} Back" class="img-back">`;
        } else {
            imgHtml = `\n                    <img src="${frontImgSrc}" alt="${p.id}" class="img-front">`;
        }
        return `            <div class="product-card ${p.edition}${noSlideClass}" data-ref="${p.id}">
                <div class="image-container">
                    ${newBadge}${eventBadge}${imgHtml}
                </div>
            </div>`;
    }
    
    if (p.edition === 'prod-nameset') {
        return `            <div class="product-card ${p.edition}">
                <div class="nameset-image-block"><img src="${encodedImg}" alt="Name Full Design"></div>
            </div>`;
    }
    
    if (p.edition === 'prod-sponsor') {
        return `            <div class="product-card ${p.edition}">
                <div class="sponsor-image-block"><img src="${encodedImg}" alt="Sponsor Full Design">
                </div>
            </div>`;
    }
    
    if (p.edition === 'prod-placementguide') {
        return `            <div class="product-card ${p.edition}">
                <div class="placementguide-image-block"><img src="${encodedImg}" alt="Placement Guide"></div>
            </div>`;
    }
    
    if (p.edition === 'prod-sizechart-shirt') {
        return `            <div class="product-card ${p.edition}">
                <div class="sizechart-image-block"><img src="${encodedImg}" alt="Shirt Size Chart 1"></div>
            </div>`;
    }
    
    if (p.edition === 'prod-sizechart-pants') {
        const altNum = p.id.includes('2') ? '2' : '1';
        return `            <div class="product-card ${p.edition}">
                <div class="sizechart-image-block"><img src="${encodedImg}" alt="Pants Size Chart ${altNum}"></div>
            </div>`;
    }
    
    if (p.edition === 'prod-sizechart-muslimah') {
        const altNum = p.id.includes('2') ? '2' : '1';
        return `            <div class="product-card ${p.edition}">
                <div class="sizechart-image-block"><img src="${encodedImg}" alt="Muslimah Size Chart ${altNum}"></div>
            </div>`;
    }
    
    if (p.edition === 'prod-material') {
        const iconsHtml = p.icons.map(icon => `<img src="${resolveImagePath('Image/Material/' + icon + '.webp')}" alt="${icon}" class="stat-icon">`).join('');
        const titleLine = `<h1 class="material-title">${p.title}${iconsHtml}</h1>`;
        
        let statsHtml = '';
        if (p.recommend) {
            statsHtml = `\n                    <div class="stats-container">
                        <div class="stat-box">
                            <span class="stat-label">Recommend</span>
                            <span class="stat-value">${p.recommend}</span>
                        </div>
                    </div>`;
        }
        
        return `            <div class="product-card ${p.edition}">
                <div class="card-image-wrapper">
                    <img src="${encodedImg}" alt="${p.id}" class="card-image">
                </div>
                <div class="card-content">
                    <div class="header-inline">
                        ${titleLine}
                        <span class="collection-name">${p.description}</span>
                    </div>${statsHtml}
                </div>
            </div>`;
    }
    
    if (p.edition === 'prod-cutting' || p.edition === 'prod-neck') {
        const imgClass = p.isButtonImage ? 'neck-image-button' : 'neck-image';
        return `            <div class="product-card ${p.edition}">
                <div class="neck-image-wrapper">
                    <img src="${encodedImg}" alt="${p.title}" class="${imgClass}">
                </div>
                <div class="neck-content">
                    <div class="neck-title-container">
                        <div class="neck-title-box">
                            <span class="neck-title">${p.title}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    return '';
}

// Also set on window for backward compatibility with any inline references
window.catalogProducts = catalogProducts;
