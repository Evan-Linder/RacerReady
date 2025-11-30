# Project Summary & Quick Start

Complete overview of Racer Ready and how to get started.

## What is Racer Ready?

Racer Ready is a comprehensive web application for go-kart racers to:
- Track race day performance and conditions
- Manage tire sets and chemical treatments  
- Save and load kart configurations
- Build user profiles with racing information
- Monitor points and standings

## Key Features ✨

🏁 **Track Management** - Record track conditions, weather, and race results  
🛞 **Tire Tracking** - Log tire sets, treatments, and performance history  
⚙️ **Build Configs** - Save winning kart setups and replicate them  
👤 **User Profiles** - Manage racing profile with team info  
📊 **Points System** - Track earned points across races  
📱 **Responsive** - Works on desktop, tablet, and mobile  

## Tech Stack 🛠️

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Vercel, Netlify, or Firebase Hosting
- **Deployment**: GitHub Actions, Git

## Project Structure 📁

```
RacerReady/
├── index.html                    # Landing page
├── sign.html                     # Authentication
├── app.html                      # Main application
├── profile.html                  # User profile
├── script.js                     # Application logic (organized)
├── style.css                     # Styling
├── package.json                  # Dependencies
├── .gitignore                    # Git rules
├── .env.example                  # Environment template
├── README.md                     # User documentation
├── DEVELOPMENT.md                # Developer guide
├── DEPLOYMENT.md                 # Deployment instructions
├── CODE_STYLE_GUIDE.md          # Coding standards
├── firebase-config-template.js   # Firebase config template
├── vercel.json                   # Vercel deployment config
├── netlify.toml                  # Netlify deployment config
├── firebase.json                 # Firebase config
└── images/                       # Image assets
```

## Quick Start (5 minutes) 🚀

### 1. Clone Repository
```bash
git clone https://github.com/Evan-Linder/RacerReady.git
cd RacerReady
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs at `http://localhost:8000`

### 4. Test Features
- Create account at `http://localhost:8000/sign.html`
- Explore the app at `http://localhost:8000/app.html`
- Visit profile page at `http://localhost:8000/profile.html`

## File Organization Guide 📚

### Core Application Files

**index.html** - Landing page with features overview
- Marketing content
- Call-to-action buttons
- Feature descriptions

**sign.html** - Authentication page
- Sign in form
- Create account form
- Firebase Auth initialization

**app.html** - Main application interface
- Left navigation sidebar
- App sections (Build, Tracks, Tires, Saves)
- Main content area

**profile.html** - User profile management
- View mode: Display user info
- Edit mode: Update profile, change email/password
- Profile picture upload

**script.js** - Main application logic (2900+ lines)

Organized into 7 sections:
1. Authentication & Initialization
2. Track Management System
3. Tire Management System
4. UI Utilities & Modals
5. Profile Management
6. Build Management
7. App Navigation & Initialization

Each section has:
- Clear section header with description
- Function comments explaining purpose
- Organized helper functions
- Error handling throughout

**style.css** - All styling (950+ lines)
- Theme variables
- Component styles
- Responsive design
- Animation and transitions
- Dark theme with red accent

### Configuration Files

**.env.example** - Template for environment variables
Copy to `.env.local` and fill in your Firebase credentials

**firebase-config-template.js** - Firebase configuration template

**package.json** - Project dependencies
```json
{
  "scripts": {
    "dev": "npx http-server",
    "build": "echo 'Build complete'",
    "start": "npx http-server"
  }
}
```

**vercel.json** - Vercel deployment configuration

**netlify.toml** - Netlify deployment configuration

**firebase.json** - Firebase deployment configuration

**.gitignore** - Files to ignore from version control
- .env files (secrets)
- node_modules/
- Firebase config files
- IDE files
- OS files

### Documentation Files

**README.md** - User-facing documentation
- Features overview
- Installation instructions
- Usage guide
- API documentation
- Contributing guidelines

**DEVELOPMENT.md** - Developer guide
- Setup instructions
- Architecture overview
- Common tasks
- Debugging tips
- Troubleshooting

**DEPLOYMENT.md** - Deployment guide
- 5 deployment options (Vercel, Netlify, Firebase, GitHub Pages, Traditional)
- Pre-deployment checklist
- Post-deployment steps
- Performance optimization
- Troubleshooting

**CODE_STYLE_GUIDE.md** - Coding standards
- Naming conventions
- Code organization
- Comments and documentation
- Error handling
- Best practices

## Code Organization in script.js 📝

### Section 1: Authentication & Logout
- User logout handler
- Profile menu setup
- Authentication state checks

### Section 2: Track Management
```javascript
setupTrackHistory() {
    renderTrackList()      // Display all tracks
    addTrack()             // Create new track
    renderDayList()        // Display race days
    viewDay()              // View day details
    editDay()              // Edit day entry
    renderPointsStandings()// Display points
}
```

