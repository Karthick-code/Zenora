import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!auth.currentUser) return null;
    const res = await api.get('/auth/me');
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('zenora_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    return null;
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          localStorage.removeItem('zenora_user');
          return;
        }
        await refreshUser();
      } catch (error) {
        console.error('Failed to initialize Zenora session:', error);
        await signOut(auth);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const login = async (identifier, password, companySlug = '') => {
    const value = String(identifier || '').trim();
    let email = value;
    if (!value.includes('@')) {
      const lookup = await api.post('/auth/resolve-login', { identifier: value, companySlug });
      email = lookup.data.email;
    }
    await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
    const nextUser = await refreshUser();
    if (!nextUser) throw new Error('Your account profile is not configured. Contact your company administrator.');
    return nextUser;
  };

  const register = async (data) => {
    const credential = await createUserWithEmailAndPassword(auth, data.email.toLowerCase().trim(), data.password);
    const res = await api.post('/auth/register', {
      ...data,
      firebaseUid: credential.user.uid,
    });
    if (res.data.success) {
      await refreshUser();
      return res.data;
    }
    return null;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('zenora_user');
  };

  return (
    <AuthContext.Provider value={{ user, token: null, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
