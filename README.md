# Racer Ready 🏁

The ultimate go-kart management platform for racers who demand precision, performance, and results.

**Live Site:** [racer-ready.vercel.app](https://racer-ready.vercel.app)

## Features

✅ **Track Your Performance** - Monitor your kart's performance with precision across multiple tracks and race days  
✅ **Tire Management** - Track tire conditions, chemical applications, and maintenance history  
✅ **Build Configuration** - Save and manage multiple kart setup configurations  
✅ **Points Tracking** - Monitor race points and standings  
✅ **User Profiles** - Manage your racing profile with team information and kart details  
✅ **Real-time Database** - All data synced with Firebase Firestore

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore Database, Storage)
- **Hosting**: Compatible with Vercel, Netlify, Firebase Hosting

## Project Structure

```
RacerReady/
├── index.html              # Landing page
├── sign.html               # Authentication page
├── app.html                # Main application
├── profile.html            # User profile
├── script.js               # Main JavaScript (organized into modules)
├── style.css               # Styling
├── package.json            # Project dependencies
├── README.md               # This file
├── .gitignore              # Git ignore rules
├── DEPLOYMENT.md           # Deployment instructions
├── DEVELOPMENT.md          # Development guide
└── images/                 # Image assets
    ├── logo.png
    ├── tires.jpg
    └── ...
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher) - For local development server
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Evan-Linder/RacerReady.git
   cd RacerReady
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8000`

### Configuration

#### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase config
5. The config is already embedded in `sign.html` - update the `firebaseConfig` object with your credentials

**⚠️ Security Note:** The Firebase config is currently in the sign.html file. For production, consider using environment variables with a build process.

## Core Modules

### Authentication (`auth` module)
Handles user sign-in, sign-up, and session management using Firebase Auth.

### Track Management (`tracks` module)
Manages track entries, race day records, and performance history.

### Tire Management (`tires` module)
Tracks individual tires, tire sets, and chemical applications.

### Build Management (`builds` module)
Saves and loads kart configurations.

### Profile Management (`profile` module)
Manages user profile information and settings.

## Usage

### For Racers

1. **Create Account** - Sign up with your email
2. **Set Up Profile** - Add your racing info, team, and kart number
3. **Add Tracks** - Create track entries for your racing venues
4. **Log Race Days** - Record track conditions and performance for each race day
5. **Manage Tires** - Track your tire sets and chemical treatments
6. **Build Configs** - Save winning kart setups and load them for future races

### For Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guide.

## Deployment

### Quick Deploy (Recommended)

Choose your platform:

**Vercel** (Recommended - Easiest)
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy
```

**Firebase Hosting**
```bash
npm install -g firebase-tools
firebase deploy
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Code Organization

The codebase is organized into logical modules for maintainability:

### `js/`
- `auth.js` - Authentication logic
- `firebase.js` - Firebase initialization and utilities
- `tracks.js` - Track and race day management
- `tires.js` - Tire set and tire management
- `builds.js` - Kart build configuration management
- `profile.js` - User profile management
- `ui.js` - UI component utilities and modals
- `app.js` - Main app initialization

### `styles/`
- `main.css` - Main stylesheet
- `components.css` - Component-specific styles
- `responsive.css` - Responsive design rules

## API Documentation

### Firestore Collections

#### Users
```
users/
  └── {userId}
      ├── displayName: String
      ├── dob: String (ISO date)
      ├── racingTeam: String
      ├── kartNumber: String
      ├── racingClass: String
      └── profilePicture: String (base64)
```

#### Tracks
```
tracks/
  └── {trackId}
      ├── name: String
      ├── location: String
      ├── notes: String
      ├── userId: String
      └── timestamp: Number
```

#### Days (Race Days)
```
days/
  └── {dayId}
      ├── trackId: String
      ├── raceName: String
      ├── surfaceCondition: String
      ├── pointsEarned: Number
      └── userId: String
```

#### Tire Sets
```
tireSets/
  └── {setId}
      ├── setName: String
      ├── brand: String
      ├── model: String
      ├── quantity: Number (1-4)
      ├── userId: String
      └── timestamp: Number
```

#### Tires
```
tires/
  └── {tireId}
      ├── tireName: String
      ├── setId: String
      ├── userId: String
      └── timestamp: Number
```

#### Tire Events
```
tireEvents/
  └── {eventId}
      ├── tireId: String
      ├── outerChemical: String
      ├── innerChemical: String
      ├── description: String
      ├── userId: String
      └── timestamp: Number
```

#### Builds
```
builds/
  └── {buildId}
      ├── name: String
      ├── settings: Object
      ├── userId: String
      └── timestamp: String
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- Never commit `.env` files or Firebase config files with real credentials
- Always use HTTPS in production
- Implement Firebase security rules for Firestore
- Keep dependencies up to date
- Use environment variables for sensitive configuration

### Firebase Security Rules

Example Firestore rules (add to Firebase Console):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /tracks/{trackId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /days/{dayId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /tireSets/{setId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /tires/{tireId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /tireEvents/{eventId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    match /builds/{buildId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Performance Optimization

- Lazy load images
- Minify CSS and JavaScript for production
- Use Firebase Hosting CDN for fast delivery
- Enable compression on your hosting platform

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and charts
- [ ] Social features (leaderboards)
- [ ] Integration with race timing systems
- [ ] Offline support with sync
- [ ] Dark mode (already implemented in UI)

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests:
1. Check existing [GitHub Issues](https://github.com/Evan-Linder/RacerReady/issues)
2. Create a new issue with detailed description
3. Contact the development team

## Changelog

### v1.0.0 (Current)
- Initial release
- Full track management system
- Tire tracking and chemical application logging
- Kart build configuration save/load
- User profile management
- Points tracking system

---

**Made with ❤️ for racers everywhere** 🏁
