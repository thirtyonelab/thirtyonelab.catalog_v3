import { configData } from './config.js';
import { i18nTranslations } from './translations.js';

export let quoteSelectionsOwn = {
    design: null,
    alterDesign: 'No',
    quantity: null,
    isEstimatedQuantity: false,
    material: null,
    cutting: null,
    sleeve: null,
    nameset: 'No',
    shortPants: 'No',
    neck: null
};
export let currentQuoteStepOwn = 1;
const quoteBuilderOwnModal = document.getElementById('quoteBuilderOwnModal');

// Init Quote Builder using configData from config.js
initQuoteBuilderOwn();

export function openQuoteBuilderOwn() {
    try {
        quoteBuilderOwnModal.classList.add('active');
        quoteBuilderOwnModal.scrollTop = 0;
        document.body.classList.add('no-scroll');
        currentQuoteStepOwn = 2;

        // Reset quantity checkbox and input status
        document.getElementById('qbOwnQuantityNotSure').checked = false;
        document.getElementById('qbOwnQuantity').disabled = false;
        document.getElementById('qbOwnQuantity').style.opacity = '';
        document.getElementById('qbOwnQuantity').value = configData.minimumOrderQuantity;
        quoteSelectionsOwn.isEstimatedQuantity = false;

        // Reset sleeve state
        const sleeveOwnNotSureReset = document.getElementById('qbOwnSleeveNotSure');
        if (sleeveOwnNotSureReset) sleeveOwnNotSureReset.checked = false;
        document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]').checked = true;
        document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]').checked = false;
        if (typeof updateSleeveOwnState === 'function') updateSleeveOwnState();

        // Reset card previews
        if (typeof window.updateMaterialPreview === 'function') {
            window.updateMaterialPreview('qbOwnMaterialPreview', '');
            if (typeof window.updateCuttingPreview === 'function') window.updateCuttingPreview('qbOwnCuttingPreview', '');
            window.updateNeckPreview('qbOwnNeckPreview', '');
        }

        updateQuoteStepOwn();
    } catch (e) {
        alert("Error in openQuoteBuilderOwn: " + e.message);
    }
}

