import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { optionalAuth, requireAuth, type AuthedRequest } from '../middleware/auth';

const router = Router();

// Shared Note type between backend and frontend shape
export interface NoteDto {
  id: string;
  type: 'bottle' | 'plane';
  title?: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  location?: string;
  author?: string;
  ownerId?: string;
  likeCount: number;
  likedByMe: boolean;
  collectedByMe: boolean;
}

const mapRowToNoteDto = (row: any): NoteDto => ({
  id: row.id,
  type: row.type,
  title: row.title ?? undefined,
  content: row.content,
  createdAt: row.created_at,
  imageUrl: row.image_url ?? undefined,
  location: row.location ?? undefined,
  author: row.author ?? undefined,
  ownerId: row.user_id ?? undefined,
  likeCount: Number(row.like_count ?? 0),
  likedByMe: Boolean(row.liked_by_me),
  collectedByMe: Boolean(row.collected_by_me),
});

router.get('/', optionalAuth, async (req: AuthedRequest, res) => {
  try {
    const { type, limit } = req.query;
    const parsedLimit = Number(limit) || 20;
    const userId = req.userId ?? null;

    let query = supabase
      .from('notes')
      .select(`
        id,
        type,
        title,
        content,
        created_at,
        image_url,
        location,
        author,
        user_id,
        note_likes(count),
        note_collections(count)
      `)
      .order('created_at', { ascending: false })
      .limit(parsedLimit);

    if (typeof type === 'string' && (type === 'bottle' || type === 'plane')) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notes from Supabase:', error);
      return res.status(500).json({ message: 'Failed to fetch notes' });
    }

    const notes = await Promise.all(
      (data ?? []).map(async (row: any) => {
        const likeCount = Array.isArray(row.note_likes) ? Number(row.note_likes[0]?.count ?? 0) : 0;
        const collectionCount = Array.isArray(row.note_collections) ? Number(row.note_collections[0]?.count ?? 0) : 0;

        let likedByMe = false;
        let collectedByMe = false;

        if (userId) {
          const [{ data: liked }, { data: collected }] = await Promise.all([
            supabase.from('note_likes').select('id').eq('note_id', row.id).eq('user_id', userId).maybeSingle(),
            supabase.from('note_collections').select('id').eq('note_id', row.id).eq('user_id', userId).maybeSingle(),
          ]);
          likedByMe = Boolean(liked?.id);
          collectedByMe = Boolean(collected?.id);
        }

        return mapRowToNoteDto({
          ...row,
          like_count: likeCount,
          collection_count: collectionCount,
          liked_by_me: likedByMe,
          collected_by_me: collectedByMe,
        });
      }),
    );
    return res.json(notes);
  } catch (err) {
    console.error('Unexpected error in GET /api/notes:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { type, title, content, imageUrl, location } = req.body ?? {};
    const userId = req.userId;

    if (type !== 'bottle' && type !== 'plane') {
      return res.status(400).json({ message: 'Invalid type, must be "bottle" or "plane"' });
    }

    if (typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const insertPayload = {
      type,
      title: title ?? null,
      content,
      user_id: userId,
      image_url: imageUrl ?? null,
      location: location ?? null,
      author: '已登录用户',
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting note into Supabase:', error);
      return res.status(500).json({ message: 'Failed to create note' });
    }

    const note = mapRowToNoteDto({ ...data, like_count: 0, liked_by_me: false, collected_by_me: false });
    return res.status(201).json(note);
  } catch (err) {
    console.error('Unexpected error in POST /api/notes:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/like', requireAuth, async (req: AuthedRequest, res) => {
  const noteId = req.params.id;
  const userId = req.userId!;
  const { error } = await supabase.from('note_likes').upsert({ note_id: noteId, user_id: userId }, { onConflict: 'note_id,user_id' });
  if (error) return res.status(500).json({ message: 'Failed to like note' });
  return res.status(204).send();
});

router.delete('/:id/like', requireAuth, async (req: AuthedRequest, res) => {
  const noteId = req.params.id;
  const userId = req.userId!;
  const { error } = await supabase.from('note_likes').delete().eq('note_id', noteId).eq('user_id', userId);
  if (error) return res.status(500).json({ message: 'Failed to unlike note' });
  return res.status(204).send();
});

router.post('/:id/collect', requireAuth, async (req: AuthedRequest, res) => {
  const noteId = req.params.id;
  const userId = req.userId!;
  const { error } = await supabase.from('note_collections').upsert({ note_id: noteId, user_id: userId }, { onConflict: 'note_id,user_id' });
  if (error) return res.status(500).json({ message: 'Failed to collect note' });
  return res.status(204).send();
});

router.delete('/:id/collect', requireAuth, async (req: AuthedRequest, res) => {
  const noteId = req.params.id;
  const userId = req.userId!;
  const { error } = await supabase.from('note_collections').delete().eq('note_id', noteId).eq('user_id', userId);
  if (error) return res.status(500).json({ message: 'Failed to uncollect note' });
  return res.status(204).send();
});

router.get('/me/profile', requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) return res.status(500).json({ message: 'Failed to fetch profile' });
  return res.json(data ?? null);
});

router.post('/:id/reply', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.userId!;
    const { content } = req.body ?? {};

    if (!content) return res.status(400).json({ message: 'Content required' });

    // Ensure note exists and get owner
    const { data: note, error: noteErr } = await supabase.from('notes').select('user_id').eq('id', noteId).single();
    if (noteErr || !note) return res.status(404).json({ message: 'Note not found' });
    
    // You cannot reply to your own bottle
    if (note.user_id === userId) return res.status(400).json({ message: 'Cannot reply to own bottle' });

    const insertPayload = {
      bottle_id: noteId,
      sender_id: userId,
      receiver_id: note.user_id,
      content
    };

    const { error: replyErr } = await supabase.from('bottle_replies').insert(insertPayload);
    
    if (replyErr) {
      if (replyErr.code === '23505') {
        return res.status(400).json({ message: 'You have already replied to this bottle' });
      }
      return res.status(500).json({ message: 'Failed to reply' });
    }
    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-replies', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Explicitly query bottle_replies without the embedded profiles join to avoid relationship ambiguity
    const { data, error } = await supabase
      .from('bottle_replies')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch replies:', error);
      return res.status(500).json({ message: 'Failed to fetch replies', details: error.message });
    }
    
    const repliesData = data ?? [];
    
    // Fetch profiles manually to ensure reliable joining
    const senderIds = Array.from(new Set(repliesData.map((r: any) => r.sender_id)));
    let profilesMap: Record<string, any> = {};
    
    if (senderIds.length > 0) {
      const { data: pData, error: pError } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url')
        .in('id', senderIds);
        
      if (!pError && pData) {
        profilesMap = Object.fromEntries(pData.map((p: any) => [p.id, p]));
      } else if (pError) {
        console.warn('Failed to fetch profiles for replies:', pError);
      }
    }

    const results = repliesData.map((row: any) => ({
      id: row.id,
      bottleId: row.bottle_id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      ownerReaction: row.owner_reaction ?? undefined,
      createdAt: row.created_at,
      senderName: profilesMap[row.sender_id]?.nickname ?? '神秘人',
      senderAvatar: profilesMap[row.sender_id]?.avatar_url ?? 'https://picsum.photos/seed/new/200',
    }));

    return res.json(results);
  } catch (err) {
    console.error('Unexpected error in my-replies:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

