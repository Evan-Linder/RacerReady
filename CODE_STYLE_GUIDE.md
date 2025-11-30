# Code Style Guide

Coding standards and best practices for Racer Ready development.

## JavaScript Style Guide

### Naming Conventions

```javascript
// Functions: camelCase, descriptive verb-noun
function setupTrackHistory() {}
function renderTrackList() {}
function addTrack() {}
async function loadUserData() {}

// Variables: camelCase, clear purpose
const currentUser = user;
let isLoading = false;
const trackList = [];

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DB_COLLECTION_NAMES = {
    TRACKS: 'tracks',
    DAYS: 'days',
    TIRES: 'tires'
};

// Classes: PascalCase
class TrackManager {}
class TireManager {}

// Private functions: Prefix with underscore
function _sanitizeInput(input) {}
function _validateEmail(email) {}
```

### Code Organization

```javascript
/**
 * Section Header
 * =====================================================
 * 
 * Describe what this section does.
 * List main functions/responsibilities.
 */

// Individual function comments
function setupTrackHistory() {
    /**
     * Initialize track management system
     * 
     * @returns {void}
     */
}
```

### Comments

```javascript
// ✅ GOOD: Clear, specific comment
// Query only current user's tracks to optimize performance
const q = firebaseQuery(
    firebaseCollection(firebaseDb, 'tracks'),
    firebaseWhere('userId', '==', currentUser.uid)
);

// ❌ BAD: Vague comment
// Get tracks
const q = firebaseQuery(collection, where);

// ✅ GOOD: Document complex logic
// Sort by timestamp descending (most recent first)
days.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

// ✅ GOOD: Explain why, not what
// Limit to 5MB to prevent storage quota issues
if (file.size > 5 * 1024 * 1024) {
    showAlert('Max file size is 5MB', 'File Too Large', '⚠️');
}
```

### Error Handling

```javascript
// ✅ GOOD: Comprehensive error handling
try {
    const result = await firebaseAddDoc(collection, data);
    showAlert('Success!', 'Saved', '✅');
} catch (error) {
    console.error('Error saving data:', error);
    if (error.code === 'permission-denied') {
        showAlert('You do not have permission', 'Error', '❌');
    } else {
        showAlert('Error saving data', 'Error', '❌');
    }
}

// ❌ BAD: Silent failure
try {
    await firebaseAddDoc(collection, data);
} catch (error) {
    // ignore
}

// ✅ GOOD: User-friendly error messages
if (!email.includes('@')) {
    showAlert('Please enter a valid email', 'Invalid Email', '⚠️');
    return;
}

// ❌ BAD: Technical jargon
if (!validateEmail(email)) {
    showAlert('Invalid input: email regex failed', 'Error', '❌');
}
```

### Async/Await

```javascript
// ✅ GOOD: Clear async operations
async function loadTrackData(trackId) {
    try {
        const trackDoc = await firebaseGetDoc(
            firebaseDoc(firebaseDb, 'tracks', trackId)
        );
        
        if (!trackDoc.exists()) {
            showAlert('Track not found', 'Error', '❌');
            return null;
        }
        
        return { id: trackDoc.id, ...trackDoc.data() };
    } catch (error) {
        console.error('Error loading track:', error);
        showAlert('Failed to load track', 'Error', '❌');
    }
}

// ❌ BAD: Mixing promises and async/await
function loadTrackData(trackId) {
    return firebaseGetDoc(...)
        .then(doc => {
            if (!doc.exists()) return null;
            return { id: doc.id, ...doc.data() };
        })
        .catch(error => {
            // error handling
        });
}
```

### Event Listeners

```javascript
// ✅ GOOD: Use event delegation for dynamic content
const container = document.getElementById('items-list');
container.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    
    if (action === 'edit') {
        await editItem(id);
    } else if (action === 'delete') {
        await deleteItem(id);
    }
});

// ❌ BAD: Individual listeners on dynamic elements
items.forEach(item => {
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => deleteItem(item.id));
});

// ✅ GOOD: Cache frequently accessed DOM elements
const form = document.getElementById('track-form');
const nameInput = form.querySelector('input[name="name"]');
const locationInput = form.querySelector('input[name="location"]');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTrack(nameInput.value, locationInput.value);
});

// ❌ BAD: Repeated DOM queries
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.querySelector('#track-form input[name="name"]').value;
    const location = document.querySelector('#track-form input[name="location"]').value;
});
```

### DOM Manipulation

```javascript
// ✅ GOOD: Build HTML string first, then update DOM
let html = '';
tracks.forEach(track => {
    html += `
        <div class="track-card">
            <h3>${track.name}</h3>
            <p>${track.location}</p>
        </div>
    `;
});
container.innerHTML = html;

// ❌ BAD: Multiple DOM updates in loop
tracks.forEach(track => {
    const div = document.createElement('div');
    div.className = 'track-card';
    div.innerHTML = `<h3>${track.name}</h3>`;
    container.appendChild(div);
});

// ✅ GOOD: Use data attributes for element identification
<button data-action="delete" data-id="123">Delete</button>
<button data-section="tracks">Track History</button>

// ❌ BAD: Unclear class names or IDs
<button class="btn1" id="button_delete">Delete</button>
```

