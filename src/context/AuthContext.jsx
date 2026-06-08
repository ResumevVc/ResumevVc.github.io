import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error during Google Sign In:', error);
    }
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signupWithEmail = useCallback(async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const logoutAction = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout: logoutAction,
    getTokenSilently: useCallback(async () => {
      if (user) {
        return await user.getIdToken();
      }
      throw new Error('No user logged in');
    }, [user])
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
