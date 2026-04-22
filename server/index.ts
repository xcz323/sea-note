import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import notesRouter from './routes/notes';
import { requireAuth, type AuthedRequest } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ userId: req.userId });
});

app.use('/api/notes', notesRouter);

import { supabase } from './supabaseClient';

app.get('/api/daily-quote', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('daily_quotes').select('*').order('id', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return res.json({ content: '愿你在云端，找到宁静。', author: '系统' });
    }
    
    // Rotate index based on days since epoch to be consistent per day
    const dayIndex = Math.floor(Date.now() / 86400000);
    const quote = data[dayIndex % data.length];
    
    return res.json({ content: quote.content, author: quote.author });
  } catch (err) {
    return res.json({ content: '愿你在云端，找到宁静。', author: '系统' });
  }
});

app.post('/api/replies/:id/reaction', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;
    
    // Verify ownership indirectly or directly. For now, just update the row if receiver_id matches.
    const { data: reply, error: queryErr } = await supabase.from('bottle_replies').select('receiver_id, owner_reaction').eq('id', id).single();
    if (queryErr || !reply) return res.status(404).json({ message: 'Reply not found' });
    if (reply.receiver_id !== userId) return res.status(403).json({ message: 'Not authorized' });
    if (reply.owner_reaction) return res.status(400).json({ message: 'Already reacted' });

    const { error: updateErr } = await supabase.from('bottle_replies').update({ owner_reaction: emoji }).eq('id', id);
    if (updateErr) return res.status(500).json({ message: 'Failed to save reaction' });
    
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

