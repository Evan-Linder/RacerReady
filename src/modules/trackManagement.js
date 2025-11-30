/**
 * Track Management Module
 * 
 * Handles track history, race days, and track settings.
 * Manages CRUD operations for tracks and days in Firestore.
 * 
 * @module modules/trackManagement
 */

import { showAlert, showConfirm } from '../utils/modals.js';

/**
 * Initialize track management system
 * Sets up event listeners and renders initial data
 */
export function setupTrackHistory() {
    const addTrackBtn = document.getElementById('add-track-btn');
    const trackListDiv = document.getElementById('track-list');
    const trackNameInput = document.getElementById('track-name-input');
    const trackLocationInput = document.getElementById('track-location-input');
    const confirmAddTrackBtn = document.getElementById('confirm-add-track-btn');

    let tracks = [];

    /**
     * Fetch and display all tracks for current user
     */
    async function renderTrackList() {
        if (!trackListDiv) return;

        if (!window.currentUser) {
            trackListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Please log in to view tracks.</p>';
            return;
        }

        trackListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading tracks...</p>';

        if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection) {
            trackListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Database not available.</p>';
            return;
        }

        try {
            const q = window.firebaseQuery(
                window.firebaseCollection(window.firebaseDb, 'tracks'),
                window.firebaseWhere('userId', '==', window.currentUser.uid)
            );
            const querySnapshot = await window.firebaseGetDocs(q);
            tracks = [];
            querySnapshot.forEach(doc => {
                tracks.push({ id: doc.id, ...doc.data() });
            });

            trackListDiv.innerHTML = '';
            if (tracks.length === 0) {
                trackListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No tracks added yet.</p>';
                return;
            }

            tracks.forEach((track) => {
                const card = document.createElement('div');
                card.className = 'instruction-card';
                card.style.textAlign = 'left';
                card.style.width = '100%';
                card.style.margin = '16px 0';

                const timestamp = track.timestamp ? new Date(track.timestamp).toLocaleString() : '';

                card.innerHTML = `
                    <h3>${track.name}</h3>
                    <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6); margin-bottom: 8px;">
                        ${track.location ? 'Location: ' + track.location : ''}
                    </p>
                    <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">
                        ${timestamp ? 'Saved: ' + timestamp : ''}
                    </p>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button class="btn" data-action="load" data-id="${track.id}" style="flex: 1;">📥 Load</button>
                        <button class="btn" data-action="delete" data-id="${track.id}" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                    </div>
                `;
                trackListDiv.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading tracks:', error);
            trackListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Error loading tracks.</p>';
        }
    }

    /**
     * Switch to add track form
     */
    function openAddTrackSection() {
        const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
        const addTrackSection = document.querySelector('[data-section-content="add-track"]');
        const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');

        if (trackHistorySection) trackHistorySection.classList.remove('active');
        if (trackDetailsSection) trackDetailsSection.classList.remove('active');
        if (addTrackSection) {
            addTrackSection.classList.add('active');
            if (trackNameInput) trackNameInput.value = '';
            if (trackLocationInput) trackLocationInput.value = '';
        }

        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.scrollTop = 0;
    }

    /**
     * Return to track history view
     */
    window.backToTrackHistory = function () {
        const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
        const addTrackSection = document.querySelector('[data-section-content="add-track"]');
        const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');

        if (addTrackSection) addTrackSection.classList.remove('active');
        if (trackDetailsSection) trackDetailsSection.classList.remove('active');
        if (trackHistorySection) trackHistorySection.classList.add('active');

        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.scrollTop = 0;
    };

    /**
     * Add new track to database
     */
    async function addTrack() {
        const name = trackNameInput.value.trim();
        const location = trackLocationInput.value.trim();

        if (!window.currentUser) {
            await showAlert('Please log in to add tracks.', 'Not Logged In', '⚠️');
            return;
        }

        if (!name) {
            await showAlert('Please enter a track name.', 'Missing Name', '⚠️');
            return;
        }

        if (tracks.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            await showAlert('Track already exists.', 'Duplicate Track', '⚠️');
            return;
        }

        try {
            if (!window.firebaseDb || !window.firebaseAddDoc || !window.firebaseCollection) {
                await showAlert('Database not available.', 'Error', '❌');
                return;
            }

            await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'tracks'), {
                name,
                location,
                userId: window.currentUser.uid,
                timestamp: Date.now()
            });

            const addTrackSection = document.querySelector('[data-section-content="add-track"]');
            const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
            if (addTrackSection) addTrackSection.classList.remove('active');
            if (trackHistorySection) trackHistorySection.classList.add('active');

            await renderTrackList();
        } catch (error) {
            console.error('Error adding track:', error);
            await showAlert('Error adding track.', 'Error', '❌');
        }
    }

    // Event listeners
    if (addTrackBtn) addTrackBtn.addEventListener('click', openAddTrackSection);
    if (confirmAddTrackBtn) confirmAddTrackBtn.addEventListener('click', addTrack);

    if (trackNameInput) {
        trackNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addTrack();
        });
    }

    if (trackLocationInput) {
        trackLocationInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addTrack();
        });
    }

    // Track list delegated events
    if (trackListDiv) {
        trackListDiv.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');

            if (action === 'delete') {
                const confirmed = await showConfirm('Delete this track?', 'Delete Track', '⚠️');
                if (confirmed && window.firebaseDb && window.firebaseDeleteDoc && window.firebaseDoc) {
                    try {
                        await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'tracks', id));
                        await renderTrackList();
                    } catch (error) {
                        console.error('Error deleting track:', error);
                        await showAlert('Error deleting track.', 'Error', '❌');
                    }
                }
            } else if (action === 'load') {
                const track = tracks.find(t => t.id === id);
                if (track) {
                    loadTrackDetails(track);
                }
            }
        });
    }

    /**
     * Load and display track details
     */
    function loadTrackDetails(track) {
        window.currentTrack = track;

        const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
        const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
        const addTrackSection = document.querySelector('[data-section-content="add-track"]');
        const trackDetailsTitle = document.getElementById('track-details-title');

        if (trackHistorySection) trackHistorySection.classList.remove('active');
        if (addTrackSection) addTrackSection.classList.remove('active');
        if (trackDetailsSection) {
            trackDetailsSection.classList.add('active');
            trackDetailsSection.style.display = 'block';
        }
        if (trackDetailsTitle) trackDetailsTitle.textContent = track.name;

        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.scrollTop = 0;

        renderDayList();
    }

    /**
     * Fetch and display race days for current track
     */
    async function renderDayList() {
        const dayListDiv = document.getElementById('day-list');
        if (!dayListDiv) return;

        if (!window.currentUser) {
            dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Please log in.</p>';
            return;
        }

        if (!window.currentTrack) {
            dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No track selected.</p>';
            return;
        }

        dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading days...</p>';

        if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection) {
            dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Database not available.</p>';
            return;
        }

        try {
            const q = window.firebaseQuery(
                window.firebaseCollection(window.firebaseDb, 'days'),
                window.firebaseWhere('trackId', '==', window.currentTrack.id),
                window.firebaseWhere('userId', '==', window.currentUser.uid)
            );
            const querySnapshot = await window.firebaseGetDocs(q);
            const days = [];

            querySnapshot.forEach(doc => {
                days.push({ id: doc.id, ...doc.data() });
            });

            days.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            dayListDiv.innerHTML = '';

            if (days.length === 0) {
                dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No days recorded yet.</p>';
                return;
            }

            days.forEach((day) => {
                const card = document.createElement('div');
                card.className = 'instruction-card';
                card.style.textAlign = 'left';
                card.style.width = '100%';
                card.style.margin = '16px 0';

                const date = day.timestamp ? new Date(day.timestamp) : new Date();
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dateTime = date.toLocaleString();
                const raceName = day.raceName || 'Day Entry';

                const conditions = [];
                if (day.surfaceCondition) conditions.push(`Surface: ${day.surfaceCondition}`);
                if (day.gripLevel) conditions.push(`Grip: ${day.gripLevel}`);
                if (day.timeOfDay) conditions.push(`Time: ${day.timeOfDay}`);

                card.innerHTML = `
                    <h3>${raceName}</h3>
                    <p style="font-size: 0.85rem; color: rgba(230,238,246,0.8); margin-top: 4px;">
                        ${dayOfWeek}, ${dateTime}
                    </p>
                    <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6); margin-top: 8px;">
                        ${conditions.join(' • ')}
                    </p>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <button class="btn" data-action="view" data-id="${day.id}" style="flex: 1;">👁️ View</button>
                        <button class="btn" data-action="edit" data-id="${day.id}" style="flex: 1; background: rgba(51,153,255,0.2);">✏️ Edit</button>
                        <button class="btn" data-action="delete-day" data-id="${day.id}" style="flex: 1; background: rgba(255,51,51,0.2);">🗑️ Delete</button>
                    </div>
                `;
                dayListDiv.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading days:', error);
            dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Error loading days.</p>';
        }
    }

    // Load track list on page load
    window.addEventListener('loadTrackHistory', () => {
        setTimeout(() => {
            renderTrackList();
        }, 50);
    });

    // Initial load
    renderTrackList();
}
