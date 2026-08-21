import { i18nTranslations } from './translations.js';

function getDefaultLanguage() {
    const saved = localStorage.getItem('thirtyone_lang');
    if (saved) return saved;

    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browserLang.startsWith('ms')) {
        return 'ms';
    }
    return 'en';
}

let currentLang = getDefaultLanguage();

window.setLanguage = function(lang) {
    if (!i18nTranslations[lang]) return;
    currentLang = lang;
    localStorage.setItem('thirtyone_lang', lang);

    const btnEN = document.getElementById('langBtnEN');
    const btnMS = document.getElementById('langBtnMS');
    if (btnEN && btnMS) {
        if (lang === 'en') {
            btnEN.classList.add('active');
            btnMS.classList.remove('active');
        } else {
            btnMS.classList.add('active');
            btnEN.classList.remove('active');
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (i18nTranslations[lang] && i18nTranslations[lang][key]) {
            elem.innerText = i18nTranslations[lang][key];
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    window.setLanguage(currentLang);
});
