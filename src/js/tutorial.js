import { i18nTranslations } from './translations.js';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkTutorialStatus, 1500);
});

export function applyPopupTranslations() {
    const lang = localStorage.getItem('thirtyone_lang') || 'en';
    if (i18nTranslations && i18nTranslations[lang]) {
        const trans = i18nTranslations[lang];
        const titleEl = document.querySelector('#onboardingPopup h2');
        const descEl = document.querySelector('#onboardingPopup p');
        const yesBtn = document.getElementById('onboardingBtnYes');
        const noBtn = document.getElementById('onboardingBtnNo');
        
        if (titleEl && trans.tut_popup_title) titleEl.innerText = trans.tut_popup_title;
        if (descEl && trans.tut_popup_desc) descEl.innerText = trans.tut_popup_desc;
        if (yesBtn && trans.tut_popup_yes) yesBtn.innerText = trans.tut_popup_yes;
        if (noBtn && trans.tut_popup_no) noBtn.innerText = trans.tut_popup_no;
        
        const tutLangEN = document.getElementById('tutLangEN');
        const tutLangMS = document.getElementById('tutLangMS');
        if (tutLangEN && tutLangMS) {
            if (lang === 'en') {
                tutLangEN.classList.add('active');
                tutLangMS.classList.remove('active');
            } else {
                tutLangMS.classList.add('active');
                tutLangEN.classList.remove('active');
            }
        }
    }
}

// Make available globally for inline onclick handlers
window.applyPopupTranslations = applyPopupTranslations;

function checkTutorialStatus() {
    const choice = sessionStorage.getItem('thirtyone_tutorial_choice');
    if (!choice) {
        applyPopupTranslations();
        const popup = document.getElementById('onboardingPopup');
        if (popup) {
            popup.style.display = 'flex';
        }
        
        const btnYes = document.getElementById('onboardingBtnYes');
        const btnNo = document.getElementById('onboardingBtnNo');
        
        if (btnYes) {
            btnYes.addEventListener('click', () => {
                sessionStorage.setItem('thirtyone_tutorial_choice', 'yes');
                if (popup) popup.style.display = 'none';
                document.body.classList.add('tutorial-running');
                initTutorial();
            });
        }
        if (btnNo) {
            btnNo.addEventListener('click', () => {
                sessionStorage.setItem('thirtyone_tutorial_choice', 'no');
                if (popup) popup.style.display = 'none';
            });
        }
    }
}

