# Development Guide

Complete guide for developing and maintaining Racer Ready.

## Setup for Development

### Prerequisites
- Node.js v14+ ([nodejs.org](https://nodejs.org))
- Git ([git-scm.com](https://git-scm.com))
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Evan-Linder/RacerReady.git
cd RacerReady

# Install dependencies
npm install

# Start dev server
npm run dev
```

Server runs at `http://localhost:8000`

---

## Project Architecture

### File Structure

```
RacerReady/
├── index.html              # Landing page
├── sign.html               # Auth page with Firebase setup
├── app.html                # Main application
├── profile.html            # User profile page
├── script.js               # Main application logic (organized into modules)
├── style.css               # All styling
├── package.json            # Dependencies and scripts
├── .gitignore              # Git ignore rules
├── images/                 # Image assets
├── README.md               # User documentation
├── DEPLOYMENT.md           # Deployment instructions
└── DEVELOPMENT.md          # This file
```

### Code Organization in script.js

The script.js file is organized into logical sections:

1. **Authentication & Setup**
   - Firebase initialization
   - User authentication handlers
   - Profile menu setup

2. **Track Management**
   - `setupTrackHistory()` function
   - Track CRUD operations
   - Race day management

3. **Tire Management**
   - `setupTireHistory()` function
   - Tire set management
   - Tire tracking and chemical applications

4. **Build Management**
   - Build creation and saving
   - Build loading
   - Configuration management

5. **UI & Utilities**
   - Modal functions (alert, confirm, prompt)
   - Section switching
   - Tab navigation
   - Slider handling

---

## Key Functions

### Authentication

```javascript
// User signup
const credential = await createUserWithEmailAndPassword(auth, email, password);

// User signin
const credential = await signInWithEmailAndPassword(auth, email, password);

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.currentUser = user;
    }
});
```

### Track Operations

```javascript
// Create track
await firebaseAddDoc(
    firebaseCollection(firebaseDb, 'tracks'),
    { name, location, userId, timestamp }
);

// Query user tracks
const q = firebaseQuery(
    firebaseCollection(firebaseDb, 'tracks'),
    firebaseWhere('userId', '==', currentUser.uid)
);

// Update track
await firebaseUpdateDoc(
    firebaseDoc(firebaseDb, 'tracks', trackId),
    { name, location, notes }
);

// Delete track
await firebaseDeleteDoc(firebaseDoc(firebaseDb, 'tracks', trackId));
```

### Tire Operations

```javascript
// Create tire set
await firebaseAddDoc(
    firebaseCollection(firebaseDb, 'tireSets'),
    { setName, brand, model, quantity, userId, timestamp }
);

// Add tire to set
await firebaseAddDoc(
    firebaseCollection(firebaseDb, 'tires'),
    { tireName, setId, userId, timestamp }
);

// Log tire event (chemical application)
await firebaseAddDoc(
    firebaseCollection(firebaseDb, 'tireEvents'),
    { 
        tireId, 
        outerChemical, 
        innerChemical, 
        description,
        userId,
        timestamp 
    }
);
```

### Build Operations

```javascript
// Save build
await firebaseAddDoc(
    firebaseCollection(firebaseDb, 'builds'),
    { name, settings, userId, timestamp }
);

// Load builds
const q = firebaseQuery(
    firebaseCollection(firebaseDb, 'builds'),
    firebaseWhere('userId', '==', currentUser.uid)
);

// Delete build
await firebaseDeleteDoc(firebaseDoc(firebaseDb, 'builds', buildId));
```

---

## Common Tasks

### Adding a New Feature

1. **Plan the feature**
   - Define what data is needed
   - Plan UI components
   - Design database schema

2. **Create HTML structure** in app.html
   ```html
   <div data-section-content="new-feature">
       <!-- Your HTML here -->
   </div>
   ```

3. **Add styling** in style.css
   ```css
   [data-section-content="new-feature"] {
       /* Your styles */
   }
   ```

4. **Add JavaScript logic** in script.js
   ```javascript
   function setupNewFeature() {
       // Your initialization code
   }
   setupNewFeature();
   ```

5. **Add button** to side panel
   ```html
   <button class="side-btn" data-section="new-feature">New Feature</button>
   ```

### Modifying Database Operations

1. **Define data structure** in Firestore
   ```
   collection/
     └── docId/
         ├── field1: String
         ├── field2: Number
         └── userId: String (for permission)
   ```

2. **Implement in code**
   ```javascript
   // Create
   await firebaseAddDoc(collection, data);
   
   // Read
   const q = firebaseQuery(collection, firebaseWhere(...));
   
   // Update
   await firebaseUpdateDoc(docRef, newData);
   
   // Delete
   await firebaseDeleteDoc(docRef);
   ```

3. **Add security rules** to Firebase Console

### Adding UI Modals

```javascript
function showCustomModal(message, title = 'Alert', icon = 'ℹ️') {
    return new Promise(resolve => {
        const modal = document.getElementById('your-modal');
        const titleEl = modal.querySelector('.modal-title');
        
        titleEl.textContent = `${icon} ${title}`;
        modal.style.display = 'flex';
        
        modal.querySelector('.confirm-btn').onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };
    });
}
```

### Adding Form Validation

```javascript
function validateInput(value, rules) {
    if (rules.required && !value.trim()) {
        return 'This field is required';
    }
    if (rules.minLength && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength}`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
    }
    return null; // Valid
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Create new account
- [ ] Sign in/out
- [ ] Edit profile
- [ ] Create track
- [ ] Add race day to track
- [ ] Create tire set
- [ ] Add tire to set
- [ ] Log chemical application
- [ ] Create and save build
- [ ] Load saved build
- [ ] Delete records
- [ ] Test on mobile

### Browser Testing

Test on:
- Chrome (Windows)
- Firefox (Windows)
- Safari (if available)
- Mobile browser

Use DevTools to test:
- Responsive design (Device toolbar)
- Console errors
- Network tab
- Performance

### Firebase Testing

1. **Use Firebase Emulator** (for local development)
   ```bash
   firebase emulators:start
   ```

2. **Monitor in Firebase Console**
   - Check Firestore data
   - Monitor authentication
   - View errors and warnings

---

## Debugging

### Console Logging

```javascript
// Add strategic logs
console.log('Track data:', trackData);
console.error('Error:', error);
console.warn('Warning:', warningMessage);

// Structured logging
console.table(arrayOfData);
console.group('Group Name');
console.log('Item 1');
console.log('Item 2');
console.groupEnd();
```

### DevTools Usage

1. **Open DevTools** - F12 or Cmd+Option+I
2. **Console tab** - View logs and errors
3. **Network tab** - Monitor API calls
4. **Application tab** - Check localStorage
5. **Elements tab** - Inspect HTML

### Firebase Debugging

```javascript
// Enable Firebase logging
firebase.database.enableLogging(true);

// Check auth state
console.log(firebase.auth().currentUser);

// Monitor Firestore
firebase.firestore().enablePersistence();
```

---

## Performance Tips

### Code Optimization

1. **Lazy load components**
   - Load sections only when needed
   - Use event delegation

2. **Minimize DOM queries**
   ```javascript
   // Bad
   for (let i = 0; i < 100; i++) {
       document.getElementById('item').innerHTML += i;
   }
   
   // Good
   const item = document.getElementById('item');
   let html = '';
   for (let i = 0; i < 100; i++) {
       html += i;
   }
   item.innerHTML = html;
   ```

3. **Use event delegation**
   ```javascript
   // Instead of attaching to each item
   container.addEventListener('click', (e) => {
       const item = e.target.closest('.item');
       if (item) { /* handle */ }
   });
   ```

### Firebase Optimization

1. **Use indexes** - Add composite indexes in Firebase Console
2. **Batch operations** - Use batch writes for multiple documents
3. **Cache data** - Store in memory to avoid repeated queries
4. **Pagination** - Load data in chunks, not all at once

---

## Version Control

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add feature: description"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
# After review and approval:
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
```

### Commit Message Format

```
type: description

- Detail 1
- Detail 2

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Common Issues & Solutions

### Firebase Connection Issues

**Problem:** "Firebase not initialized"
```javascript
// Solution: Wait for Firebase to load
if (!window.firebaseDb) {
    setTimeout(() => { /* retry */ }, 1000);
}
```

### CORS Errors

**Problem:** "Cross-Origin Request Blocked"
```javascript
// Firebase usually handles this
// If using custom API, add CORS headers
response.headers['Access-Control-Allow-Origin'] = '*';
```

### Data Not Persisting

**Problem:** Data disappears after refresh
```javascript
// Solution: Check Firestore security rules
// Verify user is authenticated
// Check console for Firebase errors
```

### Performance Issues

**Problem:** App is slow
```javascript
// Solutions:
// 1. Check Network tab for slow requests
// 2. Optimize database queries with indexes
// 3. Reduce DOM manipulations
// 4. Use debouncing for input handlers
```

---

## Resources

### Documentation
- [Firebase Docs](https://firebase.google.com/docs)
- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Tricks](https://css-tricks.com)

### Tools
- [VS Code](https://code.visualstudio.com) - Editor
- [Firebase Console](https://console.firebase.google.com) - Backend
- [DevTools](https://developer.chrome.com/docs/devtools) - Debugging
- [Postman](https://www.postman.com) - API Testing

### Learning
- MDN Web Docs
- Firebase YouTube Channel
- Dev.to Community Articles
- Stack Overflow

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with clear commits
4. Push to your fork
5. Create Pull Request
6. Wait for review and approval
7. Merge to main

---

**Happy coding! 🚀**
