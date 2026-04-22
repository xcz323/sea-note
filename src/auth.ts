import { createClient, type Session } from '@supabase/supabase-js';
import { User } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabaseAuth = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

export async function signUpWithPassword(email: string, password: string, nickname: string, avatarUrl: string) {
  return supabaseAuth.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        nickname: nickname.trim(),
        avatar_url: avatarUrl,
      },
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return supabaseAuth.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabaseAuth.auth.getSession();
  return data.session ?? null;
}

export async function signOut() {
  return supabaseAuth.auth.signOut();
}

export async function ensureProfileForCurrentUser() {
  const { data: userData } = await supabaseAuth.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const metadata = user.user_metadata || {};
  const nickname = metadata.nickname || (user.email ? `用户${user.email.slice(0, 4)}` : '云端旅人');
  const avatarUrl = metadata.avatar_url || 'https://picsum.photos/seed/new-user/200/200';

  const payload = {
    id: user.id,
    nickname,
    avatar_url: avatarUrl,
  };

  const { error } = await supabaseAuth.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Profile initialization failed:', error.message);
  }
}

export async function getCurrentProfile(): Promise<Partial<User> | null> {
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabaseAuth.from('profiles').select('*').eq('id', user.id).single();
  
  if (error || !profile) {
    return {
      name: user.user_metadata?.nickname || (user.email ? `用户${user.email.slice(0, 4)}` : '云端旅人'),
      id: "0000000",
      email: user.email,
      avatar: user.user_metadata?.avatar_url || 'https://picsum.photos/seed/new-user/200/200',
    };
  }

  return {
    name: profile.nickname,
    id: profile.id_no != null ? String(profile.id_no).padStart(7, '0') : "0000000",
    email: user.email,
    avatar: profile.avatar_url || 'https://picsum.photos/seed/new-user/200/200',
  };
}