document.getElementById('quoteBuilderOwnClose').addEventListener('click', () => {
    quoteBuilderOwnModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

// Quote Builder Logic
function initQuoteBuilderOwn() {
    // Populate dynamic selects
    document.getElementById('qbOwnQuantity').min = configData.minimumOrderQuantity;
    document.getElementById('qbOwnQuantity').value = configData.minimumOrderQuantity;

    populateSelectOwn('qbOwnMaterial', configData.materials);
    populateSelectOwn('qbOwnCutting', configData.cuttings);
    populateSelectOwn('qbOwnNeck', configData.necks);

    // Bind change listeners for material & neck previews
    const matSelect = document.getElementById('qbOwnMaterial');
    if (matSelect) {
        matSelect.addEventListener('change', (e) => {
            if (typeof window.updateMaterialPreview === 'function') {
                window.updateMaterialPreview('qbOwnMaterialPreview', e.target.value);
            }
        });
    }

    const cuttingSelect = document.getElementById('qbOwnCutting');
    if (cuttingSelect) {
        cuttingSelect.addEventListener('change', (e) => {
            if (typeof window.updateCuttingPreview === 'function') {
                window.updateCuttingPreview('qbOwnCuttingPreview', e.target.value);
            }
        });
    }

    const neckSelect = document.getElementById('qbOwnNeck');
    if (neckSelect) {
        neckSelect.addEventListener('change', (e) => {
            if (typeof window.updateNeckPreview === 'function') {
                window.updateNeckPreview('qbOwnNeckPreview', e.target.value);
            }
        });
    }

    // Quantity Not Sure (Estimate Quantity) Change Event Listener
    document.getElementById('qbOwnQuantityNotSure').addEventListener('change', (e) => {
        // Quantity input box remains enabled regardless of checkbox state
    });

    // Sleeve Not Sure Event Listener is added below where updateSleeveOwnState is defined
}

function populateSelectOwn(id, list) {
    const select = document.getElementById(id);
    if (!select) return;
    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    const chooseText = lang === 'ms' ? '-- Pilih Pilihan --' : '-- Choose Option --';
    select.innerHTML = `<option value="">${chooseText}</option>`;
    list.forEach(item => {
        select.innerHTML += `<option value="${item.label}">${item.label}</option>`;
    });
}

function updateQuoteStepOwn() {
    document.querySelectorAll('#quoteBuilderOwnModal .quote-step').forEach(el => el.style.display = 'none');
    document.getElementById(`stepOwn${currentQuoteStepOwn}`).style.display = 'block';

    const stepDisplayNum = currentQuoteStepOwn - 1;
    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    const stepLabel = i18nTranslations[lang]?.qb_step_label || 'Step';
    const stepOf = i18nTranslations[lang]?.qb_step_of || 'of';

    const progressText = currentQuoteStepOwn <= 7 ? `${stepLabel} ${stepDisplayNum} ${stepOf} 6` : (lang === 'ms' ? 'Semakan' : 'Summary');
    document.getElementById('quoteProgressOwn').innerText = progressText;

    if (typeof window.setLanguage === 'function') {
        window.setLanguage(lang);
    }

    // Show/hide WhatsApp guide panel (only on step 2 / Quantity step)
    const guidePanel = document.getElementById('waGuidePanel');
    const modalContent = document.querySelector('.quote-modal-content--own');
    const modalLayout = document.querySelector('.own-modal-layout');
    if (guidePanel) {
        if (currentQuoteStepOwn === 2) {
            guidePanel.style.display = '';
            if (modalContent) modalContent.style.maxWidth = '';
            if (modalLayout) modalLayout.style.gridTemplateColumns = '';
        } else {
            guidePanel.style.display = 'none';
            if (modalContent) modalContent.style.maxWidth = '520px';
            if (modalLayout) modalLayout.style.gridTemplateColumns = '1fr';
        }
    }

    if (currentQuoteStepOwn === 3) {
        if (typeof window.updateMaterialPreview === 'function') {
            window.updateMaterialPreview('qbOwnMaterialPreview', document.getElementById('qbOwnMaterial').value);
        }
    } else if (currentQuoteStepOwn === 4) {
        if (typeof window.updateCuttingPreview === 'function') {
            window.updateCuttingPreview('qbOwnCuttingPreview', document.getElementById('qbOwnCutting').value);
        }
    } else if (currentQuoteStepOwn === 5) {
        if (typeof window.updateNeckPreview === 'function') {
            window.updateNeckPreview('qbOwnNeckPreview', document.getElementById('qbOwnNeck').value);
        }
    }

    if (currentQuoteStepOwn === 8) {
        // Build summary
        let designStr = quoteSelectionsOwn.design === 'Custom' || quoteSelectionsOwn.design === 'For Your Own Design' ? (lang === 'ms' ? 'Reka Bentuk Sendiri' : 'Use My Own Design') : (/^\d+$/.test(quoteSelectionsOwn.design) ? `#${quoteSelectionsOwn.design}` : quoteSelectionsOwn.design);
        if (quoteSelectionsOwn.alterDesign === 'Yes') designStr += (lang === 'ms' ? ' (Edit Mockup)' : ' (Edit Mockup)');

        let qtyDisplay = `${quoteSelectionsOwn.quantity} ${lang === 'ms' ? 'helai' : 'pieces'}`;
        if (quoteSelectionsOwn.isEstimatedQuantity) {
            qtyDisplay += ' (Estimated)';
        }
        document.getElementById('summaryOwnDesign').innerText = designStr;
        document.getElementById('summaryOwnQuantity').innerText = qtyDisplay;
        document.getElementById('summaryOwnMaterial').innerText = quoteSelectionsOwn.material;
        document.getElementById('summaryOwnCutting').innerText = quoteSelectionsOwn.cutting;
        document.getElementById('summaryOwnSleeve').innerText = quoteSelectionsOwn.sleeve;
        document.getElementById('summaryOwnNameset').innerText = quoteSelectionsOwn.nameset;
        document.getElementById('summaryOwnShortPants').innerText = quoteSelectionsOwn.shortPants;
        document.getElementById('summaryOwnNeck').innerText = quoteSelectionsOwn.neck;
    }
}

function nextStepOwn() {
    if (currentQuoteStepOwn === 1) {
        quoteSelectionsOwn.alterDesign = 'No';
    }
    if (currentQuoteStepOwn === 2) {
        const isEstimated = document.getElementById('qbOwnQuantityNotSure').checked;
        const qtyVal = parseInt(document.getElementById('qbOwnQuantity').value) || 0;
        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        if (qtyVal < configData.minimumOrderQuantity) {
            alert(`${lang === 'ms' ? 'Kuantiti minimum adalah' : 'Minimum order is'} ${configData.minimumOrderQuantity}`); return;
        }
        quoteSelectionsOwn.quantity = qtyVal;
        quoteSelectionsOwn.isEstimatedQuantity = isEstimated;
    }
    if (currentQuoteStepOwn === 3) {
        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        if (!document.getElementById('qbOwnMaterial').value) { alert(lang === 'ms' ? 'Sila pilih material' : 'Please select material'); return; }
        quoteSelectionsOwn.material = document.getElementById('qbOwnMaterial').value;
    }
    if (currentQuoteStepOwn === 4) {
        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        if (!document.getElementById('qbOwnCutting').value) { alert(lang === 'ms' ? 'Sila pilih cutting' : 'Please select cutting'); return; }
        quoteSelectionsOwn.cutting = document.getElementById('qbOwnCutting').value;
    }
    if (currentQuoteStepOwn === 5) {
        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        if (!document.getElementById('qbOwnNeck').value) { alert(lang === 'ms' ? 'Sila pilih kolar' : 'Please select neck'); return; }
        quoteSelectionsOwn.neck = document.getElementById('qbOwnNeck').value;
    }
    if (currentQuoteStepOwn === 6) {
        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        const sleeveOwnNotSure = document.getElementById('qbOwnSleeveNotSure')?.checked;
        if (sleeveOwnNotSure) {
            quoteSelectionsOwn.sleeve = lang === 'ms' ? "Belum Pasti Lagi" : "Not Sure Yet";
            document.getElementById('sleeveOwnError').style.display = 'none';
        } else {
            const totalQty = parseInt(quoteSelectionsOwn.quantity);
            if (document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]').checked) {
                quoteSelectionsOwn.sleeve = lang === 'ms' ? "Lengan Pendek (Semua)" : "Short Sleeve (All)";
            } else if (document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]').checked) {
                quoteSelectionsOwn.sleeve = lang === 'ms' ? "Lengan Panjang (Semua)" : "Long Sleeve (All)";
            } else {
                const sQty = parseInt(document.getElementById('qbOwnSleeveShortQty').value) || 0;
                const lQty = parseInt(document.getElementById('qbOwnSleeveLongQty').value) || 0;

                if (quoteSelectionsOwn.quantity !== "Not Sure Yet" && quoteSelectionsOwn.quantity !== "Belum Pasti Lagi" && sQty + lQty !== totalQty) {
                    document.getElementById('sleeveOwnError').style.display = 'block';
                    return;
                }
                document.getElementById('sleeveOwnError').style.display = 'none';

                let sleeveStr = [];
                if (sQty > 0) sleeveStr.push(lang === 'ms' ? `Lengan Pendek (${sQty})` : `Short Sleeve (${sQty})`);
                if (lQty > 0) sleeveStr.push(lang === 'ms' ? `Lengan Panjang (${lQty})` : `Long Sleeve (${lQty})`);
                quoteSelectionsOwn.sleeve = sleeveStr.join(', ') || (lang === 'ms' ? "Tiada konfigurasi lengan" : "No sleeve config selected");
            }
        }
    }
    if (currentQuoteStepOwn === 7) {
        quoteSelectionsOwn.nameset = document.querySelector('input[name="addOwnNameset"]:checked')?.value || 'No';
        quoteSelectionsOwn.shortPants = document.querySelector('input[name="addOwnPants"]:checked')?.value || 'No';
    }

    currentQuoteStepOwn++;
    updateQuoteStepOwn();
}