function initTutorial() {
    const backdrop = document.getElementById('tutBackdrop');
    const infoBox = document.getElementById('tutInfoBox');
    const infoText = document.getElementById('tutInfoText');
    const nextBtn = document.getElementById('tutNextBtn');
    
    if (!infoBox || !infoText || !nextBtn) return;

    let currentStep = 0;
    let activeTargetEl = null;
    let activeStepPosition = 'below';
    let trackingInterval = null;
    
    let blocker = document.getElementById('tutBlocker');
    if (!blocker) {
        blocker = document.createElement('div');
        blocker.id = 'tutBlocker';
        blocker.style.position = 'fixed';
        blocker.style.top = '0';
        blocker.style.left = '0';
        blocker.style.width = '100vw';
        blocker.style.height = '100vh';
        blocker.style.zIndex = '9000';
        blocker.style.background = 'transparent';
        
        const preventScroll = (e) => e.preventDefault();
        blocker.addEventListener('touchmove', preventScroll, { passive: false });
        blocker.addEventListener('wheel', preventScroll, { passive: false });
        
        document.body.appendChild(blocker);
    }
    blocker.style.display = 'block';
    
    window.tutPreventScroll = (e) => {
        e.preventDefault();
    };
    window.addEventListener('touchmove', window.tutPreventScroll, { passive: false });
    window.addEventListener('wheel', window.tutPreventScroll, { passive: false });
    
    const steps = [
        {
            targetId: 'tut-btn-collection',
            textI18n: 'tut_step1_info',
            position: 'below'
        },
        {
            targetId: 'tut-btn-own',
            textI18n: 'tut_step2_info',
            position: 'below'
        },
        {
            targetId: 'tut-spec-container',
            textI18n: 'tut_step3_info',
            position: 'force-below'
        },
        {
            targetId: 'tut-edition-container',
            textI18n: 'tut_step4_info',
            position: 'below'
        },
        {
            getTarget: () => Array.from(document.querySelectorAll('.catalog-grid .product-card')).find(el => el.offsetWidth > 0 && el.offsetHeight > 0),
            textI18n: 'tut_step5_info',
            autoClickTarget: true,
            delayAfterClick: 1000,
            position: 'above'
        },
        {
            targetId: 'openQuoteBuilderBtn',
            textI18n: 'tut_step6_info',
            position: 'above'
        }
    ];

    function updateHolePosition() {
        if (!activeTargetEl) return;
        const rect = activeTargetEl.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        let hole = document.getElementById('tutHole');
        if (hole) {
            const isModal = activeTargetEl.closest('.lightbox-overlay') || activeTargetEl.closest('.modal-overlay');
            if (isModal) {
                hole.style.position = 'fixed';
                hole.style.top = rect.top + 'px';
                hole.style.left = rect.left + 'px';
            } else {
                hole.style.position = 'absolute';
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                hole.style.top = (rect.top + scrollTop) + 'px';
                hole.style.left = (rect.left + scrollLeft) + 'px';
            }
            hole.style.width = rect.width + 'px';
            hole.style.height = rect.height + 'px';
            hole.style.display = 'block';
        }

        if (infoBox && infoBox.style.display !== 'none') {
            if (infoBox.parentNode !== document.body) {
                document.body.appendChild(infoBox);
                infoBox.style.position = 'fixed';
                infoBox.style.zIndex = '9001';
            }

            let boxTop;
            if (activeStepPosition === 'above') {
                boxTop = rect.top - infoBox.offsetHeight - 5;
            } else {
                boxTop = rect.bottom + 5;
            }
            
            if (boxTop + infoBox.offsetHeight > window.innerHeight && activeStepPosition !== 'force-below') {
                boxTop = rect.top - infoBox.offsetHeight - 5;
            }
            
            if (boxTop + infoBox.offsetHeight > window.innerHeight - 10) {
                boxTop = window.innerHeight - infoBox.offsetHeight - 10;
            }

            if (boxTop < 10) {
                boxTop = 10;
            }
            
            infoBox.style.top = boxTop + 'px';
            infoBox.style.bottom = 'auto';

            if (window.innerWidth <= 480) {
                // On mobile view, keep it centered horizontally using absolute/fixed margins
                infoBox.style.left = '0';
                infoBox.style.right = '0';
                infoBox.style.marginLeft = 'auto';
                infoBox.style.marginRight = 'auto';
                infoBox.style.transform = 'none';
                infoBox.style.width = '90%';
                infoBox.style.maxWidth = '400px';
            } else {
                // On desktop/tablet, center relative to the highlighted target element
                const targetCenter = rect.left + rect.width / 2;
                const boxWidth = infoBox.offsetWidth || 380;
                let leftPos = targetCenter - boxWidth / 2;

                // Boundaries check
                if (leftPos < 10) {
                    leftPos = 10;
                }
                if (leftPos + boxWidth > window.innerWidth - 10) {
                    leftPos = window.innerWidth - boxWidth - 10;
                }

                infoBox.style.left = leftPos + 'px';
                infoBox.style.right = 'auto';
                infoBox.style.marginLeft = '0';
                infoBox.style.marginRight = '0';
                infoBox.style.transform = 'none';
                infoBox.style.width = '90%';
                infoBox.style.maxWidth = '400px';
            }
        }
    }

    function startTracking(duration = 1200) {
        if (trackingInterval) clearInterval(trackingInterval);
        const startTime = Date.now();
        trackingInterval = setInterval(() => {
            updateHolePosition();
            if (Date.now() - startTime > duration) {
                clearInterval(trackingInterval);
                trackingInterval = null;
            }
        }, 16);
    }

    window.addEventListener('resize', updateHolePosition);
    window.addEventListener('scroll', updateHolePosition, { passive: true, capture: true });

    function showStep(index) {
        if (index >= steps.length) {
            endTutorial();
            return;
        }

        const step = steps[index];
        const targetEl = step.targetId ? document.getElementById(step.targetId) : 
                         (step.targetSelector ? document.querySelector(step.targetSelector) : 
                         (step.getTarget ? step.getTarget() : null));
        
        if (!targetEl) {
            showStep(index + 1);
            return;
        }

        activeTargetEl = targetEl;
        activeStepPosition = step.position || 'below';

        if (!targetEl.closest('.lightbox-overlay') && !targetEl.closest('.modal-overlay')) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        if (i18nTranslations && i18nTranslations[lang] && i18nTranslations[lang][step.textI18n]) {
            infoText.innerText = i18nTranslations[lang][step.textI18n];
        } else {
            infoText.innerText = step.textI18n;
        }
        
        if (i18nTranslations && i18nTranslations[lang]) {
            if (index === steps.length - 1 && i18nTranslations[lang]['tut_finish']) {
                nextBtn.innerText = i18nTranslations[lang]['tut_finish'];
            } else if (i18nTranslations[lang]['tut_next']) {
                nextBtn.innerText = i18nTranslations[lang]['tut_next'];
            }
        }

        let hole = document.getElementById('tutHole');
        if (!hole) {
            hole = document.createElement('div');
            hole.id = 'tutHole';
            hole.style.pointerEvents = 'none';
            hole.style.zIndex = '9000';
            hole.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.75), 0 0 0 4px rgba(255,255,255,1) inset';
            hole.style.borderRadius = '0';
            document.body.appendChild(hole);
        }

        infoBox.style.display = 'block';
        if (backdrop) backdrop.style.display = 'none';

        // Trigger smooth scroll animation tracking
        startTracking(1200);

        currentStep = index + 1;
    }

    function endTutorial() {
        window.removeEventListener('resize', updateHolePosition);
        window.removeEventListener('scroll', updateHolePosition, { capture: true });
        if (trackingInterval) clearInterval(trackingInterval);

        if (backdrop) backdrop.style.display = 'none';
        infoBox.style.display = 'none';
        
        const hole = document.getElementById('tutHole');
        if (hole) hole.style.display = 'none';
        
        const blocker = document.getElementById('tutBlocker');
        if (blocker) blocker.style.display = 'none';
        
        if (typeof window.closeLightbox === 'function') {
            window.closeLightbox();
        }
        
        if (window.tutPreventScroll) {
            window.removeEventListener('touchmove', window.tutPreventScroll, { passive: false });
            window.removeEventListener('wheel', window.tutPreventScroll, { passive: false });
            delete window.tutPreventScroll;
        }

        document.body.classList.remove('tutorial-running');

        setTimeout(() => {
            const homeEl = document.getElementById('home');
            if (homeEl) {
                try {
                    homeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch (err) {
                    homeEl.scrollIntoView(true);
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const wrapper = document.getElementById('appContainer');
            if (wrapper) {
                try {
                    wrapper.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (err) {
                    wrapper.scrollTop = 0;
                }
            }
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 400);
    }

    nextBtn.addEventListener('click', () => {
        const step = steps[currentStep - 1];
        
        const hole = document.getElementById('tutHole');
        if (hole) hole.style.display = 'none';
        infoBox.style.display = 'none';

        if (step.autoClickTarget) {
            const targetEl = step.targetId ? document.getElementById(step.targetId) : 
                             (step.targetSelector ? document.querySelector(step.targetSelector) : 
                             (step.getTarget ? step.getTarget() : null));
            if (targetEl) targetEl.click();
            
            const delay = step.delayAfterClick || 400;
            setTimeout(() => {
                showStep(currentStep);
            }, delay);
        } else if (step.customAction) {
            step.customAction(() => {
                showStep(currentStep);
            });
        } else {
            showStep(currentStep);
        }
    });

    window.scrollTo({ top: 0, behavior: 'auto' });
    const wrapper = document.getElementById('appContainer');
    if (wrapper) wrapper.scrollTo({ top: 0, behavior: 'auto' });
    
    showStep(0);
}
