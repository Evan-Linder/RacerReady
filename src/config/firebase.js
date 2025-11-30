/**
 * Firebase Configuration
 * 
 * Centralized Firebase initialization and configuration.
 * All Firebase imports and references are managed here.
 * 
 * @module config/firebase
 */

/**
 * Initialize Firebase SDK references
 * Exposes Firebase functions to window for use throughout the app
 */
export function initializeFirebaseReferences() {
    // This function assumes Firebase SDK is already loaded via CDN in HTML
    // and window.firebase is available

    if (!window.firebase) {
        console.error('Firebase SDK not loaded. Check HTML imports.');
        return false;
    }

    const {
        initializeApp,
        getAuth,
        signOut,
        onAuthStateChanged,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        updateEmail,
        updatePassword,
        reauthenticateWithCredential,
        EmailAuthProvider,
        signInWithPopup,
        GoogleAuthProvider,
    } = window.firebase.auth;

    const {
        getFirestore,
        collection,
        query,
        where,
        getDocs,
        getDoc,
        addDoc,
        deleteDoc,
        updateDoc,
        doc,
        setDoc,
        orderBy,
        limit,
    } = window.firebase.firestore;

    const {
        getStorage,
        ref,
        uploadBytes,
        getBytes,
        getDownloadURL,
    } = window.firebase.storage;

    // Export functions to window for backward compatibility
    window.firebaseSignOut = signOut;
    window.firebaseOnAuthStateChanged = onAuthStateChanged;
    window.firebaseSignInWithEmail = signInWithEmailAndPassword;
    window.firebaseCreateUser = createUserWithEmailAndPassword;
    window.firebaseUpdateEmail = updateEmail;
    window.firebaseUpdatePassword = updatePassword;
    window.firebaseReauthenticateWithCredential = reauthenticateWithCredential;
    window.firebaseEmailAuthProvider = EmailAuthProvider;

    window.firebaseCollection = collection;
    window.firebaseQuery = query;
    window.firebaseWhere = where;
    window.firebaseGetDocs = getDocs;
    window.firebaseGetDoc = getDoc;
    window.firebaseAddDoc = addDoc;
    window.firebaseDeleteDoc = deleteDoc;
    window.firebaseUpdateDoc = updateDoc;
    window.firebaseDoc = doc;
    window.firebaseSetDoc = setDoc;
    window.firebaseOrderBy = orderBy;
    window.firebaseLimit = limit;

    window.firebaseGetStorage = getStorage;
    window.firebaseRef = ref;
    window.firebaseUploadBytes = uploadBytes;
    window.firebaseGetBytes = getBytes;
    window.firebaseGetDownloadURL = getDownloadURL;

    return true;
}

/**
 * Get Firebase app instance
 * @returns {Object} Firebase app instance
 */
export function getFirebaseApp() {
    return window.firebaseApp;
}

/**
 * Get Firestore database instance
 * @returns {Object} Firestore database instance
 */
export function getFirestoreDb() {
    return window.firebaseDb;
}

/**
 * Get Firebase Auth instance
 * @returns {Object} Firebase Auth instance
 */
export function getFirebaseAuth() {
    return window.firebaseAuth;
}

/**
 * Get Firebase Storage instance
 * @returns {Object} Firebase Storage instance
 */
export function getFirebaseStorage() {
    return window.firebaseStorage;
}