function prevStepOwn() {
    if (currentQuoteStepOwn > 2) {
        currentQuoteStepOwn--;
        updateQuoteStepOwn();
    }
}

document.querySelectorAll('.qb-own-next').forEach((btn) => {
    btn.addEventListener('click', nextStepOwn);
});
document.querySelectorAll('.qb-own-prev').forEach((btn) => {
    btn.addEventListener('click', prevStepOwn);
});

// WhatsApp Generator
document.getElementById('sendWhatsAppOwnBtn').addEventListener('click', () => {
    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    let designText = quoteSelectionsOwn.design === 'Custom' || quoteSelectionsOwn.design === 'For Your Own Design' 
        ? (lang === 'ms' ? 'Reka Bentuk Sendiri' : 'Use My Own Design') 
        : (/^\d+$/.test(quoteSelectionsOwn.design) ? `#${quoteSelectionsOwn.design}` : quoteSelectionsOwn.design);
    if (quoteSelectionsOwn.alterDesign === 'Yes') {
        designText += (lang === 'ms' ? ' (Edit Mockup)' : ' (Edit Mockup)');
    }

    // Format quantity text
    let qtyText = `${quoteSelectionsOwn.quantity} ${lang === 'ms' ? 'helai' : 'pieces'}`;
    if (quoteSelectionsOwn.isEstimatedQuantity) {
        qtyText += ' (Estimated)';
    }

    const greeting = i18nTranslations[lang]?.wa_greeting || "Hi ThirtyOne Lab! I'm interested in ordering:";
    const closing = i18nTranslations[lang]?.wa_closing || "Could I get a quotation for this order?";

    // SPEC FIELD LABELS STRICTLY STAY IN ENGLISH AS REQUESTED BY USER
    const message = `${greeting}

Design: ${designText}
Quantity: ${qtyText}
Material: ${quoteSelectionsOwn.material}
Cutting: ${quoteSelectionsOwn.cutting}
Neck/Collar: ${quoteSelectionsOwn.neck}
Sleeve: ${quoteSelectionsOwn.sleeve}
Nameset: ${quoteSelectionsOwn.nameset}
Short Pants: ${quoteSelectionsOwn.shortPants}

${closing}`;

    const encoded = encodeURIComponent(message);
    const myWhatsAppNumber = "601125614436";
    window.open(`https://wa.me/${myWhatsAppNumber}?text=${encoded}`, '_blank');
});

