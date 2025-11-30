/**
 * ============================================================================
 * RACER READY - Main Application Script
 * ============================================================================
 * 
 * This script organizes the complete Racer Ready application logic into
 * logical sections for maintainability and scalability.
 * 
 * SECTIONS:
 * 1. Authentication & Initialization
 * 2. Track Management System
 * 3. Tire Management System
 * 4. Build Management System
 * 5. Profile Management
 * 6. UI Utilities & Modal System
 * 7. App Navigation & Section Switching
 * 8. Settings & Configuration
 * 9. Initialization & Event Setup
 * 
 * NAMING CONVENTIONS:
 * - Functions: camelCase (setupTrackHistory, renderTrackList)
 * - Variables: camelCase (currentUser, selectedTrack)
 * - Classes: PascalCase
 * - Constants: UPPER_SNAKE_CASE
 * - Private functions: _camelCase (not public API)
 * 
 * ERROR HANDLING:
 * - All async operations wrapped in try/catch
 * - Errors logged to console
 * - User-friendly error messages via modals
 * - Firebase errors checked and handled appropriately
 * 
 * PERFORMANCE NOTES:
 * - Event delegation used for dynamic content
 * - DOM queries cached when possible
 * - Firestore queries optimized with WHERE conditions
 * - Lazy loading for sections (only when accessed)
 * 
 * ============================================================================
 */

        /**
         * LOGOUT HANDLER
         * Handles user logout and redirects to signin page
         */
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function() {
                try {
                    await window.firebaseSignOut(window.firebaseAuth);
                    window.location.href = 'sign.html';
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }


        /**
         * ========================================================================
         * SECTION 2: TRACK MANAGEMENT SYSTEM
         * ========================================================================
         * 
         * Manages user's track history, race days, points, and track settings.
         * 
         * Key Functions:
         * - setupTrackHistory()      : Initialize track management
         * - renderTrackList()        : Display all user's tracks
         * - addTrack()               : Create new track entry
         * - renderDayList()          : Display race days for selected track
         * - viewDay()                : View detailed race day information
         * - editDay()                : Edit race day details
         * - renderPointsStandings()  : Display earned points per race
         * 
         * Data Structure (Firestore):
         * - Collection: "tracks"      (user's racing tracks)
         * - Collection: "days"        (individual race day entries)
         * - Collection: "tireEvents"  (tie chemical applications)
         * 
         * ========================================================================
         */

        // --- Track History Logic ---
        function setupTrackHistory() {
            const addTrackBtn = document.getElementById('add-track-btn');
            const trackListDiv = document.getElementById('track-list');
            const trackNameInput = document.getElementById('track-name-input');
            const trackLocationInput = document.getElementById('track-location-input');
            const confirmAddTrackBtn = document.getElementById('confirm-add-track-btn');
            let tracks = [];

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
                
                // Query tracks for current user only
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
                    let timestamp = track.timestamp ? new Date(track.timestamp).toLocaleString() : '';
                    card.innerHTML = `
                        <h3>${track.name}</h3>
                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6); margin-bottom: 8px;">
                            ${track.location ? 'Location: ' + track.location : ''}
                        </p>
                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">
                            ${timestamp ? 'Saved: ' + timestamp : ''}
                        </p>
                        <p style="font-size: 0.9rem; margin-top: 8px; min-height: 1.2em;"></p>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn" data-action="load" data-id="${track.id}" style="flex: 1;">📥 Load</button>
                            <button class="btn" data-action="delete" data-id="${track.id}" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                        </div>
                    `;
                    trackListDiv.appendChild(card);
                });
            }

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
            
            window.backToTrackHistory = function() {
                const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
                const addTrackSection = document.querySelector('[data-section-content="add-track"]');
                const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                
                if (addTrackSection) addTrackSection.classList.remove('active');
                if (trackDetailsSection) trackDetailsSection.classList.remove('active');
                if (trackHistorySection) trackHistorySection.classList.add('active');
                
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            };

            async function addTrack() {
                const name = trackNameInput.value.trim();
                const location = trackLocationInput.value.trim();
                
                if (!window.currentUser) {
                    showAlert('Please log in to add tracks.', 'Not Logged In', '⚠️');
                    return;
                }
                
                if (!name) {
                    showAlert('Please enter a track name.', 'Missing Name', '⚠️');
                    return;
                }
                // Prevent duplicates (check Firestore)
                if (tracks.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                    showAlert('Track already exists.', 'Duplicate Track', '⚠️');
                    return;
                }
                if (window.firebaseDb && window.firebaseAddDoc && window.firebaseCollection) {
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
                } else {
                    showAlert('Database not available.', 'Error', '❌');
                }
            }

            if (addTrackBtn) addTrackBtn.addEventListener('click', openAddTrackSection);
            if (confirmAddTrackBtn) confirmAddTrackBtn.addEventListener('click', addTrack);
            if (trackNameInput) trackNameInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') addTrack();
            });
            if (trackLocationInput) trackLocationInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') addTrack();
            });

            if (trackListDiv) {
                trackListDiv.addEventListener('click', async function(e) {
                    const btn = e.target.closest('button');
                    if (!btn) return;
                    const id = btn.getAttribute('data-id');
                    if (btn.getAttribute('data-action') === 'delete') {
                        showConfirm('Delete this track?', 'Delete Track', '⚠️').then(async ok => {
                            if (ok && window.firebaseDb && window.firebaseDeleteDoc && window.firebaseDoc) {
                                await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'tracks', id));
                                await renderTrackList();
                            }
                        });
                    } else if (btn.getAttribute('data-action') === 'load') {
                        // Load track details view
                        const track = tracks.find(t => t.id === id);
                        if (track) {
                            loadTrackDetails(track);
                        }
                    }
                });
            }

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

            async function renderDayList() {
                const dayListDiv = document.getElementById('day-list');
                if (!dayListDiv) return;
                
                if (!window.currentUser) {
                    dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Please log in to view days.</p>';
                    return;
                }
                
                if (!window.currentTrack) {
                    dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No track selected.</p>';
                    return;
                }
                
                dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading days...</p>';
                
                if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection || !window.firebaseQuery || !window.firebaseWhere) {
                    dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Database not available.</p>';
                    return;
                }
                
                try {
                    // Query days for this specific track and user
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
                    
                    // Sort by timestamp, newest first
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
                                <button class="btn" data-action="edit" data-id="${day.id}" style="flex: 1; background: rgba(51,153,255,0.2); border-color: rgba(51,153,255,0.3);">✏️ Edit</button>
                                <button class="btn" data-action="delete-day" data-id="${day.id}" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                            </div>
                        `;
                        dayListDiv.appendChild(card);
                    });
                } catch (error) {
                    console.error('Error loading days:', error);
                    dayListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Error loading days.</p>';
                }
            }

            // Event delegation for day list buttons
            const dayListDiv = document.getElementById('day-list');
            if (dayListDiv) {
                dayListDiv.addEventListener('click', async function(e) {
                    const btn = e.target.closest('button');
                    if (!btn) return;
                    const id = btn.getAttribute('data-id');
                    const action = btn.getAttribute('data-action');
                    
                    if (action === 'view') {
                        await viewDay(id);
                    } else if (action === 'edit') {
                        await editDay(id);
                    } else if (action === 'delete-day') {
                        showConfirm('Delete this day entry?', 'Delete Day', '⚠️').then(async ok => {
                            if (ok && window.firebaseDb && window.firebaseDeleteDoc && window.firebaseDoc) {
                                await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'days', id));
                                await renderDayList();
                            }
                        });
                    }
                });
            }

            const backToTrackListBtn = document.getElementById('back-to-track-list');
            if (backToTrackListBtn) {
                backToTrackListBtn.addEventListener('click', function() {
                    const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                    const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.remove('active');
                        trackDetailsSection.style.display = 'none';
                    }
                    if (trackHistorySection) trackHistorySection.classList.add('active');
                });
            }

            const addDayBtn = document.getElementById('add-day-btn');
            if (addDayBtn) {
                addDayBtn.addEventListener('click', function() {
                    const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                    const dayEntrySection = document.querySelector('[data-section-content="day-entry"]');
                    const dayEntryTitle = document.getElementById('day-entry-title');
                    const trackSettingsSection = document.querySelector('[data-section-content="track-settings"]');
                    const pointsStandingsSection = document.querySelector('[data-section-content="points-standings"]');
                    
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.remove('active');
                        trackDetailsSection.style.display = 'none';
                    }
                    if (trackSettingsSection) {
                        trackSettingsSection.classList.remove('active');
                        trackSettingsSection.style.display = 'none';
                    }
                    if (pointsStandingsSection) {
                        pointsStandingsSection.classList.remove('active');
                        pointsStandingsSection.style.display = 'none';
                    }
                    if (dayEntrySection) {
                        dayEntrySection.classList.add('active');
                        dayEntrySection.style.display = 'block';
                    }
                    if (dayEntryTitle && window.currentTrack) {
                        dayEntryTitle.textContent = `Day Entry - ${window.currentTrack.name}`;
                    }
                    
                    const appContainer = document.querySelector('.app-container');
                    if (appContainer) appContainer.scrollTop = 0;
                });
            }
            
            const trackSettingsBtn = document.getElementById('track-settings-btn');
            if (trackSettingsBtn) {
                trackSettingsBtn.addEventListener('click', function() {
                    openTrackSettings();
                });
            }
            
            const pointsStandingsBtn = document.getElementById('points-standings-btn');
            if (pointsStandingsBtn) {
                pointsStandingsBtn.addEventListener('click', function() {
                    openPointsStandings();
                });
            }

            const backToTrackDetailsBtn = document.getElementById('back-to-track-details');
            if (backToTrackDetailsBtn) {
                backToTrackDetailsBtn.addEventListener('click', function() {
                    backToTrackDetails();
                });
            }
            
            window.backToTrackDetails = function() {
                const dayEntrySection = document.querySelector('[data-section-content="day-entry"]');
                const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                const trackSettingsSection = document.querySelector('[data-section-content="track-settings"]');
                const pointsStandingsSection = document.querySelector('[data-section-content="points-standings"]');
                
                if (dayEntrySection) {
                    dayEntrySection.classList.remove('active');
                    dayEntrySection.style.display = 'none';
                }
                if (trackSettingsSection) {
                    trackSettingsSection.classList.remove('active');
                    trackSettingsSection.style.display = 'none';
                }
                if (pointsStandingsSection) {
                    pointsStandingsSection.classList.remove('active');
                    pointsStandingsSection.style.display = 'none';
                }
                if (trackDetailsSection) {
                    trackDetailsSection.classList.add('active');
                    trackDetailsSection.style.display = 'block';
                }
                
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            };
            
            function openTrackSettings() {
                if (!window.currentTrack) return;
                
                const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                const trackSettingsSection = document.querySelector('[data-section-content="track-settings"]');
                const pointsStandingsSection = document.querySelector('[data-section-content="points-standings"]');
                const dayEntrySection = document.querySelector('[data-section-content="day-entry"]');
                
                if (trackDetailsSection) {
                    trackDetailsSection.classList.remove('active');
                    trackDetailsSection.style.display = 'none';
                }
                if (pointsStandingsSection) {
                    pointsStandingsSection.classList.remove('active');
                    pointsStandingsSection.style.display = 'none';
                }
                if (dayEntrySection) {
                    dayEntrySection.classList.remove('active');
                    dayEntrySection.style.display = 'none';
                }
                if (trackSettingsSection) {
                    trackSettingsSection.classList.add('active');
                    trackSettingsSection.style.display = 'block';
                    
                    // Populate form with current track data
                    const nameInput = document.getElementById('track-settings-name');
                    const locationInput = document.getElementById('track-settings-location');
                    const notesInput = document.getElementById('track-settings-notes');
                    const titleElement = document.getElementById('track-settings-title');
                    
                    if (nameInput) nameInput.value = window.currentTrack.name || '';
                    if (locationInput) locationInput.value = window.currentTrack.location || '';
                    if (notesInput) notesInput.value = window.currentTrack.notes || '';
                    if (titleElement) titleElement.textContent = `Track Settings - ${window.currentTrack.name}`;
                }
                
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            }
            
            async function openPointsStandings() {
                if (!window.currentTrack) return;
                
                const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                const trackSettingsSection = document.querySelector('[data-section-content="track-settings"]');
                const pointsStandingsSection = document.querySelector('[data-section-content="points-standings"]');
                const dayEntrySection = document.querySelector('[data-section-content="day-entry"]');
                
                if (trackDetailsSection) {
                    trackDetailsSection.classList.remove('active');
                    trackDetailsSection.style.display = 'none';
                }
                if (trackSettingsSection) {
                    trackSettingsSection.classList.remove('active');
                    trackSettingsSection.style.display = 'none';
                }
                if (dayEntrySection) {
                    dayEntrySection.classList.remove('active');
                    dayEntrySection.style.display = 'none';
                }
                if (pointsStandingsSection) {
                    pointsStandingsSection.classList.add('active');
                    pointsStandingsSection.style.display = 'block';
                    
                    const titleElement = document.getElementById('points-standings-title');
                    if (titleElement) titleElement.textContent = `Points Standings - ${window.currentTrack.name}`;
                    
                    // Render the points standings
                    await renderPointsStandings();
                }
                
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            }
            
            async function renderPointsStandings() {
                const standingsListDiv = document.getElementById('points-standings-list');
                const totalPointsDisplay = document.getElementById('total-points-display');
                
                if (!standingsListDiv) return;
                
                if (!window.currentUser || !window.currentTrack) {
                    standingsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No track selected.</p>';
                    return;
                }
                
                standingsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading standings...</p>';
                
                try {
                    // Query all days for this track with points
                    const daysQuery = window.firebaseQuery(
                        window.firebaseCollection(window.firebaseDb, 'days'),
                        window.firebaseWhere('trackId', '==', window.currentTrack.id),
                        window.firebaseWhere('userId', '==', window.currentUser.uid)
                    );
                    const daysSnapshot = await window.firebaseGetDocs(daysQuery);
                    
                    const races = [];
                    let totalPoints = 0;
                    
                    daysSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.pointsEarned && data.pointsEarned > 0) {
                            races.push({
                                id: doc.id,
                                raceName: data.raceName || 'Unnamed Race',
                                pointsEarned: data.pointsEarned,
                                timestamp: data.timestamp
                            });
                            totalPoints += data.pointsEarned;
                        }
                    });
                    
                    // Update total points display
                    if (totalPointsDisplay) totalPointsDisplay.textContent = totalPoints;
                    
                    standingsListDiv.innerHTML = '';
                    
                    if (races.length === 0) {
                        standingsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No races with points recorded yet.</p>';
                        return;
                    }
                    
                    // Sort by date (most recent first)
                    races.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    
                    // Display each race
                    races.forEach(race => {
                        const card = document.createElement('div');
                        card.className = 'instruction-card';
                        card.style.textAlign = 'left';
                        card.style.width = '100%';
                        card.style.margin = '16px 0';
                        card.style.background = 'rgba(230,238,246,0.05)';
                        card.style.border = '1px solid rgba(230,238,246,0.15)';
                        
                        const date = race.timestamp ? new Date(race.timestamp).toLocaleDateString() : '';
                        
                        card.innerHTML = `
                            <h3>${race.raceName}</h3>
                            <p style="font-size: 1.1rem; color: rgba(51,255,153,0.9); margin-top: 8px;">
                                <strong>Points Earned:</strong> ${race.pointsEarned}
                            </p>
                            <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6); margin-top: 8px;">
                                ${date ? 'Date: ' + date : ''}
                            </p>
                        `;
                        standingsListDiv.appendChild(card);
                    });
                } catch (error) {
                    console.error('Error loading points standings:', error);
                    standingsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Error loading standings.</p>';
                }
            }

            // View day function
            async function viewDay(dayId) {
                const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                const viewDaySection = document.querySelector('[data-section-content="view-day"]');
                const viewDayContent = document.getElementById('view-day-content');
                const viewDayTitle = document.getElementById('view-day-title');
                
                if (!window.firebaseDb || !window.firebaseDoc || !window.firebaseGetDocs) return;
                
                try {
                    // Fetch the day document
                    const dayDoc = await window.firebaseGetDocs(window.firebaseQuery(
                        window.firebaseCollection(window.firebaseDb, 'days'),
                        window.firebaseWhere('__name__', '==', dayId)
                    ));
                    
                    let dayData = null;
                    dayDoc.forEach(doc => {
                        dayData = { id: doc.id, ...doc.data() };
                    });
                    
                    if (!dayData) return;
                    
                    window.currentViewDay = dayData;
                    
                    // Build the view content
                    let html = '';
                    
                    if (dayData.raceName) {
                        html += `<h3 style="margin-bottom: 24px;">${dayData.raceName}</h3>`;
                    }
                    
                    if (dayData.timestamp) {
                        const date = new Date(dayData.timestamp);
                        html += `<p style="color: rgba(230,238,246,0.7); margin-bottom: 24px;">Recorded: ${date.toLocaleString()}</p>`;
                    }
                    
                    html += '<h3>Track Conditions</h3><ul class="setup-list" style="list-style: none; padding: 0;">';
                    
                    const trackFields = {
                        surfaceCondition: 'Surface Condition',
                        moistureContent: 'Moisture Content',
                        gripLevel: 'Grip Level',
                        groovePosition: 'Groove Position',
                        surfaceTexture: 'Surface Texture'
                    };
                    
                    for (const [key, label] of Object.entries(trackFields)) {
                        if (dayData[key]) {
                            html += `<li style="padding: 12px; margin-bottom: 10px; background: rgba(255,51,51,0.05); border-left: 3px solid #ff3333; border-radius: 4px;"><strong>${label}:</strong> ${dayData[key]}</li>`;
                        }
                    }
                    
                    html += '</ul><h3 style="margin-top: 24px;">Weather Conditions</h3><ul class="setup-list" style="list-style: none; padding: 0;">';
                    
                    const weatherFields = {
                        airTemperature: 'Air Temperature',
                        surfaceTemperature: 'Surface Temperature',
                        humidity: 'Humidity',
                        timeOfDay: 'Time of Day',
                        windConditions: 'Wind Conditions'
                    };
                    
                    for (const [key, label] of Object.entries(weatherFields)) {
                        if (dayData[key]) {
                            html += `<li style="padding: 12px; margin-bottom: 10px; background: rgba(255,51,51,0.05); border-left: 3px solid #ff3333; border-radius: 4px;"><strong>${label}:</strong> ${dayData[key]}</li>`;
                        }
                    }
                    
                    html += '</ul>';
                    
                    viewDayContent.innerHTML = html;
                    if (viewDayTitle && dayData.raceName) viewDayTitle.textContent = dayData.raceName;
                    
                    // Navigate to view section
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.remove('active');
                        trackDetailsSection.style.display = 'none';
                    }
                    if (viewDaySection) {
                        viewDaySection.classList.add('active');
                        viewDaySection.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error viewing day:', error);
                    showAlert('Error loading day details', 'Error', '❌');
                }
            }
            
            // Back from view day
            const backFromViewDayBtn = document.getElementById('back-from-view-day');
            if (backFromViewDayBtn) {
                backFromViewDayBtn.addEventListener('click', function() {
                    const viewDaySection = document.querySelector('[data-section-content="view-day"]');
                    const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                    if (viewDaySection) {
                        viewDaySection.classList.remove('active');
                        viewDaySection.style.display = 'none';
                    }
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.add('active');
                        trackDetailsSection.style.display = 'block';
                    }
                });
            }

            // Edit day function
            async function editDay(dayId) {
                const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                const editDaySection = document.querySelector('[data-section-content="edit-day"]');
                const editDayTitle = document.getElementById('edit-day-title');
                
                if (!window.firebaseDb || !window.firebaseDoc || !window.firebaseGetDocs) return;
                
                try {
                    // Fetch the day document
                    const dayDoc = await window.firebaseGetDocs(window.firebaseQuery(
                        window.firebaseCollection(window.firebaseDb, 'days'),
                        window.firebaseWhere('__name__', '==', dayId)
                    ));
                    
                    let dayData = null;
                    dayDoc.forEach(doc => {
                        dayData = { id: doc.id, ...doc.data() };
                    });
                    
                    if (!dayData) return;
                    
                    window.currentEditDay = dayData;
                    
                    // Populate the edit form
                    document.getElementById('edit-race-name').value = dayData.raceName || '';
                    
                    // Format timestamp for datetime-local input
                    if (dayData.timestamp) {
                        const date = new Date(dayData.timestamp);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
                        document.getElementById('edit-timestamp').value = datetimeLocal;
                    }
                    
                    document.getElementById('edit-surface-condition').value = dayData.surfaceCondition || '';
                    document.getElementById('edit-moisture-content').value = dayData.moistureContent || '';
                    document.getElementById('edit-grip-level').value = dayData.gripLevel || '';
                    document.getElementById('edit-groove-position').value = dayData.groovePosition || '';
                    document.getElementById('edit-surface-texture').value = dayData.surfaceTexture || '';
                    document.getElementById('edit-air-temperature').value = dayData.airTemperature || '';
                    document.getElementById('edit-surface-temperature').value = dayData.surfaceTemperature || '';
                    document.getElementById('edit-humidity').value = dayData.humidity || '';
                    document.getElementById('edit-time-of-day').value = dayData.timeOfDay || '';
                    document.getElementById('edit-wind-conditions').value = dayData.windConditions || '';
                    
                    if (editDayTitle) editDayTitle.textContent = `Edit: ${dayData.raceName || 'Day Entry'}`;
                    
                    // Navigate to edit section
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.remove('active');
                        trackDetailsSection.style.display = 'none';
                    }
                    if (editDaySection) {
                        editDaySection.classList.add('active');
                        editDaySection.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error loading day for edit:', error);
                    showAlert('Error loading day details', 'Error', '❌');
                }
            }
            
            // Back from edit day
            const backFromEditDayBtn = document.getElementById('back-from-edit-day');
            if (backFromEditDayBtn) {
                backFromEditDayBtn.addEventListener('click', function() {
                    const editDaySection = document.querySelector('[data-section-content="edit-day"]');
                    const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                    if (editDaySection) {
                        editDaySection.classList.remove('active');
                        editDaySection.style.display = 'none';
                    }
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.add('active');
                        trackDetailsSection.style.display = 'block';
                    }
                });
            }
            
            // Save edited day
            const saveEditDayBtn = document.getElementById('save-edit-day-btn');
            if (saveEditDayBtn) {
                saveEditDayBtn.addEventListener('click', async function() {
                    if (!window.currentEditDay || !window.firebaseDb) return;
                    
                    try {
                        const updatedData = {
                            raceName: document.getElementById('edit-race-name')?.value || '',
                            surfaceCondition: document.getElementById('edit-surface-condition')?.value || '',
                            moistureContent: document.getElementById('edit-moisture-content')?.value || '',
                            gripLevel: document.getElementById('edit-grip-level')?.value || '',
                            groovePosition: document.getElementById('edit-groove-position')?.value || '',
                            surfaceTexture: document.getElementById('edit-surface-texture')?.value || '',
                            airTemperature: document.getElementById('edit-air-temperature')?.value || '',
                            surfaceTemperature: document.getElementById('edit-surface-temperature')?.value || '',
                            humidity: document.getElementById('edit-humidity')?.value || '',
                            timeOfDay: document.getElementById('edit-time-of-day')?.value || '',
                            windConditions: document.getElementById('edit-wind-conditions')?.value || ''
                        };
                        
                        // Update timestamp if changed
                        const timestampInput = document.getElementById('edit-timestamp')?.value;
                        if (timestampInput) {
                            updatedData.timestamp = new Date(timestampInput).getTime();
                        }
                        
                        // Update in Firestore
                        const docRef = window.firebaseDoc(window.firebaseDb, 'days', window.currentEditDay.id);
                        await window.firebaseUpdateDoc(docRef, updatedData);
                        
                        showAlert('Day updated successfully!', 'Success', '✅');
                        
                        // Navigate back to track details
                        const editDaySection = document.querySelector('[data-section-content="edit-day"]');
                        const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                        if (editDaySection) {
                            editDaySection.classList.remove('active');
                            editDaySection.style.display = 'none';
                        }
                        if (trackDetailsSection) {
                            trackDetailsSection.classList.add('active');
                            trackDetailsSection.style.display = 'block';
                        }
                        
                        await renderDayList();
                    } catch (error) {
                        console.error('Error updating day:', error);
                        showAlert('Error updating day', 'Error', '❌');
                    }
                });
            }

            const saveDayBtn = document.getElementById('save-day-btn');
            if (saveDayBtn) {
                saveDayBtn.addEventListener('click', async function() {
                    if (!window.currentTrack) {
                        showAlert('No track selected.', 'Error', '❌');
                        return;
                    }
                    
                    // Prompt for race name
                    const raceName = await showPrompt('Enter the name of this race/session:', 'Race Name', '🏁');
                    if (raceName === null) return; // User cancelled
                    
                    // Collect all day entry data
                    const dayData = {
                        trackId: window.currentTrack.id,
                        trackName: window.currentTrack.name,
                        raceName: raceName,
                        timestamp: Date.now(),
                        userId: window.currentUser.uid,
                        surfaceCondition: document.getElementById('surface-condition')?.value || '',
                        moistureContent: document.getElementById('moisture-content')?.value || '',
                        gripLevel: document.getElementById('grip-level')?.value || '',
                        groovePosition: document.getElementById('groove-position')?.value || '',
                        surfaceTexture: document.getElementById('surface-texture')?.value || '',
                        airTemperature: document.getElementById('air-temperature')?.value || '',
                        surfaceTemperature: document.getElementById('surface-temperature')?.value || '',
                        humidity: document.getElementById('humidity')?.value || '',
                        timeOfDay: document.getElementById('time-of-day')?.value || '',
                        windConditions: document.getElementById('wind-conditions')?.value || '',
                        pointsEarned: parseInt(document.getElementById('points-earned')?.value) || 0
                    };
                    
                    // Save to Firebase
                    if (window.firebaseDb && window.firebaseAddDoc && window.firebaseCollection) {
                        try {
                            await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'days'), dayData);
                            
                            // Clear form fields
                            document.getElementById('surface-condition').value = '';
                            document.getElementById('moisture-content').value = '';
                            document.getElementById('grip-level').value = '';
                            document.getElementById('groove-position').value = '';
                            document.getElementById('surface-texture').value = '';
                            document.getElementById('air-temperature').value = '';
                            document.getElementById('surface-temperature').value = '';
                            document.getElementById('humidity').value = '';
                            document.getElementById('time-of-day').value = '';
                            document.getElementById('wind-conditions').value = '';
                            document.getElementById('points-earned').value = '';
                            
                            // Navigate back to track details
                            const dayEntrySection = document.querySelector('[data-section-content="day-entry"]');
                            const trackDetailsSection = document.querySelector('[data-section-content="track-details"]');
                            if (dayEntrySection) {
                                dayEntrySection.classList.remove('active');
                                dayEntrySection.style.display = 'none';
                            }
                            if (trackDetailsSection) {
                                trackDetailsSection.classList.add('active');
                                trackDetailsSection.style.display = 'block';
                            }
                            
                            // Refresh day list
                            await renderDayList();
                        } catch (error) {
                            console.error('Error saving day:', error);
                            showAlert('Error saving day entry.', 'Error', '❌');
                        }
                    } else {
                        showAlert('Database not available.', 'Error', '❌');
                    }
                });
            }

            // Save Track Settings
            const saveTrackSettingsBtn = document.getElementById('save-track-settings-btn');
            if (saveTrackSettingsBtn) {
                saveTrackSettingsBtn.addEventListener('click', async function() {
                    if (!window.currentTrack) {
                        showAlert('No track selected.', 'Error', '❌');
                        return;
                    }
                    
                    const name = document.getElementById('track-settings-name')?.value.trim() || '';
                    const location = document.getElementById('track-settings-location')?.value.trim() || '';
                    const notes = document.getElementById('track-settings-notes')?.value.trim() || '';
                    
                    if (!name) {
                        showAlert('Track name is required.', 'Error', '⚠️');
                        return;
                    }
                    
                    try {
                        await window.firebaseUpdateDoc(
                            window.firebaseDoc(window.firebaseDb, 'tracks', window.currentTrack.id),
                            { name, location, notes }
                        );
                        
                        // Update current track object
                        window.currentTrack.name = name;
                        window.currentTrack.location = location;
                        window.currentTrack.notes = notes;
                        
                        showAlert('Track settings saved successfully!', 'Saved', '✅');
                        
                        // Update the track details title
                        const trackDetailsTitle = document.getElementById('track-details-title');
                        if (trackDetailsTitle) trackDetailsTitle.textContent = name;
                        
                        await renderTrackList();
                    } catch (error) {
                        console.error('Error saving track settings:', error);
                        showAlert('Error saving settings.', 'Error', '❌');
                    }
                });
            }
            
            // Delete Track
            const deleteTrackBtn = document.getElementById('delete-track-btn');
            if (deleteTrackBtn) {
                deleteTrackBtn.addEventListener('click', async function() {
                    if (!window.currentTrack) return;
                    
                    const confirmed = await showConfirm(
                        `Delete track "${window.currentTrack.name}"? This will also delete all associated days.`,
                        'Delete Track',
                        '⚠️'
                    );
                    
                    if (!confirmed) return;
                    
                    try {
                        // Delete all associated days first
                        const daysQuery = window.firebaseQuery(
                            window.firebaseCollection(window.firebaseDb, 'days'),
                            window.firebaseWhere('trackId', '==', window.currentTrack.id)
                        );
                        const daysSnapshot = await window.firebaseGetDocs(daysQuery);
                        const deletePromises = [];
                        daysSnapshot.forEach(doc => {
                            deletePromises.push(window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'days', doc.id)));
                        });
                        await Promise.all(deletePromises);
                        
                        // Delete the track
                        await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'tracks', window.currentTrack.id));
                        
                        // Navigate back to track history
                        window.currentTrack = null;
                        const trackSettingsSection = document.querySelector('[data-section-content="track-settings"]');
                        const trackHistorySection = document.querySelector('[data-section-content="track-history"]');
                        if (trackSettingsSection) trackSettingsSection.classList.remove('active');
                        if (trackHistorySection) trackHistorySection.classList.add('active');
                        
                        await renderTrackList();
                    } catch (error) {
                        console.error('Error deleting track:', error);
                        showAlert('Error deleting track.', 'Error', '❌');
                    }
                });
            }
            
            // Load tracks when track history section is activated
            window.addEventListener('loadTrackHistory', function() {
                setTimeout(() => {
                    renderTrackList();
                }, 50);
            });
        }
        setupTrackHistory();

        /**
         * ========================================================================
         * SECTION 3: TIRE MANAGEMENT SYSTEM
         * ========================================================================
         * 
         * Manages tire sets, individual tires, and chemical applications.
         * 
         * Key Functions:
         * - setupTireHistory()      : Initialize tire management
         * - renderTireSetList()     : Display all tire sets
         * - addTireSet()            : Create new tire set
         * - renderTiresList()       : Display tires in a set
         * - addTire()               : Add individual tire to set
         * - renderTireEvents()      : Display chemical applications for tire
         * - addEvent()              : Log new chemical application
         * - updateEvent()           : Edit existing event
         * 
         * Data Structure (Firestore):
         * - Collection: "tireSets"   (grouped tire sets)
         * - Collection: "tires"      (individual tires in sets)
         * - Collection: "tireEvents" (chemical applications and treatments)
         * 
         * ========================================================================
         */

        // --- Tire History Logic ---
        function setupTireHistory() {
            const addTireSetBtn = document.getElementById('add-tire-set-btn');
            const tireSetListDiv = document.getElementById('tire-set-list');
            const tireSetNameInput = document.getElementById('tire-set-name-input');
            const tireBrandInput = document.getElementById('tire-brand-input');
            const tireModelInput = document.getElementById('tire-model-input');
            const tireQuantityInput = document.getElementById('tire-quantity-input');
            const confirmAddTireSetBtn = document.getElementById('confirm-add-tire-set-btn');
            let tireSets = [];

            async function renderTireSetList() {
                if (!tireSetListDiv) return;
                
                if (!window.currentUser) {
                    tireSetListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Please log in to view tire sets.</p>';
                    return;
                }
                
                tireSetListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading tire sets...</p>';
                if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection) {
                    tireSetListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Database not available.</p>';
                    return;
                }
                
                // Query tire sets for current user only
                const q = window.firebaseQuery(
                    window.firebaseCollection(window.firebaseDb, 'tireSets'),
                    window.firebaseWhere('userId', '==', window.currentUser.uid)
                );
                const querySnapshot = await window.firebaseGetDocs(q);
                tireSets = [];
                querySnapshot.forEach(doc => {
                    tireSets.push({ id: doc.id, ...doc.data() });
                });
                tireSetListDiv.innerHTML = '';
                if (tireSets.length === 0) {
                    tireSetListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No tire sets added yet.</p>';
                    return;
                }
                tireSets.forEach((tireSet) => {
                    const card = document.createElement('div');
                    card.className = 'instruction-card';
                    card.style.textAlign = 'left';
                    card.style.width = '100%';
                    card.style.margin = '16px 0';
                    let timestamp = tireSet.timestamp ? new Date(tireSet.timestamp).toLocaleString() : '';
                    card.innerHTML = `
                        <h3>${tireSet.setName}</h3>
                        <p style="font-size: 0.95rem; color: rgba(230,238,246,0.8); margin-bottom: 4px;">
                            <strong>Brand:</strong> ${tireSet.brand} | <strong>Model:</strong> ${tireSet.model}
                        </p>
                        <p style="font-size: 0.95rem; color: rgba(230,238,246,0.8); margin-bottom: 8px;">
                            <strong>Quantity:</strong> ${tireSet.quantity} tire${tireSet.quantity > 1 ? 's' : ''}
                        </p>
                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">
                            ${timestamp ? 'Added: ' + timestamp : ''}
                        </p>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn" data-action="load-set" data-id="${tireSet.id}" style="flex: 1;">📥 Load</button>
                            <button class="btn" data-action="delete-tire" data-id="${tireSet.id}" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                        </div>
                    `;
                    tireSetListDiv.appendChild(card);
                });
                
                // Reset scroll after rendering is complete
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            }

            function openAddTireSetSection() {
                const tireHistorySection = document.querySelector('[data-section-content="tire-history"]');
                const addTireSetSection = document.querySelector('[data-section-content="add-tire-set"]');
                const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                
                if (tireHistorySection) tireHistorySection.classList.remove('active');
                if (setDetailsSection) setDetailsSection.classList.remove('active');
                if (addTireSetSection) {
                    addTireSetSection.classList.add('active');
                    
                    if (tireSetNameInput) tireSetNameInput.value = '';
                    if (tireBrandInput) tireBrandInput.value = '';
                    if (tireModelInput) tireModelInput.value = '';
                    if (tireQuantityInput) tireQuantityInput.value = '4';
                }
                
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            }

            async function addTireSet() {
                const setName = tireSetNameInput.value.trim();
                const brand = tireBrandInput.value.trim();
                const model = tireModelInput.value.trim();
                const quantity = parseInt(tireQuantityInput.value);
                
                if (!window.currentUser) {
                    showAlert('Please log in to add tire sets.', 'Not Logged In', '⚠️');
                    return;
                }
                
                if (!setName) {
                    showAlert('Please enter a set name.', 'Set Name Required', '⚠️');
                    return;
                }
                
                if (!brand) {
                    showAlert('Please enter a tire brand.', 'Brand Required', '⚠️');
                    return;
                }
                
                if (!model) {
                    showAlert('Please enter a tire model.', 'Model Required', '⚠️');
                    return;
                }
                
                if (!quantity || quantity < 1 || quantity > 4) {
                    showAlert('Please enter a quantity between 1 and 4.', 'Invalid Quantity', '⚠️');
                    return;
                }
                
                try {
                    const newTireSet = {
                        setName: setName,
                        brand: brand,
                        model: model,
                        quantity: quantity,
                        userId: window.currentUser.uid,
                        timestamp: Date.now()
                    };
                    await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'tireSets'), newTireSet);
                    
                    const addTireSetSection = document.querySelector('[data-section-content="add-tire-set"]');
                    const tireHistorySection = document.querySelector('[data-section-content="tire-history"]');
                    if (addTireSetSection) addTireSetSection.classList.remove('active');
                    if (tireHistorySection) tireHistorySection.classList.add('active');
                    
                    await renderTireSetList();
                } catch (error) {
                    console.error('Error adding tire set:', error);
                    showAlert('Error adding tire set. Please try again.', 'Error', '❌');
                }
            }

            if (addTireSetBtn) {
                addTireSetBtn.addEventListener('click', openAddTireSetSection);
            }
            
            if (confirmAddTireSetBtn) {
                confirmAddTireSetBtn.addEventListener('click', addTireSet);
            }
            
            if (tireSetListDiv) {
                tireSetListDiv.addEventListener('click', async function(e) {
                    const btn = e.target.closest('button[data-action]');
                    if (!btn) return;
                    const action = btn.getAttribute('data-action');
                    const id = btn.getAttribute('data-id');
                    
                    if (action === 'load-set') {
                        loadTireSetDetails(id);
                    } else if (action === 'delete-tire') {
                        const confirmed = await showConfirm('Are you sure you want to delete this tire set?', 'Delete Tire Set', '🗑️');
                        if (confirmed) {
                            try {
                                await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'tireSets', id));
                                await renderTireSetList();
                            } catch (error) {
                                console.error('Error deleting tire set:', error);
                                showAlert('Error deleting tire set. Please try again.', 'Error', '❌');
                            }
                        }
                    }
                });
            }

            // Load tire sets when tire history section is activated
            window.addEventListener('loadTireHistory', function() {
                setTimeout(() => {
                    renderTireSetList();
                    const appContainer = document.querySelector('.app-container');
                    if (appContainer) appContainer.scrollTop = 0;
                }, 50);
            });
            
            async function loadTireSetDetails(setId) {
                const tireSet = tireSets.find(ts => ts.id === setId);
                if (!tireSet) return;
                
                // Store current set ID for later use
                window.currentTireSetId = setId;
                window.currentTireSet = tireSet;
                
                // Hide tire history section and show set details section
                const tireHistorySection = document.querySelector('[data-section-content="tire-history"]');
                const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                const addTireSetSection = document.querySelector('[data-section-content="add-tire-set"]');
                
                if (tireHistorySection) tireHistorySection.classList.remove('active');
                if (addTireSetSection) addTireSetSection.classList.remove('active');
                if (setDetailsSection) {
                    setDetailsSection.classList.add('active');
                    
                    // Update set details info - condensed format
                    const setInfo = document.getElementById('tire-set-details-info');
                    if (setInfo) setInfo.innerHTML = `${tireSet.setName} | ${tireSet.brand} | Qty: ${tireSet.quantity}`;
                    
                    const appContainer = document.querySelector('.app-container');
                    if (appContainer) appContainer.scrollTop = 0;
                    
                    // Render individual tires list
                    renderTiresList(setId);
                }
            }
            
            async function renderTiresList(setId) {
                const tiresListDiv = document.getElementById('tires-list');
                if (!tiresListDiv) return;
                
                if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection) {
                    tiresListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Database not available.</p>';
                    return;
                }
                
                tiresListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading tires...</p>';
                
                // Query tires for current set
                const q = window.firebaseQuery(
                    window.firebaseCollection(window.firebaseDb, 'tires'),
                    window.firebaseWhere('setId', '==', setId),
                    window.firebaseWhere('userId', '==', window.currentUser.uid)
                );
                const querySnapshot = await window.firebaseGetDocs(q);
                const tires = [];
                querySnapshot.forEach(doc => {
                    tires.push({ id: doc.id, ...doc.data() });
                });
                
                tiresListDiv.innerHTML = '';
                if (tires.length === 0) {
                    tiresListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No individual tires added yet.</p>';
                    return;
                }
                
                // Fetch most recent event for each tire
                for (const tire of tires) {
                    const card = document.createElement('div');
                    card.className = 'instruction-card';
                    card.style.textAlign = 'left';
                    card.style.width = '100%';
                    card.style.margin = '16px 0';
                    card.style.background = 'rgba(230,238,246,0.05)';
                    card.style.border = '1px solid rgba(230,238,246,0.15)';
                    let timestamp = tire.timestamp ? new Date(tire.timestamp).toLocaleString() : '';
                    
                    // Fetch most recent event for this tire
                    let eventInfo = '';
                    try {
                        const eventsQuery = window.firebaseQuery(
                            window.firebaseCollection(window.firebaseDb, 'tireEvents'),
                            window.firebaseWhere('tireId', '==', tire.id)
                        );
                        const eventsSnapshot = await window.firebaseGetDocs(eventsQuery);
                        if (!eventsSnapshot.empty) {
                            // Get all events and sort by timestamp
                            const events = [];
                            eventsSnapshot.forEach(doc => {
                                events.push({ id: doc.id, ...doc.data() });
                            });
                            
                            // Sort by timestamp descending (most recent first)
                            events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                            
                            if (events.length > 0) {
                                const latestEvent = events[0];
                                const eventDate = latestEvent.timestamp ? new Date(latestEvent.timestamp).toLocaleString() : '';
                                
                                // Handle both old and new schema
                                let eventDetails = '';
                                if (latestEvent.outerChemical || latestEvent.innerChemical) {
                                    // New schema
                                    if (latestEvent.outerChemical) {
                                        eventDetails += `<p style="font-size: 0.85rem; color: rgba(230,238,246,0.7);">Outer: ${latestEvent.outerChemical}${latestEvent.outerAmount ? ' - ' + latestEvent.outerAmount : ''}</p>`;
                                    }
                                    if (latestEvent.innerChemical) {
                                        eventDetails += `<p style="font-size: 0.85rem; color: rgba(230,238,246,0.7);">Inner: ${latestEvent.innerChemical}${latestEvent.innerAmount ? ' - ' + latestEvent.innerAmount : ''}</p>`;
                                    }
                                } else if (latestEvent.chemical) {
                                    // Old schema
                                    eventDetails = `
                                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.7);">Chemical: ${latestEvent.chemical}</p>
                                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.7);">Amount: ${latestEvent.amount}</p>
                                    `;
                                }
                                
                                eventInfo = `
                                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(230,238,246,0.1);">
                                        <p style="font-size: 0.9rem; color: rgba(230,238,246,0.8); margin-bottom: 4px;"><strong>Latest Event:</strong></p>
                                        ${eventDetails}
                                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">${eventDate ? 'Applied: ' + eventDate : ''}</p>
                                    </div>
                                `;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching latest event:', error);
                    }
                    
                    card.innerHTML = `
                        <h3>${tire.tireName}</h3>
                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">
                            ${timestamp ? 'Added: ' + timestamp : ''}
                        </p>
                        ${eventInfo}
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn" data-action="load-tire" data-tire-id="${tire.id}" style="flex: 1;">📥 Load</button>
                            <button class="btn" data-action="delete-tire-individual" data-tire-id="${tire.id}" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                        </div>
                    `;
                    tiresListDiv.appendChild(card);
                }
            }
            
            window.backToTireHistory = function() {
                const tireHistorySection = document.querySelector('[data-section-content="tire-history"]');
                const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                const addTireSetSection = document.querySelector('[data-section-content="add-tire-set"]');
                
                if (setDetailsSection) setDetailsSection.classList.remove('active');
                if (addTireSetSection) addTireSetSection.classList.remove('active');
                if (tireHistorySection) tireHistorySection.classList.add('active');
                
                const appContainer = document.querySelector('.app-container');
                if (appContainer) appContainer.scrollTop = 0;
            };
            
            // Add Tire Section Functions
            const addTireBtn = document.getElementById('add-tire-btn');
            const tireNameInput = document.getElementById('tire-name-input');
            const confirmAddTireBtn = document.getElementById('confirm-add-tire-btn');
            
            async function openAddTireSection() {
                // Check if tire limit reached
                if (!window.currentTireSet || !window.currentTireSetId) {
                    showAlert('No tire set selected.', 'Error', '❌');
                    return;
                }
                
                // Count current tires in the set
                const q = window.firebaseQuery(
                    window.firebaseCollection(window.firebaseDb, 'tires'),
                    window.firebaseWhere('setId', '==', window.currentTireSetId),
                    window.firebaseWhere('userId', '==', window.currentUser.uid)
                );
                const querySnapshot = await window.firebaseGetDocs(q);
                const currentTireCount = querySnapshot.size;
                
                if (currentTireCount >= window.currentTireSet.quantity) {
                    showAlert(`You have reached the maximum number of tires (${window.currentTireSet.quantity}) for this set.`, 'Limit Reached', '⚠️');
                    return;
                }
                
                const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                const addTireSection = document.querySelector('[data-section-content="add-tire"]');
                const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                
                if (setDetailsSection) setDetailsSection.classList.remove('active');
                if (tireDetailsSection) tireDetailsSection.classList.remove('active');
                if (addTireSection) {
                    addTireSection.classList.add('active');
                    if (tireNameInput) tireNameInput.value = '';
                }
            }
            
            window.backToSetDetails = function() {
                const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                const addTireSection = document.querySelector('[data-section-content="add-tire"]');
                const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                
                if (addTireSection) addTireSection.classList.remove('active');
                if (tireDetailsSection) tireDetailsSection.classList.remove('active');
                if (setDetailsSection) setDetailsSection.classList.add('active');
            };
            
            async function addTire() {
                const tireName = tireNameInput.value.trim();
                
                if (!window.currentUser) {
                    showAlert('Please log in to add tires.', 'Not Logged In', '⚠️');
                    return;
                }
                
                if (!tireName) {
                    showAlert('Please enter a tire label/name.', 'Name Required', '⚠️');
                    return;
                }
                
                if (!window.currentTireSetId) {
                    showAlert('No tire set selected.', 'Error', '❌');
                    return;
                }
                
                try {
                    const newTire = {
                        tireName: tireName,
                        setId: window.currentTireSetId,
                        userId: window.currentUser.uid,
                        timestamp: Date.now()
                    };
                    await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'tires'), newTire);
                    
                    const addTireSection = document.querySelector('[data-section-content="add-tire"]');
                    const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                    if (addTireSection) addTireSection.classList.remove('active');
                    if (setDetailsSection) setDetailsSection.classList.add('active');
                    
                    await renderTiresList(window.currentTireSetId);
                } catch (error) {
                    console.error('Error adding tire:', error);
                    showAlert('Error adding tire. Please try again.', 'Error', '❌');
                }
            }
            
            if (addTireBtn) {
                addTireBtn.addEventListener('click', openAddTireSection);
            }
            
            if (confirmAddTireBtn) {
                confirmAddTireBtn.addEventListener('click', addTire);
            }
            
            // Define loadTireDetails and renderTireEvents functions BEFORE event handlers
            async function loadTireDetails(tireId) {
                console.log('loadTireDetails called with:', tireId);
                // Find the tire in the database
                if (!window.firebaseDb || !window.firebaseGetDoc || !window.firebaseDoc) {
                    console.error('Firebase not available');
                    return;
                }
                
                try {
                    const tireDoc = await window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, 'tires', tireId));
                    if (!tireDoc.exists()) {
                        console.error('Tire not found');
                        return;
                    }
                    
                    const tire = { id: tireDoc.id, ...tireDoc.data() };
                    console.log('Loaded tire:', tire);
                    window.currentTire = tire;
                    window.currentTireId = tireId;
                    
                    // Navigate to tire details section
                    const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                    const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                    const addTireSection = document.querySelector('[data-section-content="add-tire"]');
                    
                    console.log('Sections:', setDetailsSection, tireDetailsSection);
                    
                    if (setDetailsSection) setDetailsSection.classList.remove('active');
                    if (addTireSection) addTireSection.classList.remove('active');
                    if (tireDetailsSection) {
                        tireDetailsSection.classList.add('active');
                        
                        // Update tire details info
                        const tireDetailsInfo = document.getElementById('tire-details-info');
                        if (tireDetailsInfo) tireDetailsInfo.innerHTML = `${tire.tireName}`;
                        
                        // Render tire events
                        renderTireEvents(tireId);
                    }
                } catch (error) {
                    console.error('Error loading tire:', error);
                }
            }
            
            async function renderTireEvents(tireId) {
                const eventsListDiv = document.getElementById('tire-events-list');
                if (!eventsListDiv) return;
                
                if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection) {
                    eventsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Database not available.</p>';
                    return;
                }
                
                eventsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">Loading events...</p>';
                
                // Query events for current tire
                const q = window.firebaseQuery(
                    window.firebaseCollection(window.firebaseDb, 'tireEvents'),
                    window.firebaseWhere('tireId', '==', tireId),
                    window.firebaseWhere('userId', '==', window.currentUser.uid)
                );
                const querySnapshot = await window.firebaseGetDocs(q);
                const events = [];
                querySnapshot.forEach(doc => {
                    events.push({ id: doc.id, ...doc.data() });
                });
                
                eventsListDiv.innerHTML = '';
                if (events.length === 0) {
                    eventsListDiv.innerHTML = '<p style="color:rgba(230,238,246,0.7);text-align:center;">No events added yet.</p>';
                    return;
                }
                
                events.forEach((event) => {
                    const card = document.createElement('div');
                    card.className = 'instruction-card';
                    card.style.textAlign = 'left';
                    card.style.width = '100%';
                    card.style.margin = '16px 0';
                    card.style.background = 'rgba(230,238,246,0.05)';
                    card.style.border = '1px solid rgba(230,238,246,0.15)';
                    let timestamp = event.timestamp ? new Date(event.timestamp).toLocaleString() : '';
                    
                    // Handle both old and new schema
                    let chemicalDisplay = '';
                    if (event.outerChemical || event.innerChemical) {
                        chemicalDisplay = `
                            ${event.outerChemical ? `<p style="font-size: 0.95rem; color: rgba(230,238,246,0.8); margin-bottom: 4px;">
                                <strong>Outer:</strong> ${event.outerChemical}${event.outerAmount ? ` - ${event.outerAmount}` : ''}
                            </p>` : ''}
                            ${event.innerChemical ? `<p style="font-size: 0.95rem; color: rgba(230,238,246,0.8); margin-bottom: 4px;">
                                <strong>Inner:</strong> ${event.innerChemical}${event.innerAmount ? ` - ${event.innerAmount}` : ''}
                            </p>` : ''}
                        `;
                    } else if (event.chemical) {
                        // Old schema
                        chemicalDisplay = `<p style="font-size: 0.95rem; color: rgba(230,238,246,0.8); margin-bottom: 4px;">
                            <strong>Chemical:</strong> ${event.chemical}${event.amount ? ` - ${event.amount}` : ''}
                        </p>`;
                    }
                    
                    card.innerHTML = `
                        <h3>Event</h3>
                        ${chemicalDisplay}
                        ${event.description ? `<p style="font-size: 0.9rem; color: rgba(230,238,246,0.7); margin-top: 8px;">${event.description}</p>` : ''}
                        <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6); margin-top: 8px;">
                            ${timestamp ? 'Added: ' + timestamp : ''}
                        </p>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn" data-action="view-event" data-event-id="${event.id}" style="flex: 1;">👁️ View</button>
                            <button class="btn" data-action="edit-event" data-event-id="${event.id}" style="flex: 1;">✏️ Edit</button>
                            <button class="btn" data-action="delete-event" data-event-id="${event.id}" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                        </div>
                    `;
                    eventsListDiv.appendChild(card);
                });
            }
            
            // Handle tire actions - use document level delegation since tires-list gets recreated
            document.body.addEventListener('click', async function(e) {
                // Check if click is within tires-list
                const tiresListDiv = document.getElementById('tires-list');
                if (!tiresListDiv || !tiresListDiv.contains(e.target)) return;
                
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                const action = btn.getAttribute('data-action');
                const tireId = btn.getAttribute('data-tire-id');
                
                console.log('Tire button clicked:', action, tireId);
                
                if (action === 'load-tire' && tireId) {
                    console.log('Loading tire details for:', tireId);
                    await loadTireDetails(tireId);
                } else if (action === 'delete-tire-individual' && tireId) {
                    const confirmed = await showConfirm('Are you sure you want to delete this tire?', 'Delete Tire', '🗑️');
                    if (confirmed) {
                        try {
                            await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'tires', tireId));
                            await renderTiresList(window.currentTireSetId);
                        } catch (error) {
                            console.error('Error deleting tire:', error);
                            showAlert('Error deleting tire. Please try again.', 'Error', '❌');
                        }
                    }
                }
            });
            
            // Add Event Modal Functions
            const addEventBtn = document.getElementById('add-event-btn');
            const addEventModal = document.getElementById('add-event-modal');
            const chemicalInput = document.getElementById('chemical-input');
            const amountInput = document.getElementById('amount-input');
            const descriptionInput = document.getElementById('description-input');
            const confirmAddEventBtn = document.getElementById('confirm-add-event-btn');
            
            function openAddEventSection() {
                // Navigate to add event section
                const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                const addEventSection = document.querySelector('[data-section-content="add-event"]');
                const viewEventSection = document.querySelector('[data-section-content="view-event"]');
                const editEventSection = document.querySelector('[data-section-content="edit-event"]');
                
                if (tireDetailsSection) tireDetailsSection.classList.remove('active');
                if (viewEventSection) viewEventSection.classList.remove('active');
                if (editEventSection) editEventSection.classList.remove('active');
                if (addEventSection) {
                    addEventSection.classList.add('active');
                    
                    // Clear form
                    const outerChemicalInput = document.getElementById('outer-chemical-input');
                    const outerAmountInput = document.getElementById('outer-amount-input');
                    const innerChemicalInput = document.getElementById('inner-chemical-input');
                    const innerAmountInput = document.getElementById('inner-amount-input');
                    const descriptionInput = document.getElementById('description-input');
                    const applyToAllCheckbox = document.getElementById('apply-to-all-tires');
                    
                    if (outerChemicalInput) outerChemicalInput.value = '';
                    if (outerAmountInput) outerAmountInput.value = '';
                    if (innerChemicalInput) innerChemicalInput.value = '';
                    if (innerAmountInput) innerAmountInput.value = '';
                    if (descriptionInput) descriptionInput.value = '';
                    if (applyToAllCheckbox) applyToAllCheckbox.checked = false;
                }
            }
            
            window.backToTireDetails = function() {
                const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                const viewEventSection = document.querySelector('[data-section-content="view-event"]');
                const editEventSection = document.querySelector('[data-section-content="edit-event"]');
                const addEventSection = document.querySelector('[data-section-content="add-event"]');
                const setDetailsSection = document.querySelector('[data-section-content="tire-set-details"]');
                
                if (viewEventSection) viewEventSection.classList.remove('active');
                if (editEventSection) editEventSection.classList.remove('active');
                if (addEventSection) addEventSection.classList.remove('active');
                if (setDetailsSection) setDetailsSection.classList.remove('active');
                if (tireDetailsSection) tireDetailsSection.classList.add('active');
            };
            
            async function addEvent() {
                const outerChemical = document.getElementById('outer-chemical-input').value.trim();
                const outerAmount = document.getElementById('outer-amount-input').value.trim();
                const innerChemical = document.getElementById('inner-chemical-input').value.trim();
                const innerAmount = document.getElementById('inner-amount-input').value.trim();
                const description = descriptionInput.value.trim();
                const applyToAll = document.getElementById('apply-to-all-tires')?.checked || false;
                
                if (!window.currentUser) {
                    showAlert('Please log in to add events.', 'Not Logged In', '⚠️');
                    return;
                }
                
                if (!window.currentTireId) {
                    showAlert('No tire selected.', 'Error', '❌');
                    return;
                }
                
                try {
                    const timestamp = Date.now();
                    
                    if (applyToAll && window.currentTire && window.currentTire.setId) {
                        // Get all tires in the set
                        const tiresQuery = window.firebaseQuery(
                            window.firebaseCollection(window.firebaseDb, 'tires'),
                            window.firebaseWhere('setId', '==', window.currentTire.setId),
                            window.firebaseWhere('userId', '==', window.currentUser.uid)
                        );
                        const tiresSnapshot = await window.firebaseGetDocs(tiresQuery);
                        
                        // Add event to all tires in the set
                        const promises = [];
                        tiresSnapshot.forEach(doc => {
                            const newEvent = {
                                outerChemical: outerChemical,
                                outerAmount: outerAmount,
                                innerChemical: innerChemical,
                                innerAmount: innerAmount,
                                description: description,
                                tireId: doc.id,
                                userId: window.currentUser.uid,
                                timestamp: timestamp
                            };
                            promises.push(window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'tireEvents'), newEvent));
                        });
                        
                        await Promise.all(promises);
                    } else {
                        // Add new event to current tire only
                        const newEvent = {
                            outerChemical: outerChemical,
                            outerAmount: outerAmount,
                            innerChemical: innerChemical,
                            innerAmount: innerAmount,
                            description: description,
                            tireId: window.currentTireId,
                            userId: window.currentUser.uid,
                            timestamp: timestamp
                        };
                        await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'tireEvents'), newEvent);
                    }
                    
                    // Navigate back to tire details
                    const addEventSection = document.querySelector('[data-section-content="add-event"]');
                    const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                    if (addEventSection) addEventSection.classList.remove('active');
                    if (tireDetailsSection) tireDetailsSection.classList.add('active');
                    
                    await renderTireEvents(window.currentTireId);
                } catch (error) {
                    console.error('Error saving event:', error);
                    showAlert('Error saving event. Please try again.', 'Error', '❌');
                }
            }
            
            async function updateEvent() {
                const editOuterChemicalInput = document.getElementById('edit-outer-chemical-input');
                const editOuterAmountInput = document.getElementById('edit-outer-amount-input');
                const editInnerChemicalInput = document.getElementById('edit-inner-chemical-input');
                const editInnerAmountInput = document.getElementById('edit-inner-amount-input');
                const editDescriptionInput = document.getElementById('edit-description-input');
                const confirmEditEventBtn = document.getElementById('confirm-edit-event-btn');
                
                const outerChemical = editOuterChemicalInput.value.trim();
                const outerAmount = editOuterAmountInput.value.trim();
                const innerChemical = editInnerChemicalInput.value.trim();
                const innerAmount = editInnerAmountInput.value.trim();
                const description = editDescriptionInput.value.trim();
                const editingId = confirmEditEventBtn.dataset.editingId;
                
                if (!window.currentUser) {
                    showAlert('Please log in to update events.', 'Not Logged In', '⚠️');
                    return;
                }
                
                try {
                    // Update existing event
                    const eventData = {
                        outerChemical: outerChemical,
                        outerAmount: outerAmount,
                        innerChemical: innerChemical,
                        innerAmount: innerAmount,
                        description: description
                    };
                    await window.firebaseUpdateDoc(window.firebaseDoc(window.firebaseDb, 'tireEvents', editingId), eventData);
                    delete confirmEditEventBtn.dataset.editingId;
                    
                    // Navigate back to tire details
                    const editEventSection = document.querySelector('[data-section-content="edit-event"]');
                    const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                    if (editEventSection) editEventSection.classList.remove('active');
                    if (tireDetailsSection) tireDetailsSection.classList.add('active');
                    
                    await renderTireEvents(window.currentTireId);
                } catch (error) {
                    console.error('Error updating event:', error);
                    showAlert('Error updating event. Please try again.', 'Error', '❌');
                }
            }
            
            if (addEventBtn) {
                addEventBtn.addEventListener('click', openAddEventSection);
            }
            
            if (confirmAddEventBtn) {
                confirmAddEventBtn.addEventListener('click', addEvent);
            }
            
            const confirmEditEventBtn = document.getElementById('confirm-edit-event-btn');
            if (confirmEditEventBtn) {
                confirmEditEventBtn.addEventListener('click', updateEvent);
            }
            
            // Handle event actions with event delegation on events list
            const eventsListDiv = document.getElementById('tire-events-list');
            if (eventsListDiv) {
                eventsListDiv.addEventListener('click', async function(e) {
                    const btn = e.target.closest('button[data-action]');
                    if (!btn) return;
                    const action = btn.getAttribute('data-action');
                    const eventId = btn.getAttribute('data-event-id');
                    
                    if (action === 'view-event' && eventId) {
                        viewEventDetails(eventId);
                    } else if (action === 'edit-event' && eventId) {
                        editEventDetails(eventId);
                    } else if (action === 'delete-event' && eventId) {
                        const confirmed = await showConfirm('Are you sure you want to delete this event?', 'Delete Event', '🗑️');
                        if (confirmed) {
                            try {
                                await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'tireEvents', eventId));
                                await renderTireEvents(window.currentTireId);
                            } catch (error) {
                                console.error('Error deleting event:', error);
                                showAlert('Error deleting event. Please try again.', 'Error', '❌');
                            }
                        }
                    }
                });
            }
            
            async function viewEventDetails(eventId) {
                // Find the event data
                const eventDoc = await window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, 'tireEvents', eventId));
                if (!eventDoc.exists()) return;
                
                const event = eventDoc.data();
                const timestamp = event.timestamp ? new Date(event.timestamp).toLocaleString() : '';
                
                // Navigate to view event section
                const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                const viewEventSection = document.querySelector('[data-section-content="view-event"]');
                const editEventSection = document.querySelector('[data-section-content="edit-event"]');
                const addEventSection = document.querySelector('[data-section-content="add-event"]');
                
                if (tireDetailsSection) tireDetailsSection.classList.remove('active');
                if (editEventSection) editEventSection.classList.remove('active');
                if (addEventSection) addEventSection.classList.remove('active');
                if (viewEventSection) {
                    viewEventSection.classList.add('active');
                    
                    // Update view content
                    const viewEventTitle = document.getElementById('view-event-title');
                    const viewEventContent = document.getElementById('view-event-content');
                    
                    if (viewEventTitle) viewEventTitle.textContent = 'Event Details';
                    if (viewEventContent) {
                        // Handle both old and new schema
                        let contentHTML = '';
                        if (event.outerChemical || event.innerChemical) {
                            // New schema
                            if (event.outerChemical) {
                                contentHTML += `
                                <div style="margin-bottom: 16px;">
                                    <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Outer Chemical:</strong>
                                    <p style="font-size: 1.1rem; margin-top: 4px;">${event.outerChemical}</p>
                                </div>`;
                            }
                            if (event.outerAmount) {
                                contentHTML += `
                                <div style="margin-bottom: 16px;">
                                    <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Outer Amount:</strong>
                                    <p style="font-size: 1.1rem; margin-top: 4px;">${event.outerAmount}</p>
                                </div>`;
                            }
                            if (event.innerChemical) {
                                contentHTML += `
                                <div style="margin-bottom: 16px;">
                                    <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Inner Chemical:</strong>
                                    <p style="font-size: 1.1rem; margin-top: 4px;">${event.innerChemical}</p>
                                </div>`;
                            }
                            if (event.innerAmount) {
                                contentHTML += `
                                <div style="margin-bottom: 16px;">
                                    <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Inner Amount:</strong>
                                    <p style="font-size: 1.1rem; margin-top: 4px;">${event.innerAmount}</p>
                                </div>`;
                            }
                        } else if (event.chemical) {
                            // Old schema
                            contentHTML += `
                            <div style="margin-bottom: 16px;">
                                <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Chemical:</strong>
                                <p style="font-size: 1.1rem; margin-top: 4px;">${event.chemical}</p>
                            </div>
                            <div style="margin-bottom: 16px;">
                                <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Amount:</strong>
                                <p style="font-size: 1.1rem; margin-top: 4px;">${event.amount}</p>
                            </div>`;
                        }
                        
                        viewEventContent.innerHTML = `
                            ${contentHTML}
                            ${event.description ? `
                            <div style="margin-bottom: 16px;">
                                <strong style="color: rgba(230,238,246,0.6); font-size: 0.9rem;">Description:</strong>
                                <p style="font-size: 1rem; margin-top: 4px; line-height: 1.5;">${event.description}</p>
                            </div>
                            ` : ''}
                            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(230,238,246,0.15);">
                                <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">
                                    Added: ${timestamp}
                                </p>
                            </div>
                        `;
                    }
                }
            }
            
            async function editEventDetails(eventId) {
                // Find the event data
                const eventDoc = await window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, 'tireEvents', eventId));
                if (!eventDoc.exists()) return;
                
                const event = eventDoc.data();
                
                // Navigate to edit event section
                const tireDetailsSection = document.querySelector('[data-section-content="tire-details"]');
                const editEventSection = document.querySelector('[data-section-content="edit-event"]');
                const viewEventSection = document.querySelector('[data-section-content="view-event"]');
                const addEventSection = document.querySelector('[data-section-content="add-event"]');
                
                if (tireDetailsSection) tireDetailsSection.classList.remove('active');
                if (viewEventSection) viewEventSection.classList.remove('active');
                if (addEventSection) addEventSection.classList.remove('active');
                if (editEventSection) {
                    editEventSection.classList.add('active');
                    
                    // Fill edit form with event data
                    const editOuterChemicalInput = document.getElementById('edit-outer-chemical-input');
                    const editOuterAmountInput = document.getElementById('edit-outer-amount-input');
                    const editInnerChemicalInput = document.getElementById('edit-inner-chemical-input');
                    const editInnerAmountInput = document.getElementById('edit-inner-amount-input');
                    const editDescriptionInput = document.getElementById('edit-description-input');
                    const confirmEditEventBtn = document.getElementById('confirm-edit-event-btn');
                    
                    // Handle both old and new schema
                    if (editOuterChemicalInput) editOuterChemicalInput.value = event.outerChemical || event.chemical || '';
                    if (editOuterAmountInput) editOuterAmountInput.value = event.outerAmount || event.amount || '';
                    if (editInnerChemicalInput) editInnerChemicalInput.value = event.innerChemical || '';
                    if (editInnerAmountInput) editInnerAmountInput.value = event.innerAmount || '';
                    if (editDescriptionInput) editDescriptionInput.value = event.description || '';
                    if (confirmEditEventBtn) confirmEditEventBtn.dataset.editingId = eventId;
                }
            }
        }
        setupTireHistory();

    /**
     * ========================================================================
     * SECTION 4: UI UTILITIES & MODAL SYSTEM
     * ========================================================================
     * 
     * Reusable UI components for alerts, confirmations, and prompts.
     * 
     * Functions:
     * - showAlert()            : Display informational message
     * - showConfirm()          : Display confirmation dialog
     * - showPrompt()           : Get user text input
     * - showSaveBuildModal()   : Save kart build configuration
     * - closeAlertModal()      : Close alert modal
     * - closeConfirmModal()    : Close confirm modal
     * - closeSaveBuildModal()  : Close save build modal
     * 
     * All modals return Promises for clean async/await usage.
     * Icons can be customized with emoji parameters.
     * 
     * ========================================================================
     */

    // --- Modal Utilities ---
    function showAlert(message, title = 'Alert', icon = 'ℹ️') {
        return new Promise(resolve => {
            const modal = document.getElementById('alert-modal');
            const titleEl = document.getElementById('alert-modal-title');
            const messageEl = document.getElementById('alert-modal-message');
            if (modal && titleEl && messageEl) {
                titleEl.textContent = `${icon} ${title}`;
                messageEl.textContent = message;
                modal.style.display = 'flex';
                modal.dataset.resolve = resolve;
            }
            function handler() {
                closeAlertModal();
                resolve();
            }
            modal.querySelector('.btn.primary').onclick = handler;
            modal.querySelector('.modal-close').onclick = handler;
        });
    }
    function closeAlertModal() {
        const modal = document.getElementById('alert-modal');
        if (modal) modal.style.display = 'none';
    }
    function showPrompt(message, title = 'Input', icon = '📝') {
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
                window.closePromptModal = function(value) {
                    modal.style.display = 'none';
                    resolve(value);
                };
                inputEl.onkeydown = function(e) {
                    if (e.key === 'Enter') {
                        window.closePromptModal(inputEl.value);
                    } else if (e.key === 'Escape') {
                        window.closePromptModal(null);
                    }
                };
            }
        });
    }
    function showConfirm(message, title = 'Confirm', icon = '❓') {
        return new Promise(resolve => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-modal-title');
            const messageEl = document.getElementById('confirm-modal-message');
            if (modal && titleEl && messageEl) {
                titleEl.textContent = `${icon} ${title}`;
                messageEl.textContent = message;
                modal.style.display = 'flex';
                modal.dataset.resolve = resolve;
            }
            function ok() { closeConfirmModal(true); resolve(true); }
            function cancel() { closeConfirmModal(false); resolve(false); }
            modal.querySelector('.btn.primary').onclick = ok;
            modal.querySelector('.btn:not(.primary)').onclick = cancel;
            modal.querySelector('.modal-close').onclick = cancel;
        });
    }
    function closeConfirmModal(result) {
        const modal = document.getElementById('confirm-modal');
        if (modal) modal.style.display = 'none';
    }
    function showSaveBuildModal() {
        return new Promise(resolve => {
            const modal = document.getElementById('save-build-modal');
            const input = document.getElementById('build-name-input');
            if (modal && input) {
                input.value = '';
                modal.style.display = 'flex';
                input.focus();
            }
            function save() {
                const name = input.value.trim();
                if (!name) {
                    showAlert('Please enter a name for your build.', 'Missing Name', '⚠️');
                    return;
                }
                closeSaveBuildModal();
                resolve(name);
            }
            function cancel() {
                closeSaveBuildModal();
                resolve(null);
            }
            modal.querySelector('.btn.primary').onclick = save;
            modal.querySelector('.btn:not(.primary)').onclick = cancel;
            modal.querySelector('.modal-close').onclick = cancel;
        });
    }
    function closeSaveBuildModal() {
        const modal = document.getElementById('save-build-modal');
        if (modal) modal.style.display = 'none';
    }

    /**
     * ========================================================================
     * SECTION 5: PROFILE MANAGEMENT
     * ========================================================================
     * 
     * Handles user profile data, settings, and preferences.
     * 
     * Key Functions:
     * - setupProfilePage()          : Initialize profile interface
     * - loadProfileData()           : Fetch user profile from Firestore
     * - updateInitials()            : Update profile initials display
     * - calculateAge()              : Calculate age from DOB
     * - updateHeaderAvatar()        : Update avatar in header
     * 
     * Features:
     * - Profile picture upload (compressed to base64)
     * - Edit mode toggle (view/edit)
     * - Email and password management
     * - Personal information management
     * - Age calculation from date of birth
     * 
     * ========================================================================
     */

document.addEventListener('DOMContentLoaded', function () {
    const isSignedIn = () => {
        // Firebase auth is now handled in app.html/sign.html
        return window.currentUser !== null && window.currentUser !== undefined;
    };

    /**
     * UI COMPONENT: Profile Menu
     * Displays user profile button and dropdown menu in header
     */
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

            // Show dropdown on hover
            pm.addEventListener('mouseenter', function () {
                btn.setAttribute('aria-expanded', 'true');
                dropdown.classList.remove('hidden');
                dropdown.setAttribute('aria-hidden', 'false');
            });

            // Hide dropdown on mouse leave
            pm.addEventListener('mouseleave', function () {
                btn.setAttribute('aria-expanded', 'false');
                dropdown.classList.add('hidden');
                dropdown.setAttribute('aria-hidden', 'true');
            });
        });

        // Global logout handler (works for any .logout button)
        document.addEventListener('click', function (e) {
            if (e.target && e.target.matches && e.target.matches('.logout')) {
                try { localStorage.removeItem('signedIn'); } catch (_) { }
                window.location.href = 'index.html';
            }
        });
        
        // Setup profile page functionality (will be called from profile.html after auth)
        if (document.getElementById('profile-picture-input')) {
            setupProfilePage();
        }
    }
    
    // Make setupProfilePage globally accessible
    window.setupProfilePage = function setupProfilePage() {
        // Check if we're on the profile page
        const profilePictureInput = document.getElementById('profile-picture-input');
        if (!profilePictureInput) return; // Not on profile page
        
        // View mode elements
        const profileViewMode = document.getElementById('profile-view-mode');
        const profileEditMode = document.getElementById('profile-edit-mode');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const backToViewBtn = document.getElementById('back-to-view-btn');
        const viewProfilePicture = document.getElementById('view-profile-picture');
        const viewProfileInitials = document.getElementById('view-profile-initials');
        const viewDisplayName = document.getElementById('view-display-name');
        const viewEmail = document.getElementById('view-email');
        const viewDob = document.getElementById('view-dob');
        const viewAge = document.getElementById('view-age');
        const viewRacingTeam = document.getElementById('view-racing-team');
        const viewKartNumber = document.getElementById('view-kart-number');
        const viewRacingClass = document.getElementById('view-racing-class');
        
        // Edit mode elements
        const profilePicturePreview = document.getElementById('profile-picture-preview');
        const profileInitials = document.getElementById('profile-initials');
        const removePictureBtn = document.getElementById('remove-picture-btn');
        const displayNameInput = document.getElementById('display-name-input');
        const dobInput = document.getElementById('dob-input');
        const ageDisplay = document.getElementById('age-display');
        const racingTeamInput = document.getElementById('racing-team-input');
        const kartNumberInput = document.getElementById('kart-number-input');
        const racingClassInput = document.getElementById('racing-class-input');
        const savePersonalInfoBtn = document.getElementById('save-personal-info-btn');
        const currentEmailDisplay = document.getElementById('current-email-display');
        const emailCurrentPassword = document.getElementById('email-current-password');
        const newEmailInput = document.getElementById('new-email-input');
        const changeEmailBtn = document.getElementById('change-email-btn');
        const passwordCurrentPassword = document.getElementById('password-current-password');
        const newPasswordInput = document.getElementById('new-password-input');
        const confirmNewPasswordInput = document.getElementById('confirm-new-password-input');
        const changePasswordBtn = document.getElementById('change-password-btn');
        
        // Toggle between view and edit modes
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                profileViewMode.style.display = 'none';
                profileEditMode.style.display = 'block';
            });
        }
        
        if (backToViewBtn) {
            backToViewBtn.addEventListener('click', function() {
                profileEditMode.style.display = 'none';
                profileViewMode.style.display = 'block';
                loadProfileData(); // Refresh view mode data
            });
        }
        
        // Load user profile data
        async function loadProfileData() {
            if (!window.currentUser) return;
            
            // Display current email
            if (currentEmailDisplay) {
                currentEmailDisplay.textContent = window.currentUser.email;
            }
            
            // Load profile data from Firestore
            try {
                const userDocRef = window.firebaseDoc(window.firebaseDb, 'users', window.currentUser.uid);
                const userDoc = await window.firebaseGetDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    
                    // Populate edit mode
                    if (displayNameInput) displayNameInput.value = data.displayName || '';
                    if (dobInput) dobInput.value = data.dob || '';
                    if (racingTeamInput) racingTeamInput.value = data.racingTeam || '';
                    if (kartNumberInput) kartNumberInput.value = data.kartNumber || '';
                    if (racingClassInput) racingClassInput.value = data.racingClass || '';
                    
                    // Populate view mode
                    if (viewDisplayName) viewDisplayName.textContent = data.displayName || 'No Name Set';
                    if (viewEmail) viewEmail.textContent = window.currentUser.email;
                    if (viewDob) viewDob.textContent = data.dob ? new Date(data.dob).toLocaleDateString() : 'Not set';
                    if (viewRacingTeam) viewRacingTeam.textContent = data.racingTeam || 'Not set';
                    if (viewKartNumber) viewKartNumber.textContent = data.kartNumber || 'Not set';
                    if (viewRacingClass) viewRacingClass.textContent = data.racingClass || 'Not set';
                    
                    // Calculate and display age in view mode
                    if (data.dob) {
                        const birthDate = new Date(data.dob);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        if (viewAge) viewAge.textContent = `${age} years old`;
                        if (ageDisplay) ageDisplay.textContent = `Age: ${age} years old`;
                    } else {
                        if (viewAge) viewAge.textContent = 'Not set';
                    }
                    
                    // Update profile picture in both modes
                    if (data.profilePicture) {
                        // Edit mode
                        if (profilePicturePreview) {
                            profilePicturePreview.src = data.profilePicture;
                            profilePicturePreview.style.display = 'block';
                        }
                        if (profileInitials) {
                            profileInitials.style.display = 'none';
                        }
                        // View mode
                        if (viewProfilePicture) {
                            viewProfilePicture.src = data.profilePicture;
                            viewProfilePicture.style.display = 'block';
                        }
                        if (viewProfileInitials) {
                            viewProfileInitials.style.display = 'none';
                        }
                    } else {
                        updateInitials(data.displayName || window.currentUser.email);
                        updateViewInitials(data.displayName || window.currentUser.email);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }
        
        function updateInitials(name) {
            if (!profileInitials) return;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            profileInitials.textContent = initials;
            profileInitials.style.display = 'flex';
            if (profilePicturePreview) profilePicturePreview.style.display = 'none';
        }
        
        function updateViewInitials(name) {
            if (!viewProfileInitials) return;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            viewProfileInitials.textContent = initials;
            viewProfileInitials.style.display = 'flex';
            if (viewProfilePicture) viewProfilePicture.style.display = 'none';
        }
        
        function updateHeaderAvatar(imageUrl) {
            const avatarEl = document.querySelector('.avatar');
            if (!avatarEl) return;
            
            avatarEl.innerHTML = '';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            avatarEl.appendChild(img);
        }
        
        function calculateAge(dob) {
            if (!dob || !ageDisplay) return;
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            ageDisplay.textContent = `Age: ${age} years old`;
        }
        
        // Handle profile picture upload
        if (profilePictureInput) {
            profilePictureInput.addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                // Validate file type
                const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showAlert('Please select a valid image file (PNG, JPG, JPEG, GIF, or WEBP)', 'Invalid File', '⚠️');
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size must be less than 5MB');
                    return;
                }
                
                // Resize and compress image to fit Firestore limits
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = async function() {
                        // Create canvas to resize image
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Resize to max 200x200 to keep file size small
                        const maxSize = 200;
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > height) {
                            if (width > maxSize) {
                                height *= maxSize / width;
                                width = maxSize;
                            }
                        } else {
                            if (height > maxSize) {
                                width *= maxSize / height;
                                height = maxSize;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convert to base64 with compression
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                        
                        try {
                            const userDocRef = window.firebaseDoc(window.firebaseDb, 'users', window.currentUser.uid);
                            await window.firebaseSetDoc(userDocRef, {
                                profilePicture: compressedBase64,
                                userId: window.currentUser.uid
                            }, { merge: true });
                            
                            if (profilePicturePreview) {
                                profilePicturePreview.src = compressedBase64;
                                profilePicturePreview.style.display = 'block';
                            }
                            if (profileInitials) {
                                profileInitials.style.display = 'none';
                            }
                            
                            // Update header avatar
                            updateHeaderAvatar(compressedBase64);
                        } catch (error) {
                            console.error('Error uploading picture:', error);
                            alert('Error uploading picture: ' + error.message);
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Handle remove picture
        if (removePictureBtn) {
            removePictureBtn.addEventListener('click', async function() {
                if (!confirm('Remove profile picture?')) return;
                
                try {
                    const userDocRef = window.firebaseDoc(window.firebaseDb, 'users', window.currentUser.uid);
                    await window.firebaseSetDoc(userDocRef, {
                        profilePicture: '',
                        userId: window.currentUser.uid
                    }, { merge: true });
                    
                    if (profilePicturePreview) {
                        profilePicturePreview.style.display = 'none';
                    }
                    updateInitials(displayNameInput.value || window.currentUser.email);
                    
                    // Update header avatar to show initials
                    const avatarEl = document.querySelector('.avatar');
                    if (avatarEl) {
                        const displayName = displayNameInput.value || window.currentUser.email;
                        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        avatarEl.innerHTML = '';
                        avatarEl.textContent = initials;
                    }
                } catch (error) {
                    console.error('Error removing picture:', error);
                    alert('Error removing picture: ' + error.message);
                }
            });
        }
        
        // Calculate age when DOB changes
        if (dobInput) {
            dobInput.addEventListener('change', function() {
                calculateAge(this.value);
            });
        }
        
        // Save personal information
        if (savePersonalInfoBtn) {
            savePersonalInfoBtn.addEventListener('click', async function() {
                if (!window.currentUser) return;
                
                try {
                    const userDocRef = window.firebaseDoc(window.firebaseDb, 'users', window.currentUser.uid);
                    await window.firebaseSetDoc(userDocRef, {
                        displayName: displayNameInput.value.trim(),
                        dob: dobInput.value,
                        racingTeam: racingTeamInput.value.trim(),
                        kartNumber: kartNumberInput.value.trim(),
                        racingClass: racingClassInput.value.trim(),
                        userId: window.currentUser.uid
                    }, { merge: true });
                    
                    // Update initials if no profile picture
                    if (!profilePicturePreview.src || profilePicturePreview.style.display === 'none') {
                        updateInitials(displayNameInput.value || window.currentUser.email);
                        updateViewInitials(displayNameInput.value || window.currentUser.email);
                    }
                    
                    // Update view mode with new data
                    await loadProfileData();
                } catch (error) {
                    console.error('Error saving personal info:', error);
                    alert('Error saving information: ' + error.message);
                }
            });
        }
        
        // Change email
        if (changeEmailBtn) {
            changeEmailBtn.addEventListener('click', async function() {
                const currentPassword = emailCurrentPassword.value.trim();
                const newEmail = newEmailInput.value.trim();
                
                if (!currentPassword) {
                    showAlert('Please enter your current password', 'Password Required', '⚠️');
                    return;
                }
                
                if (!newEmail) {
                    showAlert('Please enter a new email address', 'Email Required', '⚠️');
                    return;
                }
                
                if (!newEmail.includes('@')) {
                    showAlert('Please enter a valid email address', 'Invalid Email', '⚠️');
                    return;
                }
                
                try {
                    // Reauthenticate user
                    const credential = window.firebaseEmailAuthProvider.credential(
                        window.currentUser.email,
                        currentPassword
                    );
                    await window.firebaseReauthenticateWithCredential(window.currentUser, credential);
                    
                    // Update email
                    await window.firebaseUpdateEmail(window.currentUser, newEmail);
                    
                    emailCurrentPassword.value = '';
                    newEmailInput.value = '';
                    currentEmailDisplay.textContent = newEmail;
                    
                    showAlert('Email changed successfully! Please verify your new email.', 'Success', '✅');
                } catch (error) {
                    console.error('Error changing email:', error);
                    if (error.code === 'auth/wrong-password') {
                        showAlert('Current password is incorrect', 'Error', '❌');
                    } else if (error.code === 'auth/email-already-in-use') {
                        showAlert('This email is already in use', 'Error', '❌');
                    } else {
                        showAlert('Error changing email: ' + error.message, 'Error', '❌');
                    }
                }
            });
        }
        
        // Change password
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', async function() {
                const currentPassword = passwordCurrentPassword.value.trim();
                const newPassword = newPasswordInput.value.trim();
                const confirmPassword = confirmNewPasswordInput.value.trim();
                
                if (!currentPassword) {
                    showAlert('Please enter your current password', 'Password Required', '⚠️');
                    return;
                }
                
                if (!newPassword) {
                    showAlert('Please enter a new password', 'Password Required', '⚠️');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showAlert('New password must be at least 6 characters', 'Password Too Short', '⚠️');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    showAlert('New passwords do not match', 'Passwords Mismatch', '⚠️');
                    return;
                }
                
                try {
                    // Reauthenticate user
                    const credential = window.firebaseEmailAuthProvider.credential(
                        window.currentUser.email,
                        currentPassword
                    );
                    await window.firebaseReauthenticateWithCredential(window.currentUser, credential);
                    
                    // Update password
                    await window.firebaseUpdatePassword(window.currentUser, newPassword);
                    
                    passwordCurrentPassword.value = '';
                    newPasswordInput.value = '';
                    confirmNewPasswordInput.value = '';
                    
                    showAlert('Password changed successfully!', 'Success', '✅');
                } catch (error) {
                    console.error('Error changing password:', error);
                    if (error.code === 'auth/wrong-password') {
                        showAlert('Current password is incorrect', 'Error', '❌');
                    } else {
                        showAlert('Error changing password: ' + error.message, 'Error', '❌');
                    }
                }
            });
        }
        
        // Load profile data on page load
        loadProfileData();
    }

    // Build section flow: show choice menu -> category menu -> setup interface
    function setupBuildFlow() {
        /**
         * UI COMPONENT: Build Configuration Flow
         * 
         * User Journey:
         * 1. Choice Menu    - Select Load or Create
         * 2. Category Menu  - Select Kart or Tire setup
         * 3. Setup Interface - Configure adjustments
         * 
         * Supports saving/loading multiple configurations.
         */
        const choiceMenu = document.getElementById('build-choice-menu');
        const categoryMenu = document.getElementById('build-category-menu');
        const setupInterface = document.getElementById('build-setup-interface');
        const backBtn = document.getElementById('back-to-category');
        const categoryTitle = document.getElementById('build-category-title');
        let currentCategory = null;

        if (!choiceMenu || !categoryMenu || !setupInterface) return;

        // When a choice (load or create) is clicked
        choiceMenu.addEventListener('click', function (e) {
            const btn = e.target.closest('.choice-btn');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            
            if (action === 'load-saved-build') {
                // Show the Saved Builds section and display builds
                const savedBtn = document.querySelector('.side-btn[data-section="saved"]');
                if (savedBtn) savedBtn.click();
                displaySavedBuilds();
                return;
            } else if (action === 'create-new-build') {
                // Show the category selection menu
                choiceMenu.style.display = 'none';
                categoryMenu.style.display = 'flex';
            }
        });

        // When a category (kart or tire) is clicked
        categoryMenu.addEventListener('click', function (e) {
            const btn = e.target.closest('.choice-btn');
            if (!btn) return;
            const category = btn.getAttribute('data-category');
            currentCategory = category;
            
            // Update title
            if (categoryTitle) {
                categoryTitle.textContent = category === 'kart' ? 'Kart Adjustments' : 'Tire Adjustments';
            }
            
            // Show only tabs for the selected category
            const allTabs = document.querySelectorAll('.setup-tab');
            allTabs.forEach(tab => {
                const tabCategory = tab.getAttribute('data-category');
                if (tabCategory === category) {
                    tab.style.display = '';
                } else {
                    tab.style.display = 'none';
                }
            });
            
            // Show the setup interface
            categoryMenu.style.display = 'none';
            setupInterface.style.display = 'block';
            
            // Activate the first visible tab based on category
            if (category === 'kart') {
                const tab = document.querySelector('.setup-tab[data-setup="frontend"]');
                if (tab) tab.click();
            } else if (category === 'tire') {
                const tab = document.querySelector('.setup-tab[data-setup="tires"]');
                if (tab) tab.click();
            }
        });

        // Back button returns to category menu
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                setupInterface.style.display = 'none';
                categoryMenu.style.display = 'flex';
                // Reset all tabs to be visible for next time
                const allTabs = document.querySelectorAll('.setup-tab');
                allTabs.forEach(tab => {
                    tab.style.display = '';
                });
            });
        }
    }



    /**
     * ========================================================================
     * SECTION 6: BUILD MANAGEMENT SYSTEM
     * ========================================================================
     * 
     * Manages kart configuration saves and loads.
     * 
     * Functions:
     * - saveBuild()              : Save current configuration
     * - loadSavedBuilds()        : Fetch all saved builds from Firestore
     * - displaySavedBuilds()     : Display saved builds UI
     * - loadBuildData()          : Load specific build into form
     * - deleteBuild()            : Delete saved build
     * - deleteBuildAndRefresh()  : Delete and update UI
     * 
     * Data Structure (Firestore):
     * - Collection: "builds"
     *   - name: String
     *   - settings: Object (all configuration values)
     *   - userId: String
     *   - timestamp: String
     * 
     * ========================================================================
     */

    // Auth forms and tab switching on sign.html
    function setupAuthForms() {
        // Authentication is now handled by Firebase in sign.html
        // This function is kept for compatibility but does nothing
    }

    // Ensure app page is only accessible when signed in
    function guardAppPage() {
        // Firebase auth guard is now handled in app.html via onAuthStateChanged
        // This function is kept for compatibility but does nothing
    }

    // App page section switching
    function setupAppSections() {
        /**
         * UI COMPONENT: Section Navigation
         * 
         * Manages switching between main app sections:
         * - Home (instructions)
         * - Build (kart configuration)
         * - Track History (race tracking)
         * - Tire History (tire management)
         * - Saved Builds (configuration library)
         * 
         * Sections fade in/out with animations
         */
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
            
            // Scroll container to top when switching sections
            const appContainer = document.querySelector('.app-container');
            if (appContainer) appContainer.scrollTop = 0;

            // Reset Build section to show choice menu when navigating to it
            if (sectionName === 'build') {
                const buildChoiceMenu = document.getElementById('build-choice-menu');
                const buildCategoryMenu = document.getElementById('build-category-menu');
                const buildSetupInterface = document.getElementById('build-setup-interface');
                if (buildChoiceMenu && buildCategoryMenu && buildSetupInterface) {
                    buildChoiceMenu.style.display = '';
                    buildCategoryMenu.style.display = 'none';
                    buildSetupInterface.style.display = 'none';
                }
            }
            
            // Load track data when Track History is clicked
            if (sectionName === 'track-history') {
                // Trigger the track list rendering
                const renderTrackListEvent = new CustomEvent('loadTrackHistory');
                window.dispatchEvent(renderTrackListEvent);
            }
            
            // Load tire sets when Tire History is clicked
            if (sectionName === 'tire-history') {
                // Trigger the tire set list rendering
                const renderTireSetListEvent = new CustomEvent('loadTireHistory');
                window.dispatchEvent(renderTireSetListEvent);
            }
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
        /**
         * UI COMPONENT: Tab Navigation
         * 
         * Setup tabs control visibility of different configuration panels.
         * Examples: Frontend Suspension, Rear Suspension, Tires, etc.
         * 
         * Each tab toggles visibility of its corresponding panel.
         */
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
        /**
         * UI COMPONENT: Numeric Sliders
         * 
         * Updates display value when slider is adjusted.
         * Handles units: T, °, mm, kg, RPM, PSI, %
         * 
         * Improves UX by showing current value as user adjusts.
         */
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

    // Firebase Save/Load Build Functions
    function saveBuild() {
        /**
         * FIRESTORE OPERATION: Save Build Configuration
         * 
         * Collects all form input values and saves to Firestore.
         * Prompts user for build name before saving.
         * 
         * Data saved:
         * - name: User-provided build name
         * - timestamp: When saved (ISO string)
         * - userId: Owner's UID
         * - settings: All configuration values as object
         */
        if (!window.currentUser) {
            showAlert('Please log in to save builds.', 'Not Logged In', '⚠️');
            return;
        }
        
        // Collect all input values from the build forms
        showSaveBuildModal().then(name => {
            if (!name) return;
            const buildData = {
                name,
                timestamp: new Date().toISOString(),
                userId: window.currentUser.uid,
                settings: {}
            };
            // Collect all setup inputs
            const inputs = document.querySelectorAll('#build-setup-interface .setup-input');
            inputs.forEach(input => {
                const parentLi = input.closest('li');
                const label = parentLi ? parentLi.querySelector('strong')?.textContent : 'unknown';
                if (label && input.value) {
                    buildData.settings[label] = input.value;
                }
            });
            // Save to Firestore
            if (window.firebaseDb && window.firebaseAddDoc && window.firebaseCollection) {
                window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'builds'), buildData)
                    .then(() => {
                        showAlert('Build saved successfully!', 'Success', '✅');
                    })
                    .catch(error => {
                        console.error('Error saving build:', error);
                        showAlert('Error saving build. Check console for details.', 'Error', '❌');
                    });
            } else {
                showAlert('Firebase not initialized yet. Please wait a moment and try again.', 'Error', '❌');
            }
        });
    }

    async function loadSavedBuilds() {
        /**
         * FIRESTORE OPERATION: Query Saved Builds
         * 
         * Fetches all builds for current user from Firestore.
         * Uses WHERE clause to filter by userId for security.
         * 
         * Returns: Array of build objects
         */
        if (!window.currentUser) {
            showAlert('Please log in to view saved builds.', 'Not Logged In', '⚠️');
            return [];
        }
        
        if (!window.firebaseDb || !window.firebaseGetDocs || !window.firebaseCollection || !window.firebaseQuery || !window.firebaseWhere) {
            showAlert('Firebase not initialized yet.', 'Error', '❌');
            return [];
        }

        try {
            const q = window.firebaseQuery(
                window.firebaseCollection(window.firebaseDb, 'builds'),
                window.firebaseWhere('userId', '==', window.currentUser.uid)
            );
            const querySnapshot = await window.firebaseGetDocs(q);
            const builds = [];
            querySnapshot.forEach((doc) => {
                builds.push({ id: doc.id, ...doc.data() });
            });
            return builds;
        } catch (error) {
            console.error('Error loading builds:', error);
            showAlert('Error loading builds. Check console for details.', 'Error', '❌');
            return [];
        }
    }

    async function deleteBuild(buildId) {
        /**
         * FIRESTORE OPERATION: Delete Build
         * 
         * Removes build from Firestore database.
         * Shows success message to user.
         */
        if (!window.firebaseDb || !window.firebaseDeleteDoc || !window.firebaseDoc) {
            showAlert('Firebase not initialized yet.', 'Error', '❌');
            return;
        }

        try {
            await window.firebaseDeleteDoc(window.firebaseDoc(window.firebaseDb, 'builds', buildId));
            showAlert('Build deleted successfully!', 'Deleted', '🗑️');
        } catch (error) {
            console.error('Error deleting build:', error);
            showAlert('Error deleting build. Check console for details.', 'Error', '❌');
        }
    }

    // Display saved builds in the Saved Builds section
    async function displaySavedBuilds() {
        /**
         * UI COMPONENT: Saved Builds List
         * 
         * Queries and displays all saved builds with:
         * - Build name
         * - Save timestamp
         * - Number of settings configured
         * - Action buttons (Load, Delete)
         */
        const buildsListDiv = document.getElementById('saved-builds-list');
        if (!buildsListDiv) return;

        buildsListDiv.innerHTML = '<p>Loading builds...</p>';

        const builds = await loadSavedBuilds();
        
        if (!builds || builds.length === 0) {
            buildsListDiv.innerHTML = '<p>No saved builds yet. Create and save a build to see it here!</p>';
            const appContainer = document.querySelector('.app-container');
            if (appContainer) appContainer.scrollTop = 0;
            return;
        }

        buildsListDiv.innerHTML = '';
        builds.forEach(build => {
            const buildCard = document.createElement('div');
            buildCard.className = 'instruction-card';
            buildCard.style.textAlign = 'left';
            buildCard.innerHTML = `
                <h3>${build.name}</h3>
                <p style="font-size: 0.85rem; color: rgba(230,238,246,0.6);">
                    Saved: ${new Date(build.timestamp).toLocaleString()}
                </p>
                <p style="font-size: 0.9rem; margin-top: 8px;">
                    ${Object.keys(build.settings || {}).length} settings configured
                </p>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="btn" onclick="loadBuildData('${build.id}')" style="flex: 1;">📥 Load</button>
                    <button class="btn" onclick="deleteBuildAndRefresh('${build.id}')" style="flex: 1; background: rgba(255,51,51,0.2); border-color: rgba(255,51,51,0.3);">🗑️ Delete</button>
                </div>
            `;
            buildsListDiv.appendChild(buildCard);
        });
        
        // Reset scroll after all content is rendered
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.scrollTop = 0;
    }

    async function deleteBuildAndRefresh(buildId) {
        /**
         * Deletes build after user confirmation and refreshes display
         */
        showConfirm('Are you sure you want to delete this build?', 'Delete Build', '⚠️').then(async ok => {
            if (ok) {
                await deleteBuild(buildId);
                await displaySavedBuilds();
            }
        });
    }

    async function loadBuildData(buildId) {
        /**
         * Loads build configuration into form and displays setup interface
         * 
         * Process:
         * 1. Fetch build from Firestore
         * 2. Clear existing form values
         * 3. Populate form with saved settings
         * 4. Show setup interface
         * 5. Display success message
         */
        const builds = await loadSavedBuilds();
        const build = builds.find(b => b.id === buildId);
        
        if (!build) {
            showAlert('Build not found!', 'Not Found', '❌');
            return;
        }

        // Navigate to build section
        const buildBtn = document.querySelector('.side-btn[data-section="build"]');
        if (buildBtn) buildBtn.click();

        // Wait a moment for section to load
        setTimeout(() => {
            // Clear all form fields first
            const inputs = document.querySelectorAll('#build-setup-interface .setup-input');
            inputs.forEach(input => {
                input.value = '';
            });
            
            // Then populate with loaded build data
            inputs.forEach(input => {
                const parentLi = input.closest('li');
                const label = parentLi ? parentLi.querySelector('strong')?.textContent : '';
                if (label && build.settings[label]) {
                    input.value = build.settings[label];
                }
            });
            
            // Show category menu instead of choice menu
            const choiceMenu = document.getElementById('build-choice-menu');
            const categoryMenu = document.getElementById('build-category-menu');
            if (choiceMenu) choiceMenu.style.display = 'none';
            if (categoryMenu) categoryMenu.style.display = 'flex';
            
            showAlert(`Build "${build.name}" loaded successfully!`, 'Build Loaded', '✅');
        }, 100);
        // Make modal functions globally available if needed
        window.showAlert = showAlert;
        window.closeAlertModal = closeAlertModal;
        window.showPrompt = showPrompt;
        window.showConfirm = showConfirm;
        window.closeConfirmModal = closeConfirmModal;
        window.showSaveBuildModal = showSaveBuildModal;
        window.closeSaveBuildModal = closeSaveBuildModal;
    }

    /**
     * ========================================================================
     * SECTION 7: APP INITIALIZATION & EVENT SETUP
     * ========================================================================
     * 
     * Initializes all app features when DOM is ready.
     * This is the entry point that calls all setup functions.
     * 
     * Initialization Order:
     * 1. profileUI        - User menu and authentication
     * 2. authForms        - Sign in/up forms (sign.html only)
     * 3. buildFlow        - Build creation flow
     * 4. appSections      - Section navigation
     * 5. tabs             - Tab switching
     * 6. sliders          - Numeric sliders
     * 7. savedBuilds      - Saved builds display
     * 
     * ========================================================================
     */

    // Auto-refresh saved builds when navigating to that section
    function setupSavedBuildsSection() {
        const sideButtons = document.querySelectorAll('.side-btn[data-section]');
        sideButtons.forEach(btn => {
            if (btn.getAttribute('data-section') === 'saved') {
                btn.addEventListener('click', displaySavedBuilds);
            }
        });
    }

    // Make functions globally available
    window.saveBuild = saveBuild;
    window.loadSavedBuilds = loadSavedBuilds;
    window.deleteBuild = deleteBuild;
    window.deleteBuildAndRefresh = deleteBuildAndRefresh;
    window.loadBuildData = loadBuildData;

    /**
     * APP INITIALIZATION
     * 
     * Called when DOM is fully loaded.
     * Sets up all features and event listeners.
     */
    // Initialize behaviors
    setupProfileUI();
    setupAuthForms();
    guardAppPage();
    setupAppSections();
    setupTabs();
    setupBuildFlow();
    setupSliders();
    setupSavedBuildsSection();
});
