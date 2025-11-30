/**
 * Firebase Configuration Template
 * 
 * IMPORTANT: This file shows the structure of Firebase configuration.
 * Do NOT commit your real credentials to GitHub.
 * 
 * For production, use environment variables or a secure config system.
 */

export const firebaseConfig = {
    // Get these from Firebase Console > Project Settings > General
    apiKey: "AIzaSyBi_oZtWxAvLa3aKeb_u1L_Gg31Bbf9u-A",  // Public API Key
    authDomain: "racerready-a70d1.firebaseapp.com",     // Auth domain
    projectId: "racerready-a70d1",                       // Project ID
    storageBucket: "racerready-a70d1.firebasestorage.app",  // Storage bucket
    messagingSenderId: "101209144078",                    // Messaging sender ID
    appId: "1:101209144078:web:133e745dd019211e63f55f"   // App ID
};

/**
 * To use this configuration:
 * 
 * 1. Replace the values with your actual Firebase project credentials
 * 2. Import this in your app:
 *    import { firebaseConfig } from './firebase-config.js';
 * 3. Pass to Firebase initialization:
 *    const app = initializeApp(firebaseConfig);
 * 
 * Security Notes:
 * - The apiKey here is NOT a secret (it's public)
 * - Use Firebase Security Rules to protect your data
 * - Never expose service account keys or admin credentials
 * - For sensitive data, implement server-side validation
 */