// Sleeve Table Logic
const sleeveOwnShortAll = document.querySelector('input[name="sleeveOwnShortOpt"][value="all"]');
const sleeveOwnShortFill = document.querySelector('input[name="sleeveOwnShortOpt"][value="fill"]');
const sleeveOwnShortQty = document.getElementById('qbOwnSleeveShortQty');

const sleeveOwnLongAll = document.querySelector('input[name="sleeveOwnLongOpt"][value="all"]');
const sleeveOwnLongFill = document.querySelector('input[name="sleeveOwnLongOpt"][value="fill"]');
const sleeveOwnLongQty = document.getElementById('qbOwnSleeveLongQty');

function updateSleeveOwnState(event) {
    if (!sleeveOwnShortAll) return; // safety

    const sleeveOwnNotSure = document.getElementById('qbOwnSleeveNotSure');
    if (event && sleeveOwnNotSure && sleeveOwnNotSure.checked) {
        sleeveOwnNotSure.checked = false;
    }

    // Uncheck quantity "Not sure yet" if Short or Long Sleeve "All" is selected
    if (sleeveOwnShortAll.checked || (sleeveOwnLongAll && sleeveOwnLongAll.checked)) {
        const qtyNotSure = document.getElementById('qbOwnQuantityNotSure');
        if (qtyNotSure && qtyNotSure.checked) {
            qtyNotSure.checked = false;
            const qtyInput = document.getElementById('qbOwnQuantity');
            qtyInput.disabled = false;
            qtyInput.style.opacity = '';
        }
    }

    // Handle mutual exclusivity of options
    if (sleeveOwnShortAll.checked && event && (event.target === sleeveOwnShortAll || event.target.name === 'sleeveOwnShortOpt')) {
        if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
        if (sleeveOwnLongFill) sleeveOwnLongFill.checked = false;
    } else if (sleeveOwnLongAll && sleeveOwnLongAll.checked && event && (event.target === sleeveOwnLongAll || event.target.name === 'sleeveOwnLongOpt')) {
        sleeveOwnShortAll.checked = false;
        sleeveOwnShortFill.checked = false;
    } else if (sleeveOwnShortFill.checked && event && event.target === sleeveOwnShortFill) {
        if (sleeveOwnLongFill) sleeveOwnLongFill.checked = true;
        if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
    } else if (sleeveOwnLongFill && sleeveOwnLongFill.checked && event && event.target === sleeveOwnLongFill) {
        sleeveOwnShortFill.checked = true;
        sleeveOwnShortAll.checked = false;
    }

    if (sleeveOwnShortAll.checked) {
        sleeveOwnShortQty.disabled = true;
        sleeveOwnShortQty.value = '';

        if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
        if (sleeveOwnLongFill) sleeveOwnLongFill.checked = false;
        if (sleeveOwnLongQty) {
            sleeveOwnLongQty.disabled = true;
            sleeveOwnLongQty.value = '';
        }
    } else if (sleeveOwnLongAll && sleeveOwnLongAll.checked) {
        if (sleeveOwnLongQty) {
            sleeveOwnLongQty.disabled = true;
            sleeveOwnLongQty.value = '';
        }

        sleeveOwnShortAll.checked = false;
        sleeveOwnShortFill.checked = false;
        sleeveOwnShortQty.disabled = true;
        sleeveOwnShortQty.value = '';
    } else {
        // Both are Fill in
        sleeveOwnShortQty.disabled = !sleeveOwnShortFill.checked;
        if (!sleeveOwnShortFill.checked) sleeveOwnShortQty.value = '';

        if (sleeveOwnLongQty && sleeveOwnLongFill) {
            sleeveOwnLongQty.disabled = !sleeveOwnLongFill.checked;
            if (!sleeveOwnLongFill.checked) sleeveOwnLongQty.value = '';
        }
    }
}

document.querySelectorAll('input[name="sleeveOwnShortOpt"], input[name="sleeveOwnLongOpt"]').forEach(radio => {
    radio.addEventListener('change', updateSleeveOwnState);
});
if (sleeveOwnShortAll) updateSleeveOwnState();

// Sleeve Not Sure Event Listener
const sleeveOwnNotSureElem = document.getElementById('qbOwnSleeveNotSure');
if (sleeveOwnNotSureElem) {
    sleeveOwnNotSureElem.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.getElementById('sleeveOwnError').style.display = 'none';
            sleeveOwnShortAll.checked = false;
            sleeveOwnShortFill.checked = false;
            if (sleeveOwnLongAll) sleeveOwnLongAll.checked = false;
            if (sleeveOwnLongFill) sleeveOwnLongFill.checked = false;
            if (sleeveOwnShortQty) { sleeveOwnShortQty.disabled = true; sleeveOwnShortQty.value = ''; }
            if (sleeveOwnLongQty) { sleeveOwnLongQty.disabled = true; sleeveOwnLongQty.value = ''; }
        } else {
            if (sleeveOwnShortAll) sleeveOwnShortAll.checked = true;
            updateSleeveOwnState();
        }
    });
}