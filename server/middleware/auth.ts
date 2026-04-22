import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../supabaseClient';

export interface AuthedRequest extends Request {
  userId?: string;
}

export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) return next();

  const { data, error } = await supabase.auth.getUser(token);
  if (!error && data.user) {
    req.userId = data.user.id;
  }
  return next();
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.userId = data.user.id;
  return next();
}

