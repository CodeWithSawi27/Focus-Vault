import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
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
    firebase_uid:  credential.user.uid,
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

// ─── Google Sign-In ───────────────────────────────────────────────────────────

export const signInWithGoogle = async (idToken: string) => {
  // Exchange Google ID token for Firebase credential
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const result           = await signInWithCredential(auth, googleCredential);
  const user             = result.user;

  const firebaseToken = await user.getIdToken();
  setSupabaseAuthHeader(firebaseToken);

  // Upsert user in Supabase — safe for both new and returning Google users
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        firebase_uid:  user.uid,
        email:         user.email ?? '',
        display_name:  user.displayName ?? '',
      },
      { onConflict: 'firebase_uid' }
    );

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  return user;
};