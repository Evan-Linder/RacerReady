/**
 * UI Modal Utilities
 * 
 * Reusable modal components for alerts, confirmations, and prompts.
 * All modals return Promises for clean async/await usage.
 * 
 * @module utils/modals
 */

/**
 * Display an informational alert modal
 * @param {string} message - Alert message text
 * @param {string} [title='Alert'] - Modal title
 * @param {string} [icon='ℹ️'] - Emoji icon to display
 * @returns {Promise<void>} Resolves when user closes modal
 */
export function showAlert(message, title = 'Alert', icon = 'ℹ️') {
    return new Promise(resolve => {
        const modal = document.getElementById('alert-modal');
        const titleEl = document.getElementById('alert-modal-title');
        const messageEl = document.getElementById('alert-modal-message');
        
        if (modal && titleEl && messageEl) {
            titleEl.textContent = `${icon} ${title}`;
            messageEl.textContent = message;
            modal.style.display = 'flex';
            
            const handler = () => {
                closeAlertModal();
                resolve();
            };
            
            modal.querySelector('.btn.primary').onclick = handler;
            modal.querySelector('.modal-close').onclick = handler;
        }
    });
}

/**
 * Close alert modal
 */
export function closeAlertModal() {
    const modal = document.getElementById('alert-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * Display a text input prompt modal
 * @param {string} message - Prompt message text
 * @param {string} [title='Input'] - Modal title
 * @param {string} [icon='📝'] - Emoji icon to display
 * @returns {Promise<string|null>} Resolves with input value or null if cancelled
 */
export function showPrompt(message, title = 'Input', icon = '📝') {
    return new Promise(resolve => {
        const modal = document.getElementById('prompt-modal');
        const titleEl = document.getElementById('prompt-modal-title');
        const messageEl = document.getElementById('prompt-modal-message');
        const inputEl = document.getElementById('prompt-modal-input');
        
        if (modal && titleEl && messageEl && inputEl) {
            titleEl.textContent = `${icon} ${title}`;
            messageEl.textContent = message;
            inputEl.value = '';
            modal.style.display = 'flex';
            inputEl.focus();
            
            const handleClose = (value) => {
                modal.style.display = 'none';
                resolve(value);
            };
            
            inputEl.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    handleClose(inputEl.value);
                } else if (e.key === 'Escape') {
                    handleClose(null);
                }
            };
            
            // Make available globally for cancel button
            window.closePromptModal = handleClose;
        }
    });
}

/**
 * Display a confirmation modal with OK and Cancel options
 * @param {string} message - Confirmation message text
 * @param {string} [title='Confirm'] - Modal title
 * @param {string} [icon='❓'] - Emoji icon to display
 * @returns {Promise<boolean>} Resolves with true if OK, false if Cancel
 */
export function showConfirm(message, title = 'Confirm', icon = '❓') {
    return new Promise(resolve => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-modal-title');
        const messageEl = document.getElementById('confirm-modal-message');
        
        if (modal && titleEl && messageEl) {
            titleEl.textContent = `${icon} ${title}`;
            messageEl.textContent = message;
            modal.style.display = 'flex';
            
            const ok = () => {
                closeConfirmModal();
                resolve(true);
            };
            
            const cancel = () => {
                closeConfirmModal();
                resolve(false);
            };
            
            modal.querySelector('.btn.primary').onclick = ok;
            modal.querySelector('.btn:not(.primary)').onclick = cancel;
            modal.querySelector('.modal-close').onclick = cancel;
        }
    });
}

/**
 * Close confirmation modal
 */
export function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * Display a save build modal with name input
 * @returns {Promise<string|null>} Resolves with build name or null if cancelled
 */
export function showSaveBuildModal() {
    return new Promise(resolve => {
        const modal = document.getElementById('save-build-modal');
        const input = document.getElementById('build-name-input');
        
        if (modal && input) {
            input.value = '';
            modal.style.display = 'flex';
            input.focus();
            
            const save = async () => {
                const name = input.value.trim();
                if (!name) {
                    await showAlert('Please enter a name for your build.', 'Missing Name', '⚠️');
                    return;
                }
                closeSaveBuildModal();
                resolve(name);
            };
            
            const cancel = () => {
                closeSaveBuildModal();
                resolve(null);
            };
            
            modal.querySelector('.btn.primary').onclick = save;
            modal.querySelector('.btn:not(.primary)').onclick = cancel;
            modal.querySelector('.modal-close').onclick = cancel;
        }
    });
}

/**
 * Close save build modal
 */
export function closeSaveBuildModal() {
    const modal = document.getElementById('save-build-modal');
    if (modal) modal.style.display = 'none';
}