## HTML Style Guide

### Structure

```html
<!-- ✅ GOOD: Semantic HTML, clear nesting -->
<section data-section-content="tracks" class="app-section">
    <h2>Track History</h2>
    <div id="track-list" class="track-container">
        <!-- Content rendered by JS -->
    </div>
</section>

<!-- ❌ BAD: Divs everywhere, unclear structure -->
<div class="content">
    <div>Track History</div>
    <div id="list1">
        <!-- Content -->
    </div>
</div>
```

### Attributes

```html
<!-- ✅ GOOD: Descriptive data attributes -->
<button 
    class="btn danger"
    data-section="tracks"
    data-action="delete"
    data-id="track-123"
    aria-label="Delete track"
>
    Delete
</button>

<!-- ❌ BAD: Unclear attributes -->
<button class="btn1" onclick="delete(id)">Delete</button>
```

### Forms

```html
<!-- ✅ GOOD: Accessible form with labels -->
<form id="track-form">
    <label for="track-name">Track Name</label>
    <input 
        id="track-name"
        name="name"
        type="text"
        placeholder="Enter track name"
        required
    />
    
    <label for="track-location">Location</label>
    <input 
        id="track-location"
        name="location"
        type="text"
        placeholder="Enter location"
    />
    
    <button type="submit" class="btn primary">Save</button>
</form>
```

## CSS Style Guide

### Class Naming

```css
/* ✅ GOOD: BEM-like naming */
.track-card { }
.track-card__title { }
.track-card--active { }

.btn { }
.btn--primary { }
.btn--danger { }

.modal { }
.modal__header { }
.modal__body { }
.modal__footer { }

/* ❌ BAD: Unclear names */
.t1 { }
.red-btn { }
.bigbox { }
```

### Organization

```css
/* ✅ GOOD: Grouped by component */

/* Track Cards */
.track-card {
    padding: 20px;
    border-radius: 8px;
}

.track-card__title {
    font-size: 1.2rem;
    color: #ff3333;
}

/* Buttons */
.btn {
    padding: 10px 16px;
    border-radius: 6px;
}

.btn--primary {
    background: #ff3333;
    color: white;
}

/* ❌ BAD: Random order */
.padding { padding: 20px; }
.red { color: red; }
.track { font-size: 1.2rem; }
.track-title { color: #ff3333; }
```

### Variables

```css
/* ✅ GOOD: CSS variables for theming */
:root {
    --accent: #ff3333;
    --accent-dark: #cc0000;
    --text: #e6eef6;
    --text-muted: rgba(230,238,246,0.6);
    --spacing-base: 16px;
    --border-radius: 8px;
    --transition: all 0.3s ease;
}

.track-card {
    background: var(--text);
    border-radius: var(--border-radius);
    padding: var(--spacing-base);
    transition: var(--transition);
}
```

## Firebase Best Practices

```javascript
// ✅ GOOD: Efficient queries with WHERE clauses
const q = firebaseQuery(
    firebaseCollection(firebaseDb, 'tracks'),
    firebaseWhere('userId', '==', currentUser.uid),
    firebaseWhere('archived', '==', false)
);

// ❌ BAD: Fetch all data then filter in code
const q = firebaseQuery(
    firebaseCollection(firebaseDb, 'tracks')
);
// Then filter in code: data.filter(t => t.userId === uid)

// ✅ GOOD: Batch operations
const batch = firebaseWriteBatch(firebaseDb);
batch.set(doc1, data1);
batch.set(doc2, data2);
await batch.commit();

// ❌ BAD: Multiple individual writes
await firebaseAddDoc(collection, data1);
await firebaseAddDoc(collection, data2);

// ✅ GOOD: Security rules to protect data
// In Firebase Console:
match /tracks/{trackId} {
    allow read, write: if request.auth.uid == resource.data.userId;
}
```

## Testing Checklist

- [ ] Test on multiple browsers
- [ ] Test mobile responsiveness
- [ ] Test with slow internet
- [ ] Test error scenarios
- [ ] Test with empty data
- [ ] Verify console has no errors
- [ ] Check accessibility (keyboard navigation)

## Code Review Checklist

- [ ] Follows naming conventions
- [ ] Has appropriate comments
- [ ] Error handling in place
- [ ] No console.log() left in production code
- [ ] No hardcoded values (use constants)
- [ ] Performance optimized (no N+1 queries)
- [ ] Accessible (aria-labels, semantic HTML)
- [ ] Mobile responsive
- [ ] Security best practices followed

---

**Remember: Code is read more often than it's written.**
Make it clear, maintainable, and well-documented.
