document.addEventListener('DOMContentLoaded', function () {
    const isSignedIn = () => {
        try { return localStorage.getItem('signedIn') === '1'; } catch (e) { return false; }
    };

    // Generic profile menu setup for any page that has .profile-menu
    function setupProfileUI() {
        const profileMenus = document.querySelectorAll('.profile-menu');
        profileMenus.forEach(pm => {
            const btn = pm.querySelector('.profile-btn');
            const dropdown = pm.querySelector('.profile-dropdown');
            if (!btn || !dropdown) return;

            // If there is a sign-in link on the page, show/hide according to signed-in state
            const signinLink = document.querySelector('[data-role="signin-link"]');
            if (signinLink) {
                if (isSignedIn()) {
                    pm.classList.remove('hidden');
                    pm.removeAttribute('aria-hidden');
                    signinLink.style.display = 'none';
                } else {
                    pm.classList.add('hidden');
                    pm.setAttribute('aria-hidden', 'true');
                    signinLink.style.display = '';
                }
            }

            btn.addEventListener('click', function (e) {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', String(!expanded));
                dropdown.classList.toggle('hidden');
                dropdown.setAttribute('aria-hidden', String(expanded));
            });
        });

        // Close any open dropdown when clicking outside
        document.addEventListener('click', function (e) {
            document.querySelectorAll('.profile-menu').forEach(pm => {
                const btn = pm.querySelector('.profile-btn');
                const dropdown = pm.querySelector('.profile-dropdown');
                if (!btn || !dropdown) return;
                if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                    dropdown.setAttribute('aria-hidden', 'true');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Global logout handler (works for any .logout button)
        document.addEventListener('click', function (e) {
            if (e.target && e.target.matches && e.target.matches('.logout')) {
                try { localStorage.removeItem('signedIn'); } catch (_) { }
                window.location.href = 'index.html';
            }
        });
    }

    // Start section flow: show choice menu -> settings menu -> navigate into Build section
    function setupStartFlow() {
        const choiceMenu = document.getElementById('start-choice-menu');
        const settingsMenu = document.getElementById('start-settings-menu');
        const backBtn = document.getElementById('back-to-choice');
        const settingsTitle = document.getElementById('settings-title');

        if (!choiceMenu || !settingsMenu || !backBtn) return;

        // When a choice (load or create) is clicked, show the settings menu
        choiceMenu.addEventListener('click', function (e) {
            const btn = e.target.closest('.choice-btn');
            if (!btn) return;
            const action = btn.getAttribute('data-action'); // 'load-saved' or 'create-new'
            if (settingsTitle) {
                settingsTitle.textContent = action === 'load-saved' ? 'Continue Saved Build — Select Settings' : 'Create New Build — Select Settings';
            }
            choiceMenu.style.display = 'none';
            settingsMenu.style.display = 'block';
        });

        // Back button returns to the initial choice menu
        backBtn.addEventListener('click', function () {
            settingsMenu.style.display = 'none';
            choiceMenu.style.display = ''; // revert to stylesheet default (flex)
        });

        // Handle selection of settings (tire / kart)
        settingsMenu.addEventListener('click', function (e) {
            const btn = e.target.closest('.settings-btn');
            if (!btn) return;
            const settings = btn.getAttribute('data-settings'); // 'tire' or 'kart'

            // Navigate to Build section using the sidebar button (if present)
            const buildBtn = document.querySelector('.side-btn[data-section="build"]');
            if (buildBtn) buildBtn.click();

            // Activate the correct setup tab
            if (settings === 'tire') {
                const tab = document.querySelector('.setup-tab[data-setup="tires"]');
                if (tab) tab.click();
            } else if (settings === 'kart') {
                // Prefer chassis tab; fallback to frontend
                const tab = document.querySelector('.setup-tab[data-setup="chassis"]') || document.querySelector('.setup-tab[data-setup="frontend"]');
                if (tab) tab.click();
            }

            // Optionally hide settings menu after navigation
            settingsMenu.style.display = 'none';
        });
    }

    // Auth forms and tab switching on sign.html
    function setupAuthForms() {
        const tabSignin = document.getElementById('tab-signin');
        const tabCreate = document.getElementById('tab-create');
        const panelSignin = document.getElementById('panel-signin');
        const panelCreate = document.getElementById('panel-create');

        if (tabSignin && tabCreate && panelSignin && panelCreate) {
            function activate(tab) {
                if (tab === 'signin') {
                    tabSignin.classList.add('active'); tabSignin.setAttribute('aria-selected', 'true');
                    tabCreate.classList.remove('active'); tabCreate.setAttribute('aria-selected', 'false');
                    panelSignin.classList.remove('hidden'); panelCreate.classList.add('hidden');
                } else {
                    tabCreate.classList.add('active'); tabCreate.setAttribute('aria-selected', 'true');
                    tabSignin.classList.remove('active'); tabSignin.setAttribute('aria-selected', 'false');
                    panelCreate.classList.remove('hidden'); panelSignin.classList.add('hidden');
                }
            }

            tabSignin.addEventListener('click', () => activate('signin'));
            tabCreate.addEventListener('click', () => activate('create'));
        }

        const formSignin = document.getElementById('panel-signin');
        const formCreate = document.getElementById('panel-create');
        function signInFlow(e) {
            e.preventDefault();
            try { localStorage.setItem('signedIn', '1'); } catch (_) { }
            window.location.href = 'app.html';
        }
        if (formSignin) formSignin.addEventListener('submit', signInFlow);
        if (formCreate) formCreate.addEventListener('submit', signInFlow);
    }

    // Ensure app page is only accessible when signed in
    function guardAppPage() {
        if (window.location.href.indexOf('app.html') !== -1) {
            if (!isSignedIn()) {
                window.location.href = 'sign.html';
            }
        }
    }

    // App page section switching
    function setupAppSections() {
        const sideButtons = document.querySelectorAll('.side-btn[data-section]');
        const sections = document.querySelectorAll('.app-section');
        const instructionCards = document.querySelectorAll('.instruction-card[data-card]');

        if (!sideButtons.length || !sections.length) return; // Only run on app.html

        function switchSection(sectionName) {
            // Hide all sections and remove active class from buttons
            sections.forEach(section => section.classList.remove('active'));
            sideButtons.forEach(btn => btn.classList.remove('active'));

            // Show the selected section and highlight the button
            const activeSection = document.querySelector(`[data-section-content="${sectionName}"]`);
            const activeButton = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeSection) activeSection.classList.add('active');
            if (activeButton) activeButton.classList.add('active');
        }

        // Add click handlers to side buttons
        sideButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const sectionName = this.getAttribute('data-section');
                switchSection(sectionName);
            });
        });

        // Add click handlers to instruction cards (for default view)
        instructionCards.forEach(card => {
            card.addEventListener('click', function () {
                const cardName = this.getAttribute('data-card');
                switchSection(cardName);
            });
        });

        // Initialize with home section active
        switchSection('home');
    }

    // Setup tabs switching for Build section
    function setupTabs() {
        const setupTabs = document.querySelectorAll('.setup-tab');
        const setupPanels = document.querySelectorAll('.setup-panel');

        if (!setupTabs.length || !setupPanels.length) return; // Only run if tabs exist

        setupTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const setupName = this.getAttribute('data-setup');

                // Remove active class from all tabs and panels
                setupTabs.forEach(t => t.classList.remove('active'));
                setupPanels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                this.classList.add('active');
                const activePanel = document.querySelector(`[data-setup-panel="${setupName}"]`);
                if (activePanel) activePanel.classList.add('active');
            });
        });
    }

    // Slider value updates
    function setupSliders() {
        const sliders = document.querySelectorAll('.slider');

        sliders.forEach(slider => {
            const valueDisplay = slider.nextElementSibling;
            
            // Update value on input
            slider.addEventListener('input', function () {
                let displayValue = this.value;
                const max = this.getAttribute('max');
                
                // Format value based on unit (detected from next element)
                if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
                    if (valueDisplay.textContent.includes('T')) {
                        displayValue += 'T';
                    } else if (valueDisplay.textContent.includes('°')) {
                        displayValue += '°';
                    } else if (valueDisplay.textContent.includes('mm')) {
                        displayValue += 'mm';
                    } else if (valueDisplay.textContent.includes('kg')) {
                        displayValue += 'kg';
                    } else if (valueDisplay.textContent.includes('RPM')) {
                        displayValue += ' RPM';
                    } else if (valueDisplay.textContent.includes('PSI')) {
                        displayValue += ' PSI';
                    } else if (valueDisplay.textContent.includes('%')) {
                        displayValue += '% Front';
                    }
                    valueDisplay.textContent = displayValue;
                }
            });
        });
    }

    // Initialize behaviors
    setupProfileUI();
    setupAuthForms();
    guardAppPage();
    setupAppSections();
    setupTabs();
    setupStartFlow();
    setupSliders();
});
