import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';
import { supabase, setSupabaseAuthHeader, clearSupabaseAuthHeader } from './supabase';

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const idToken = await credential.user.getIdToken();
  setSupabaseAuthHeader(idToken);

  const { error } = await supabase.from('users').insert({
    firebase_uid: credential.user.uid,
    email,
    display_name: displayName,
  });

  if (error) throw new Error(`Supabase user creation failed: ${error.message}`);

  return credential.user;
};

export const loginUser = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  const idToken = await credential.user.getIdToken();
  setSupabaseAuthHeader(idToken);

  return credential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
  clearSupabaseAuthHeader();
};