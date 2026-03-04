import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  deleteUser,
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
    display_name:  displayName,
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

export const signInWithGoogle = async (idToken: string) => {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const result           = await signInWithCredential(auth, googleCredential);
  const user             = result.user;
  const firebaseToken    = await user.getIdToken();
  setSupabaseAuthHeader(firebaseToken);

  const { error } = await supabase
    .from('users')
    .upsert(
      { firebase_uid: user.uid, email: user.email ?? '', display_name: user.displayName ?? '' },
      { onConflict: 'firebase_uid' }
    );
  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  return user;
};

// ─── Delete Account ───────────────────────────────────────────────────────────
// Order matters — delete child rows before parent to avoid FK violations
export const deleteAccount = async (uid: string): Promise<void> => {
  await supabase.from('habit_logs').delete().eq('user_id', uid);
  await supabase.from('focus_sessions').delete().eq('user_id', uid);
  await supabase.from('habits').delete().eq('user_id', uid);
  await supabase.from('users').delete().eq('firebase_uid', uid);

  const currentUser = auth.currentUser;
  if (currentUser) await deleteUser(currentUser);

  clearSupabaseAuthHeader();
};