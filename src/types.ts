export type Page = 'home' | 'discover' | 'collection' | 'profile' | 'write-bottle' | 'write-plane' | 'pick-bottle' | 'settings' | 'login';

export interface Note {
  id: string;
  type: 'bottle' | 'plane';
  content: string;
  title?: string;
  date: string;
  imageUrl?: string;
  location?: string;
  author?: string;
  ownerId?: string;
  likeCount?: number;
  likedByMe?: boolean;
  collectedByMe?: boolean;
}

export interface BottleReply {
  id: string;
  bottleId: string;
  senderId: string;
  receiverId: string;
  content: string;
  ownerReaction?: string;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface User {
  name: string;
  id: string;
  email?: string;
  bio: string;
  avatar: string;
  gender: 'male' | 'female' | 'secret';
  bottlesSent: number;
  planesFlown: number;
}

export interface AuthUser {
  id: string;
  phone?: string;
}
