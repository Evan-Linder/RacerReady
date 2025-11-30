# Deployment Guide

This guide covers deploying Racer Ready to production environments.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Free tier with good limits
- Automatic deployments from GitHub
- Built-in HTTPS and CDN
- Environmental variables support
- Zero configuration needed

**Steps:**

1. **Create Vercel account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Import project**
   - Click "Add New..." → "Project"
   - Select your GitHub repo
   - Click "Import"

3. **Configure environment variables** (if needed)
   - Under "Settings" → "Environment Variables"
   - Add any sensitive Firebase config if using environment setup

4. **Deploy**
   - Click "Deploy"
   - Your app is live!

5. **Automatic deployments**
   - Any push to main branch auto-deploys
   - Pull requests get preview URLs

**Domain:**
- Get free `.vercel.app` domain
- Or connect custom domain (Settings → Domains)

---

### Option 2: Netlify

**Why Netlify?**
- Great for static sites
- Generous free tier
- Easy GitHub integration
- Built-in redirects and rewrites

**Steps:**

1. **Create Netlify account**
   - Visit [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy from Git**
   - Click "New site from Git"
   - Select GitHub repo
   - Build command: (leave empty - static site)
   - Publish directory: `.` (root)

3. **Deploy**
   - Click "Deploy site"

4. **Custom domain**
   - Go to "Domain settings"
   - Add your custom domain

---

### Option 3: Firebase Hosting

**Why Firebase?**
- Same backend as your app
- Built-in SSL certificate
- Global CDN
- Generous free tier

**Steps:**

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Select options:**
   - Use existing project (select your RacerReady project)
   - Public directory: `.` (root)
   - Configure single-page app: `Yes`

4. **Deploy**
   ```bash
   firebase deploy
   ```

Your app is now live at `https://your-project.web.app`

**Custom domain:**
```bash
firebase hosting:channel:deploy main --expires 30d
```

---

### Option 4: GitHub Pages (Free)

**Why GitHub Pages?**
- Completely free
- Hosted by GitHub
- Easy for portfolios and demos

**Steps:**

1. **Enable GitHub Pages**
   - Go to repo Settings
   - Scroll to "Pages"
   - Source: "Deploy from a branch"
   - Branch: "main" → "root"

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Access your site**
   - URL: `https://username.github.io/RacerReady`

**Note:** GitHub Pages is best for demos. For production, use Vercel or Netlify.

---

### Option 5: Traditional Web Hosting (cPanel, Bluehost, etc.)

**Steps:**

1. **Get FTP credentials** from your hosting provider

2. **Upload files via FTP**
   - Download an FTP client (FileZilla, etc.)
   - Connect using provided credentials
   - Upload all files to `public_html/` folder

3. **Update Firebase config**
   - Make sure `sign.html` has correct Firebase config
   - Test authentication

4. **Access your site**
   - Your hosting provider's domain

---

## Pre-Deployment Checklist

Before deploying:

- [ ] Update Firebase config with production project credentials
- [ ] Test all features locally with `npm run dev`
- [ ] Update `package.json` version number
- [ ] Remove any console.log() debug statements (optional)
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness
- [ ] Verify all images load correctly
- [ ] Test authentication flow
- [ ] Verify Firebase security rules are set
- [ ] Update README with production URL

## Environment Variables Setup

If using environment variables for Firebase config:

Create `.env.production`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update `sign.html` to use these:
```javascript
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    // ... etc
};
```

---

## Firebase Security Rules

Add these to your Firebase Console (Firestore):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - private access
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Tracks - user-specific
    match /tracks/{trackId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Days - user-specific
    match /days/{dayId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Tire Sets - user-specific
    match /tireSets/{setId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Tires - user-specific
    match /tires/{tireId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Tire Events - user-specific
    match /tireEvents/{eventId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Builds - user-specific
    match /builds/{buildId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Post-Deployment

After deploying:

1. **Test the live site**
   - Create a test account
   - Test all major features
   - Verify database operations

2. **Set up monitoring**
   - Enable Firebase Analytics
   - Monitor error logs
   - Track user behavior

3. **Configure custom domain** (optional)
   - Follow platform-specific instructions
   - Set up SSL (usually automatic)

4. **Enable HTTPS** (must have)
   - Vercel/Netlify/Firebase do this automatically
   - For traditional hosting, get SSL certificate

5. **Backup your code**
   - Keep git repo updated
   - Regular database backups

---

## Troubleshooting

### Firebase Auth not working
- Check Firebase config in sign.html
- Verify authentication method is enabled in Firebase Console
- Check CORS settings

### Images not loading
- Verify image paths are correct
- Check if Firebase Storage rules allow public access
- Use absolute URLs instead of relative paths

### Database queries failing
- Check Firestore security rules
- Verify user is authenticated
- Check browser console for errors

### Deployment failing
- Check platform-specific build requirements
- Verify all files are committed to git
- Check for syntax errors in code

---

## Performance Optimization

### For Production

1. **Minify assets**
   ```bash
   npm run build
   ```

2. **Enable compression**
   - Most hosts do this automatically
   - Verify with Chrome DevTools

3. **Optimize images**
   - Use WebP format where possible
   - Compress JPEG/PNG files
   - Add lazy loading

4. **Cache strategy**
   - Set long cache times for static assets
   - Use service workers for offline support

### Monitoring Performance

- Use Google PageSpeed Insights
- Monitor Core Web Vitals in Firebase Analytics
- Check loading times in DevTools

---

## Scaling

As your app grows:

1. **Use CDN**
   - All recommended platforms include CDN
   - Automatically serves from nearest location

2. **Optimize database**
   - Add indexes to Firestore
   - Archive old data
   - Monitor quota usage

3. **Upgrade plan**
   - Firebase Blaze pay-as-you-go
   - Platform's paid tier

---

## Support

For deployment issues:
- Check platform documentation
- Review browser console for errors
- Check Firebase console for warnings
- Create GitHub issue with details

---

**Happy racing! 🏁**
