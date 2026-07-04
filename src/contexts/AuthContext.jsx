import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { PlayFabClient, playFabPromisify } from '../services/playfab';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [gamerProfile, setGamerProfile] = useState(null); // Contains gamerId
  const [loading, setLoading] = useState(true);

  // PlayFab Login Helper
  async function loginToPlayFab(uid, gamerId) {
    try {
      const loginResult = await playFabPromisify(PlayFabClient.LoginWithCustomID, {
        CustomId: uid,
        CreateAccount: true,
      });
      console.log('PlayFab Login Successful', loginResult);

      // Enforce PlayFab DisplayName limits (3 to 25 chars)
      let safeDisplayName = gamerId;
      if (safeDisplayName.length > 25) safeDisplayName = safeDisplayName.substring(0, 25);
      if (safeDisplayName.length < 3) safeDisplayName = safeDisplayName.padEnd(3, '_');

      await playFabPromisify(PlayFabClient.UpdateUserTitleDisplayName, {
        DisplayName: safeDisplayName,
      });
      console.log('PlayFab DisplayName Updated', safeDisplayName);
    } catch (err) {
      console.error('PlayFab Sync Error:', err);
    }
  }

  // Sign in with Google Popup
  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Sign Out
  function signOut() {
    return firebaseSignOut(auth);
  }

  // Check if a gamer ID is already taken
  async function checkGamerIdExists(gamerId) {
    if (!gamerId) return false;
    const q = query(collection(db, 'users'), where('gamerId', '==', gamerId.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Register a new Gamer ID
  async function registerGamerId(gamerId) {
    if (!currentUser) throw new Error('Must be logged in to register a Gamer ID');

    // Strict Validation: Only alphanumeric, 3-25 characters
    if (!/^[a-zA-Z0-9]{3,25}$/.test(gamerId)) {
      throw new Error('Gamer ID must be 3-25 characters and contain only letters and numbers.');
    }

    const exists = await checkGamerIdExists(gamerId);
    if (exists) throw new Error('Gamer ID is already taken');

    const userRef = doc(db, 'users', currentUser.uid);
    const profileData = {
      gamerId: gamerId.toLowerCase(),
      displayName: gamerId, // The display version can have original casing
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      createdAt: new Date().toISOString(),
    };

    await setDoc(userRef, profileData, { merge: true });
    setGamerProfile(profileData);

    // Sync with PlayFab
    await loginToPlayFab(currentUser.uid, gamerId);

    return profileData;
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setGamerProfile(data);
      // Sync with PlayFab when profile is loaded
      loginToPlayFab(uid, data.gamerId);
      return data;
    } else {
      setGamerProfile(null);
      return null; // No profile (needs to choose Gamer ID)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If logged in, fetch their Gamer ID profile
        try {
          await fetchUserProfile(user.uid);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setGamerProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    gamerProfile,
    signInWithGoogle,
    signOut,
    checkGamerIdExists,
    registerGamerId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
