import type { Note, BottleReply } from './types';
import type { Session } from '@supabase/supabase-js';

export interface CreateNotePayload {
  type: 'bottle' | 'plane';
  title?: string | null;
  content: string;
  imageUrl?: string | null;
  location?: string | null;
}

export interface NoteFromApi {
  id: string;
  type: 'bottle' | 'plane';
  title?: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  location?: string;
  author?: string;
  ownerId?: string;
  likeCount?: number;
  likedByMe?: boolean;
  collectedByMe?: boolean;
}

const API_BASE = ''; // use Vite dev proxy, so relative /api works in dev

function buildHeaders(session?: Session | null): HeadersInit {
  if (!session?.access_token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function fetchNotes(params?: {
  type?: 'bottle' | 'plane';
  limit?: number;
}, session?: Session | null): Promise<Note[]> {
  const url = new URL(API_BASE + '/api/notes', window.location.origin);
  if (params?.type) url.searchParams.set('type', params.type);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), { headers: buildHeaders(session) });
  if (!res.ok) {
    throw new Error('Failed to fetch notes');
  }
  const data: NoteFromApi[] = await res.json();
  return data.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    date: n.createdAt,
    imageUrl: n.imageUrl,
    location: n.location,
    author: n.author,
    ownerId: n.ownerId,
    likeCount: n.likeCount ?? 0,
    likedByMe: n.likedByMe ?? false,
    collectedByMe: n.collectedByMe ?? false,
  }));
}

export async function createNote(payload: CreateNotePayload, session: Session): Promise<Note> {
  const res = await fetch(API_BASE + '/api/notes', {
    method: 'POST',
    headers: buildHeaders(session),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to create note');
  }

  const data: NoteFromApi = await res.json();
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    content: data.content,
    date: data.createdAt,
    imageUrl: data.imageUrl,
    location: data.location,
    author: data.author,
    ownerId: data.ownerId,
    likeCount: data.likeCount ?? 0,
    likedByMe: data.likedByMe ?? false,
    collectedByMe: data.collectedByMe ?? false,
  };
}

export async function likeNote(noteId: string, session: Session) {
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/like`, { method: 'POST', headers: buildHeaders(session) });
  if (!res.ok) throw new Error('Failed to like note');
}

export async function unlikeNote(noteId: string, session: Session) {
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/like`, { method: 'DELETE', headers: buildHeaders(session) });
  if (!res.ok) throw new Error('Failed to unlike note');
}

export async function collectNote(noteId: string, session: Session) {
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/collect`, { method: 'POST', headers: buildHeaders(session) });
  if (!res.ok) throw new Error('Failed to collect note');
}

export async function uncollectNote(noteId: string, session: Session) {
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/collect`, { method: 'DELETE', headers: buildHeaders(session) });
  if (!res.ok) throw new Error('Failed to uncollect note');
}

export async function fetchDailyQuote(): Promise<{ content: string; author: string } | null> {
  const res = await fetch(`${API_BASE}/api/daily-quote`);
  if (!res.ok) return null;
  return res.json();
}

export async function replyToBottle(noteId: string, content: string, session: Session) {
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/reply`, {
    method: 'POST',
    headers: buildHeaders(session),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || '回信失败');
  }
}

export async function fetchMyReplies(session: Session): Promise<BottleReply[]> {
  const res = await fetch(`${API_BASE}/api/notes/my-replies`, { headers: buildHeaders(session) });
  if (!res.ok) throw new Error('Failed to fetch replies');
  return res.json();
}

export async function reactToReply(replyId: string, emoji: string, session: Session) {
  const res = await fetch(`${API_BASE}/api/replies/${replyId}/reaction`, {
    method: 'POST',
    headers: buildHeaders(session),
    body: JSON.stringify({ emoji }),
  });
  if (!res.ok) throw new Error('Failed to react');
}
