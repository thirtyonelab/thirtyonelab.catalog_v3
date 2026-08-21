# Feature Archive: Tutorial & Quote Builder System
*Saved for future restoration / reference per user request (Version 3 Upgrade)*

---

## 1. Onboarding Tutorial System (`tutorial.js`)

### Overview
The tutorial system displays an initial onboarding dialog asking: *"Welcome to ThirtyOne Lab - Is this your first time here? Would you like a quick tutorial on how to use our platform?"*
If accepted, it runs a step-by-step interactive spotlight walkthrough across key interface elements (`#tut-btn-collection`, `#tut-btn-own`, `#tut-spec-container`, `#tut-edition-container`, `#catalogGrid`).

### Complete Code of `tutorial.js`:
```javascript
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
        if (e.target === nextBtn || e.target.closest('#tutInfoBox')) return;
        e.preventDefault();
    };
    
    window.addEventListener('wheel', window.tutPreventScroll, { passive: false });
    window.addEventListener('touchmove', window.tutPreventScroll, { passive: false });
    
    const steps = [
        {
            target: '#tut-btn-collection',
            key: 'tut_step1',
            position: 'below'
        },
        {
            target: '#tut-btn-own',
            key: 'tut_step2',
            position: 'below'
        },
        {
            target: '#tut-spec-container',
            key: 'tut_step3',
            position: 'below'
        },
        {
            target: '#tut-edition-container',
            key: 'tut_step4',
            position: 'below'
        },
        {
            target: '#catalogGrid',
            key: 'tut_step5',
            position: 'top-inside'
        }
    ];

    function showStep(index) {
        if (index >= steps.length) {
            endTutorial();
            return;
        }

        const step = steps[index];
        const targetEl = document.querySelector(step.target);
        
        if (!targetEl) {
            showStep(index + 1);
            return;
        }

        const lang = localStorage.getItem('thirtyone_lang') || 'en';
        if (i18nTranslations && i18nTranslations[lang] && i18nTranslations[lang][step.key]) {
            infoText.innerText = i18nTranslations[lang][step.key];
        } else {
            infoText.innerText = `Step ${index + 1}`;
        }

        const nextLabel = (index === steps.length - 1)
            ? (i18nTranslations[lang]?.tut_finish || 'Got it!')
            : (i18nTranslations[lang]?.tut_next || 'Next');
        nextBtn.innerText = nextLabel;

        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
            targetEl.classList.add('tut-highlight');
            activeTargetEl = targetEl;
            activeStepPosition = step.position;

            backdrop.style.display = 'block';
            infoBox.style.display = 'block';

            if (blocker) blocker.style.pointerEvents = 'none';

            let alignPos = 'center';
            if (step.target === '#catalogGrid') alignPos = 'start';
            else if (step.target === '#tut-spec-container' || step.target === '#tut-edition-container') alignPos = 'center';
            
            targetEl.scrollIntoView({ behavior: 'smooth', block: alignPos });

            setTimeout(() => {
                updatePosition();
                if (blocker) blocker.style.pointerEvents = 'auto';
            }, 600);

            if (trackingInterval) clearInterval(trackingInterval);
            trackingInterval = setInterval(() => {
                if (activeTargetEl && infoBox.style.display === 'block') {
                    updatePosition();
                }
            }, 50);

        } else {
            let alignPos = 'center';
            if (step.target === '#catalogGrid') alignPos = 'start';
            else if (step.target === '#tut-spec-container' || step.target === '#tut-edition-container') alignPos = 'center';

            if (blocker) blocker.style.pointerEvents = 'none';
            targetEl.scrollIntoView({ behavior: 'smooth', block: alignPos });

            setTimeout(() => {
                if (blocker) blocker.style.pointerEvents = 'auto';
                document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
                targetEl.classList.add('tut-highlight');
                activeTargetEl = targetEl;
                activeStepPosition = step.position;

                backdrop.style.display = 'block';
                infoBox.style.display = 'block';
                updatePosition();

                if (trackingInterval) clearInterval(trackingInterval);
                trackingInterval = setInterval(() => {
                    if (activeTargetEl && infoBox.style.display === 'block') {
                        updatePosition();
                    }
                }, 50);
            }, 450);
        }
    }

    function updatePosition() {
        if (!activeTargetEl) return;
        const rect = activeTargetEl.getBoundingClientRect();
        const infoRect = infoBox.getBoundingClientRect();
        
        let top = 0;
        let left = 0;

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            left = (window.innerWidth - infoRect.width) / 2;
            if (activeStepPosition === 'top-inside') {
                top = rect.top + 15;
            } else if (activeStepPosition === 'below') {
                top = rect.bottom + 12;
            } else {
                top = rect.top - infoRect.height - 12;
            }
            if (top + infoRect.height > window.innerHeight - 15) {
                top = window.innerHeight - infoRect.height - 15;
            }
            if (top < 15) {
                top = 15;
            }
        } else {
            left = rect.left + (rect.width / 2) - (infoRect.width / 2);
            if (activeStepPosition === 'top-inside') {
                top = rect.top + 20;
            } else if (activeStepPosition === 'below') {
                top = rect.bottom + 15;
            } else {
                top = rect.top - infoRect.height - 15;
            }
            if (left < 15) left = 15;
            if (left + infoRect.width > window.innerWidth - 15) {
                left = window.innerWidth - infoRect.width - 15;
            }
            if (top + infoRect.height > window.innerHeight - 15) {
                top = window.innerHeight - infoRect.height - 15;
            }
            if (top < 15) {
                top = 15;
            }
        }

        infoBox.style.top = `${top}px`;
        infoBox.style.left = `${left}px`;
    }

    nextBtn.onclick = () => {
        currentStep++;
        showStep(currentStep);
    };

    function endTutorial() {
        if (trackingInterval) clearInterval(trackingInterval);
        if (blocker) blocker.style.display = 'none';
        
        if (window.tutPreventScroll) {
            window.removeEventListener('wheel', window.tutPreventScroll);
            window.removeEventListener('touchmove', window.tutPreventScroll);
            window.tutPreventScroll = null;
        }
        
        document.body.classList.remove('tutorial-running');
        backdrop.style.display = 'none';
        infoBox.style.display = 'none';
        document.querySelectorAll('.tut-highlight').forEach(el => el.classList.remove('tut-highlight'));
    }

    showStep(currentStep);
}
```

