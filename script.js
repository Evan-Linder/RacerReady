        // Logout Function
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



        // --- Track History Logic ---
        function setupTrackHistory() {
            const addTrackBtn = document.getElementById('add-track-btn');
            const trackListDiv = document.getElementById('track-list');
            const addTrackModal = document.getElementById('add-track-modal');
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

            function openAddTrackModal() {
                if (addTrackModal) addTrackModal.style.display = 'flex';
                if (trackNameInput) trackNameInput.value = '';
                if (trackLocationInput) trackLocationInput.value = '';
                if (trackListDiv) trackListDiv.style.display = 'none';
            }
            window.closeAddTrackModal = function() {
                if (addTrackModal) addTrackModal.style.display = 'none';
                if (trackListDiv) trackListDiv.style.display = 'block';
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
                    await renderTrackList();
                    window.closeAddTrackModal();
                } else {
                    showAlert('Database not available.', 'Error', '❌');
                }
            }

            if (addTrackBtn) addTrackBtn.addEventListener('click', openAddTrackModal);
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
                const trackDetailsTitle = document.getElementById('track-details-title');
                if (trackHistorySection) trackHistorySection.classList.remove('active');
                if (trackDetailsSection) {
                    trackDetailsSection.classList.add('active');
                    trackDetailsSection.style.display = 'block';
                }
                if (trackDetailsTitle) trackDetailsTitle.textContent = track.name;
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
                    if (trackDetailsSection) {
                        trackDetailsSection.classList.remove('active');
                        trackDetailsSection.style.display = 'none';
                    }
                    if (dayEntrySection) {
                        dayEntrySection.classList.add('active');
                        dayEntrySection.style.display = 'block';
                    }
                    if (dayEntryTitle && window.currentTrack) {
                        dayEntryTitle.textContent = `Day Entry - ${window.currentTrack.name}`;
                    }
                });
            }

            const backToTrackDetailsBtn = document.getElementById('back-to-track-details');
            if (backToTrackDetailsBtn) {
                backToTrackDetailsBtn.addEventListener('click', function() {
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
                });
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
                        windConditions: document.getElementById('wind-conditions')?.value || ''
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
                            
                            showAlert('Day entry saved successfully!', 'Success', '✅');
                        } catch (error) {
                            console.error('Error saving day:', error);
                            showAlert('Error saving day entry.', 'Error', '❌');
                        }
                    } else {
                        showAlert('Database not available.', 'Error', '❌');
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
document.addEventListener('DOMContentLoaded', function () {
    const isSignedIn = () => {
        // Firebase auth is now handled in app.html/sign.html
        return window.currentUser !== null && window.currentUser !== undefined;
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
    }

    // Build section flow: show choice menu -> category menu -> setup interface
    function setupBuildFlow() {
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

    // Firebase Save/Load Build Functions
    function saveBuild() {
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
        const buildsListDiv = document.getElementById('saved-builds-list');
        if (!buildsListDiv) return;

        buildsListDiv.innerHTML = '<p>Loading builds...</p>';

        const builds = await loadSavedBuilds();
        
        if (!builds || builds.length === 0) {
            buildsListDiv.innerHTML = '<p>No saved builds yet. Create and save a build to see it here!</p>';
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
    }

    async function deleteBuildAndRefresh(buildId) {
        showConfirm('Are you sure you want to delete this build?', 'Delete Build', '⚠️').then(async ok => {
            if (ok) {
                await deleteBuild(buildId);
                await displaySavedBuilds();
            }
        });
    }

    async function loadBuildData(buildId) {
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