### Section 3: Tire Management
```javascript
setupTireHistory() {
    renderTireSetList()    // Display tire sets
    addTireSet()           // Create tire set
    renderTiresList()      // Display tires in set
    addTire()              // Add individual tire
    renderTireEvents()     // Display applications
    addEvent()             // Log chemical treatment
}
```

### Section 4: UI Utilities
- showAlert()
- showConfirm()
- showPrompt()
- showSaveBuildModal()
- Modal closing functions

### Section 5: Profile Management
- setupProfilePage()
- loadProfileData()
- Edit mode toggle
- Email/password change

### Section 6: Build Management
- saveBuild()
- loadSavedBuilds()
- displaySavedBuilds()
- loadBuildData()
- deleteBuild()

### Section 7: Navigation & App Setup
- setupAppSections()
- setupTabs()
- setupSliders()
- setupBuildFlow()
- Initialization

## Database Schema 🗄️

### Firestore Collections

**users/**
- displayName
- dob
- racingTeam
- kartNumber
- racingClass
- profilePicture

**tracks/**
- name
- location
- notes
- userId
- timestamp

**days/**
- trackId
- raceName
- pointsEarned
- surfaceCondition
- airTemperature
- userId
- timestamp

**tireSets/**
- setName
- brand
- model
- quantity
- userId
- timestamp

**tires/**
- tireName
- setId
- userId
- timestamp

**tireEvents/**
- tireId
- outerChemical
- innerChemical
- description
- userId
- timestamp

**builds/**
- name
- settings (object)
- userId
- timestamp

## Deployment Options 🌐

### Option 1: Vercel (Recommended)
- Easiest setup
- Free tier
- Automatic deployments
- [See DEPLOYMENT.md](./DEPLOYMENT.md)

### Option 2: Netlify
- Good for static sites
- Preview URLs
- [See DEPLOYMENT.md](./DEPLOYMENT.md)

### Option 3: Firebase Hosting
- Same backend as your app
- Global CDN
- [See DEPLOYMENT.md](./DEPLOYMENT.md)

### Option 4: GitHub Pages
- Completely free
- Good for demos
- [See DEPLOYMENT.md](./DEPLOYMENT.md)

### Option 5: Traditional Hosting
- cPanel, Bluehost, etc.
- More control
- [See DEPLOYMENT.md](./DEPLOYMENT.md)

## Development Workflow 🔄

### Start Work
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Edit files, add functionality
```

### Save Progress
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add ability to log tire pressure"

# Push to GitHub
git push origin feature/my-feature
```

### Deploy
```bash
# Option 1: Vercel
vercel

# Option 2: Netlify
netlify deploy

# Option 3: Firebase
firebase deploy
```

## Common Tasks 🎯

### Add New Feature
1. Create HTML in app.html
2. Add CSS styling
3. Add JavaScript logic in script.js
4. Add corresponding button to sidebar
5. Test thoroughly

### Modify Database
1. Design new Firestore collection/fields
2. Update security rules in Firebase Console
3. Add/update Firestore operations in script.js
4. Update API documentation

### Fix Bug
1. Reproduce bug locally
2. Add console.log() to debug
3. Fix the issue
4. Test across browsers
5. Commit with "fix:" message

### Deploy to Production
1. Run through pre-deployment checklist
2. Push code to main branch
3. Automatic deployment starts
4. Verify live site works
5. Monitor for errors

## Testing Checklist ✓

- [ ] All features work locally
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Works on different browsers
- [ ] Fast page load
- [ ] All forms validate
- [ ] All errors handled
- [ ] Security rules in place
- [ ] Database operations optimized

## Troubleshooting 🔧

**Can't sign in?**
- Check Firebase credentials in sign.html
- Verify authentication enabled in Firebase Console

**Data not saving?**
- Check Firebase security rules
- Verify Firestore connection in browser console
- Check network tab for failed requests

**App is slow?**
- Check Network tab for slow requests
- Optimize Firestore queries with indexes
- Compress images
- Enable caching

**Deployment failing?**
- Check file structure is correct
- Verify all files committed to git
- Check for syntax errors
- Review deployment platform logs

## Resources 📖

- [Firebase Documentation](https://firebase.google.com/docs)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Tricks](https://css-tricks.com)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

## Support & Contributions 🤝

- Report bugs: GitHub Issues
- Request features: GitHub Discussions
- Contribute: Create pull requests
- Questions: Check DEVELOPMENT.md

## License 📄

MIT License - See LICENSE file for details

---

## Next Steps 🎬

1. **Read** - Start with [README.md](./README.md)
2. **Setup** - Follow [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Code** - Review [CODE_STYLE_GUIDE.md](./CODE_STYLE_GUIDE.md)
4. **Deploy** - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

**Ready to race? 🏁 Let's go!**