---

## 2. Automated Quote Builder Modal (`app_v2.js` & `config.js`)

### Flow Architecture (8 Steps)
1. **Step 1 - Selected Design Confirmation**:
   Displays selected design reference, asks *"Edit mockup design?" (Yes / No)*.
2. **Step 2 - Quantity**:
   Input box with min quantity 5 (from config), plus *"Estimate quantity"* checkbox.
3. **Step 3 - Material Selection**:
   Populates dropdown with Eyelet, Diamond, Lycra, Interlock, etc. Live card preview.
4. **Step 4 - Cutting Selection**:
   Dropdown with Boxy, Normal, Raglan, Singlet, Baseball, Sleeveless, Muslimah.
5. **Step 5 - Neck / Collar**:
   Dropdown with Roundneck, V-neck, Polo, Mandarin Zip, Retro, Retro End, V-neck Outer.
6. **Step 6 - Sleeve Configuration**:
   Short vs Long sleeve split table (All vs Specific quantity, Long +RM5/shirt, Not Sure option).
7. **Step 7 - Add-ons**:
   Name Set (+RM3/shirt), Short Pants (Yes/No).
8. **Step 8 - Review Summary & WhatsApp Dispatch**:
   Compiles ordered specs into formatted WhatsApp URL:
   `https://wa.me/601125614436?text=...`

### WhatsApp Message Template:
```text
*ORDER DETAILS (QUICK QUOTE)*
-----------------------------------
- *Design:* [DESIGN_NAME] (Ref: [REF])
- *Altered Mockup:* [Yes/No]
- *Quantity:* [QTY / Not Sure]
- *Material:* [MATERIAL]
- *Cutting:* [CUTTING]
- *Neck/Collar:* [NECK]
- *Sleeve:* [SLEEVE_BREAKDOWN]
- *Name Set (+RM3):* [Yes/No]
- *Short Pants:* [Yes/No]
-----------------------------------
```

---

## 3. Own Custom Mockup Builder (`appOwn_v2.js`)
Similar 7-step builder specifically tailored for customers who bring their own design sketch/mockup, featuring a visual WhatsApp attachment guide (How to send file via Document/Photos).
