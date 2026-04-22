/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { 
  Home as HomeIcon, 
  Compass, 
  Plus, 
  Sparkles, 
  User as UserIcon,
  Search,
  Send,
  Droplets,
  Mail,
  Bell,
  X,
  ArrowLeft,
  Camera,
  Cloud,
  Settings,
  Edit2,
  Check,
  ChevronRight,
  Shield,
  ShieldCheck,
  Smartphone,
  MapPin,
  Clock,
  MoreHorizontal,
  Ship,
  Fish,
  Waves,
  Leaf,
  MessageSquare,
  Heart,
  Star,
  PenTool,
  Loader2,
  Link,
  Github,
  Twitter,
  LogOut,
  CheckCircle,
  Moon,
  Menu,
  RefreshCcw
} from 'lucide-react';
import { Page, Note, User, BottleReply } from './types';
import { MOCK_USER, MOCK_NOTES, DISCOVER_ITEMS } from './constants';
import { collectNote, createNote, fetchNotes, likeNote, uncollectNote, unlikeNote, fetchDailyQuote, replyToBottle, fetchMyReplies, reactToReply } from './api';
import { signInWithPassword, signUpWithPassword, ensureProfileForCurrentUser, getCurrentProfile, getSession, supabaseAuth, signOut } from './auth';

// --- Mock Data ---

const MOCK_NOTIFICATIONS = [
  { id: 1, title: '新奇遇', content: '有人捡到了你的漂流瓶！', time: '10分钟前', unread: true },
  { id: 2, title: '纸飞机回信', content: '你的纸飞机收到了新的回信。', time: '2小时前', unread: true },
  { id: 3, title: '收藏更新', content: '你收藏的奇遇有了新的动态。', time: '昨天', unread: false },
];

// --- Components ---

const BottomNav = ({ activePage, onPageChange, onAddClick }: { 
  activePage: Page, 
  onPageChange: (p: Page) => void,
  onAddClick: () => void
}) => {
  const tabs: { id: Page; label: string; icon: any }[] = [
    { id: 'home', label: '首页', icon: HomeIcon },
    { id: 'discover', label: '发现', icon: Compass },
    { id: 'collection', label: '收藏', icon: Sparkles },
    { id: 'profile', label: '我的', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-between border-t border-slate-100 bg-white/90 pb-6 pt-2 backdrop-blur-md max-w-md mx-auto">
      {tabs.slice(0, 2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => onPageChange(tab.id)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activePage === tab.id ? 'text-primary' : 'text-slate-400'}`}
        >
          <tab.icon 
            size={24} 
            strokeWidth={activePage === tab.id ? 2.5 : 2}
            fill={activePage === tab.id ? "currentColor" : "none"} 
            fillOpacity={activePage === tab.id ? 0.15 : 0}
          />
          <p className="text-[10px] font-bold tracking-wide">{tab.label}</p>
        </button>
      ))}

      <div className="flex flex-1 flex-col items-center justify-center">
        <button 
          onClick={onAddClick}
          className="relative -top-4 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform active:scale-95 border-[3px] border-white"
        >
          <Plus size={32} />
        </button>
      </div>

      {tabs.slice(2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => onPageChange(tab.id)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${activePage === tab.id ? 'text-primary' : 'text-slate-400'}`}
        >
          <tab.icon 
            size={24} 
            strokeWidth={activePage === tab.id ? 2.5 : 2}
            fill={activePage === tab.id ? "currentColor" : "none"} 
            fillOpacity={activePage === tab.id ? 0.15 : 0}
          />
          <p className="text-[10px] font-bold tracking-wide">{tab.label}</p>
        </button>
      ))}
    </nav>
  );
};

const Home = ({ notes, onToggleLike, onToggleCollect }: { notes: Note[], onToggleLike: (note: Note) => void, onToggleCollect: (note: Note) => void }) => {
  const [quote, setQuote] = useState<{content: string, author: string} | null>(null);
  
  useEffect(() => {
    fetchDailyQuote().then(setQuote);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24"
    >
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Courier New' }}>漫步云端</h1>
          <p className="text-sm text-primary/80 font-medium">寻找那一抹诗意</p>
        </div>
      </header>

      <div className="px-4 py-2">
        <div className="relative h-64 w-full overflow-hidden rounded-xl watercolor-bg flex items-center justify-center border-2 border-dashed border-primary/20">
          <div className="absolute top-10 left-10 opacity-60 text-white">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Sparkles size={40} />
            </motion.div>
          </div>
          <div className="absolute bottom-12 right-16 opacity-40 text-white">
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Sparkles size={60} />
            </motion.div>
          </div>
          <div className="absolute top-20 right-10">
            <motion.div animate={{ x: [0, 10, 0], y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <Send size={24} className="text-primary/60 -rotate-12" />
            </motion.div>
          </div>
          <div className="text-center z-10 px-8">
            <p className="text-lg font-medium text-slate-700 italic">"风起时，云亦在诉说。"</p>
          </div>
        </div>
      </div>

      <section className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-primary" />
          <h2 className="text-lg font-bold">每日灵感</h2>
        </div>
        <div className="sticky-note p-6 rounded-lg border-b-2 border-r-2 border-primary/20">
          <div className="flex justify-between items-start mb-4">
            <div className="size-3 rounded-full bg-primary/20"></div>
            <span className="text-xs text-slate-400 font-mono">{todayStr}</span>
          </div>
          <p className="text-xl leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
            {quote ? quote.content : "愿你在这片云端，\n找到属于自己的宁静。"}
          </p>
          <div className="mt-4 flex justify-end">
            <p className="text-sm text-slate-500">— {quote ? quote.author : "灵感之笺"}</p>
          </div>
        </div>
      </section>

    <section>
      <div className="flex items-center justify-between px-6 mb-4">
        <div className="flex items-center gap-2">
          <Compass size={20} className="text-primary" />
          <h2 className="text-lg font-bold">近期奇遇</h2>
        </div>
        <button className="text-sm text-primary font-medium">查看更多</button>
      </div>
      <div className="flex overflow-x-auto gap-4 px-6 pb-4 no-scrollbar">
        {notes.slice(0, 3).map((note) => (
          <div key={note.id} className="flex-none w-48 sketch-border bg-white p-3">
            <div className="h-32 w-full rounded-lg bg-primary/5 mb-3 flex items-center justify-center overflow-hidden">
              {note.imageUrl ? <img src={note.imageUrl} className="w-full h-full object-cover" /> : (note.type === 'bottle' ? <Droplets size={48} className="text-primary/40" /> : <Send size={48} className="text-primary/40" />)}
            </div>
            <p className="text-sm font-bold line-clamp-1 mb-1">{note.title || note.content}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              {note.location?.includes('漂流') ? <MapPin size={10} /> : <Clock size={10} />}
              <span>{note.location}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <button onClick={() => onToggleLike(note)} className="text-primary">
                {note.likedByMe ? '取消点赞' : '点赞'} ({note.likeCount ?? 0})
              </button>
              <button onClick={() => onToggleCollect(note)} className="text-primary">
                {note.collectedByMe ? '取消收藏' : '收藏'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  </motion.div>
  );
};

const Discover = ({ notes, onToggleCollect, onToggleLike, onPickBottle }: { notes: Note[], onToggleCollect: (note: Note) => void, onToggleLike: (note: Note) => void, onPickBottle: () => void }) => {
  const planes = notes.filter(n => n.type === 'plane');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <header className="flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-30 p-4 justify-between border-b border-primary/10 h-16">
        <motion.h2 
          className="text-slate-900 font-bold text-3xl"
        >
          发现
        </motion.h2>
        
        <button 
          onClick={onPickBottle}
          className="flex items-center justify-center rounded-full h-10 w-10 transition-colors bg-primary/10 text-primary hover:bg-primary hover:text-white"
        >
          <Droplets size={20} />
        </button>
      </header>
      
      <div className="px-6 pt-10 pb-6 text-center">
        <h1 className="text-slate-900 text-4xl font-bold tracking-wide">云端航线</h1>
        <p className="text-slate-500 text-sm mt-3 font-medium tracking-widest opacity-80 uppercase">PAPER PLANES IN THE SKY</p>
      </div>

      <div className="px-4">
        <AnimatePresence mode="popLayout">
          {planes.length > 0 ? (
            <motion.div 
              layout
              className="columns-2 gap-4"
            >
              {planes.map((note, idx) => (
                <motion.div 
                  layout
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`mb-6 break-inside-avoid transition-transform duration-500 hover:scale-105 ${idx % 2 === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg] translate-y-4'}`}
                >
                  <div className="bg-white p-3 shadow-xl rounded-sm border border-slate-100 relative group">
                    {note.imageUrl ? (
                      <>
                        <div className="aspect-[4/5] bg-sky-50 overflow-hidden relative mb-3 rounded-sm">
                          <img src={note.imageUrl} alt={note.title || '无题'} className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{note.title || '无题'}</h3>
                        <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-3">{note.content}</p>
                      </>
                    ) : (
                      <div className="bg-amber-50/50 p-4 rounded-sm border border-amber-100 flex flex-col justify-center min-h-[160px]">
                        <h3 className="text-lg font-bold text-amber-900 mb-2 font-handwritten border-b border-amber-200/50 pb-1 inline-block">{note.title || '随记'}</h3>
                        <p className="text-sm text-amber-800 leading-relaxed font-handwritten whitespace-pre-wrap">{note.content}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between text-[11px] border-t border-slate-50 pt-2">
                       <button onClick={() => onToggleLike(note)} className={`flex items-center gap-1 ${note.likedByMe ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}>
                         <Heart size={14} fill={note.likedByMe ? 'currentColor' : 'none'} />
                         {note.likeCount || 0}
                       </button>
                       <button onClick={() => onToggleCollect(note)} className={`flex items-center gap-1 ${note.collectedByMe ? 'text-amber-500' : 'text-slate-400 hover:text-amber-400'}`}>
                         <Star size={14} fill={note.collectedByMe ? 'currentColor' : 'none'} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center flex flex-col items-center"
            >
              <div className="bg-primary/5 p-6 rounded-full mb-4">
                <Send size={48} className="text-primary/20" />
              </div>
              <p className="text-slate-400 font-medium">天空空空如也，还没有纸飞机</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Collection = ({ notes }: { notes: Note[] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <header className="watercolor-bg pt-8 pb-4 px-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-slate-900 text-2xl font-bold font-handwritten">我的收藏</h1>
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors relative"
          >
            <Mail size={24} className="text-primary" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
        <p className="text-center font-handwritten text-primary/80 text-lg mb-4 italic">“拾起的时光碎片...”</p>
      </header>

      <div className="grid grid-cols-2 gap-6 p-6">
        {notes.filter(n => n.collectedByMe).map((note, idx) => (
          <div key={note.id} className={`flex flex-col gap-2 ${idx % 2 !== 0 ? 'pt-4' : ''}`}>
            <div className={`bg-white p-3 pb-8 polaroid-shadow rounded-sm ${idx % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[2deg]'}`}>
              <div className="aspect-square bg-slate-100 rounded-sm overflow-hidden mb-3">
                {note.imageUrl ? (
                   <img src={note.imageUrl} alt={note.content} className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-50">
                     {note.type === 'bottle' ? <Droplets size={32} className="text-slate-300"/> : <Send size={32} className="text-slate-300" />}
                   </div>
                )}
              </div>
              <p className="font-handwritten text-lg leading-tight text-slate-800">{note.title || note.content.substring(0, 20)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{note.date}</p>
            </div>
          </div>
        ))}
        {notes.filter(n => n.collectedByMe).length === 0 && (
          <div className="col-span-2 py-20 text-center flex flex-col items-center">
            <Star size={40} className="text-slate-200 mb-4" />
            <p className="text-slate-400">你还没有收藏任何信笺</p>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowNotifications(false);
                markAllAsRead();
              }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl overflow-hidden"
              style={{ maxHeight: '80vh' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  <h3 className="text-xl font-bold text-slate-900">通知中心</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowNotifications(false);
                    markAllAsRead();
                  }}
                  className="p-2 rounded-full bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto no-scrollbar pb-10" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl transition-colors ${n.unread ? 'bg-primary/5 border border-primary/10' : 'bg-slate-50 border border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold ${n.unread ? 'text-primary' : 'text-slate-700'}`}>{n.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="bg-slate-50 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400">暂无新通知</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Profile = ({ 
  user, 
  notes, 
  onNavigateToSettings, 
  onUpdateUser,
  session
}: { 
  user: User, 
  notes: Note[], 
  onNavigateToSettings: () => void, 
  onUpdateUser: (user: User) => void,
  session: Session | null
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [replies, setReplies] = useState<BottleReply[]>([]);
  const [reactingTo, setReactingTo] = useState<BottleReply | null>(null);

  useEffect(() => {
    if (session) {
      fetchMyReplies(session).then(setReplies).catch(console.error);
    }
  }, [session]);

  const handleReaction = async (emoji: string) => {
    if (!reactingTo || !session) return;
    try {
      await reactToReply(reactingTo.id, emoji, session);
      setReplies(replies.map(r => r.id === reactingTo.id ? { ...r, ownerReaction: emoji } : r));
      setReactingTo(null);
    } catch (e) {
      alert('回复失败');
      setReactingTo(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 watercolor-bg min-h-screen"
    >
      <div className="flex items-center p-6 justify-between">
        <h2 className="text-2xl font-bold leading-tight tracking-tight">我的</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={onNavigateToSettings}
            className="flex items-center justify-center rounded-full w-10 h-10 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex p-6 items-center gap-6">
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange} 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="hand-drawn-border w-24 h-24 overflow-hidden bg-white p-1 cursor-pointer group relative"
          >
            <img className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity" src={user.avatar} alt="avatar" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
              <Camera size={24} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <p className="text-xl font-bold text-slate-900">{user.name}</p>
          <p className="text-primary/70 text-sm font-medium">ID: {user.id}</p>
          <p className="mt-1 text-slate-500 text-sm italic">"{user.bio}"</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-6">
        <div className="sketch-card flex-1 flex flex-col gap-2 p-5 bg-white shadow-sm border-primary/20">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-primary" />
            <p className="text-slate-600 text-sm font-medium">已发出的瓶子</p>
          </div>
          <p className="text-primary text-3xl font-bold leading-tight">{user.bottlesSent}</p>
        </div>
        <div className="sketch-card flex-1 flex flex-col gap-2 p-5 bg-white shadow-sm border-primary/20">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-primary" />
            <p className="text-slate-600 text-sm font-medium">已飞行的飞机</p>
          </div>
          <p className="text-primary text-3xl font-bold leading-tight">{user.planesFlown}</p>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">我收到的回信</h3>
        </div>
        <div className="space-y-4">
          {replies.length > 0 ? replies.map((reply) => (
            <div key={reply.id} className="flex gap-4 p-4 bg-white/50 sketch-card border-slate-200">
              <div className="w-12 h-12 flex-shrink-0">
                <img className="w-full h-full object-cover rounded-full" src={reply.senderAvatar} alt={reply.senderName} referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 text-sm">{reply.senderName}</p>
                  <p className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-slate-600 mt-1 mb-2 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                
                {reply.ownerReaction ? (
                  <div className="inline-flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs">
                    <span>你回复了: </span>
                    <span className="text-sm">{reply.ownerReaction}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setReactingTo(reply)}
                    className="text-xs bg-white text-primary border border-primary/30 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    表情回复
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="py-10 text-center flex flex-col items-center opacity-60">
              <MessageSquare size={32} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">目前还没有收到任何回信。投递更多漂流瓶吧！</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {reactingTo && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setReactingTo(null)}>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white p-6 rounded-3xl"
               onClick={(e) => e.stopPropagation()}
             >
               <h3 className="text-center font-bold text-slate-800 mb-4">仅有一次的表情回复</h3>
               <div className="flex gap-4">
                 {['😊', '❤️', '👍', '😢', '😂', '🙏'].map(emoji => (
                   <button 
                     key={emoji}
                     onClick={() => handleReaction(emoji)}
                     className="text-3xl hover:scale-125 transition-transform"
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

const PostModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (type: 'bottle' | 'plane') => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-bg-light rounded-t-3xl p-6 pb-12"
        >
          <div className="flex justify-center mb-8">
            <div className="h-1.5 w-12 rounded-full bg-primary/30"></div>
          </div>
          
          <h2 className="text-slate-900 tracking-tight text-2xl font-bold text-center mb-10">
            记录此刻的心情
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => onSelect('bottle')}
              className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border-2 border-primary/20 hover:border-primary transition-all shadow-sm"
            >
              <div className="w-20 h-20 flex items-center justify-center bg-primary/10 rounded-full mb-2">
                <Droplets size={40} className="text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 text-lg font-bold">漂流瓶</h3>
                <p className="text-primary/70 text-sm mt-1">投递心事到深海</p>
              </div>
            </button>

            <button 
              onClick={() => onSelect('plane')}
              className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border-2 border-primary/20 hover:border-primary transition-all shadow-sm"
            >
              <div className="w-20 h-20 flex items-center justify-center bg-primary/10 rounded-full mb-2">
                <Send size={40} className="text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 text-lg font-bold">纸飞机</h3>
                <p className="text-primary/70 text-sm mt-1">寄给远方的季风</p>
              </div>
            </button>
          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={onClose}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg hover:scale-95 transition-transform"
            >
              <X size={32} />
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const PickBottlePage = ({ notes, onBack, session, currentUserId }: { notes: Note[], onBack: () => void, session: Session | null, currentUserId?: string }) => {
  const [currentBottle, setCurrentBottle] = useState<Note | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const pickRandom = () => {
    // Filter out own bottles so we don't try to reply to ourselves
    const bottles = notes.filter(n => n.type === 'bottle' && (!currentUserId || n.ownerId !== currentUserId));
    if (bottles.length === 0) {
      setCurrentBottle(null);
      return;
    }
    const random = bottles[Math.floor(Math.random() * bottles.length)];
    setCurrentBottle(random);
    setIsReplying(false);
    setReplyContent('');
  };

  useEffect(() => {
    if (!currentBottle) {
      pickRandom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const handleThrowBack = () => {
    // Generate a quick exit state then pick a new one
    pickRandom();
  };

  const handleReply = async () => {
    if (!currentBottle || !replyContent.trim()) return;
    if (!session) {
      alert('请先登录');
      return;
    }
    setIsSending(true);
    try {
      await replyToBottle(currentBottle.id, replyContent.trim(), session);
      alert('已将回信装入瓶中抛入大海');
      pickRandom();
    } catch (e: any) {
      alert(e.message || '发送失败');
    }
    setIsSending(false);
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-0 z-[110] bg-bg-light flex flex-col max-w-md mx-auto overflow-hidden watercolor-bg-sea"
    >
      {/* Decorative Ocean Elements from WritePage bottle */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-200 to-teal-400 opacity-60">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110%", x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ y: "-10%", opacity: [0, 0.4, 0], x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
              className="absolute size-4 rounded-full border border-white/40 bg-white/10"
            />
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-teal-500/20 to-transparent" />
        </div>
      </div>

      <header className="flex items-center px-4 py-4 relative z-10">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold tracking-tight mr-10 text-slate-800">
          捞星寻贝
        </h1>
      </header>

      <main className="flex-1 px-6 relative z-10 flex flex-col items-center justify-center pb-20">
        {currentBottle ? (
          <AnimatePresence mode="wait">
            {!isReplying ? (
              <motion.div 
                key={`bottle-${currentBottle.id}`}
                initial={{ opacity: 0, scale: 0.5, y: -50, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 1 }}
                exit={{ opacity: 0, scale: 0.5, y: 100, rotate: 10 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="w-full parchment-texture p-8 shadow-2xl rounded-2xl relative"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 opacity-20">
                  <Ship size={48} className="text-primary" />
                </div>
                <div className="min-h-[200px] flex items-center justify-center text-center">
                  <p className="text-lg leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">{currentBottle.content}</p>
                </div>
                <div className="mt-8 flex justify-end border-t border-slate-300/50 pt-4 w-full">
                  <span className="text-xs italic text-slate-400">来自 {currentBottle.location || '未知海域'}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="reply"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="w-full bg-white/90 backdrop-blur-md p-6 shadow-xl rounded-2xl border-2 border-primary/20"
              >
                <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                  <PenTool size={18} className="text-primary"/> 写回信
                </h3>
                <textarea 
                  autoFocus
                  disabled={isSending}
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="写下你想对TA说的话..."
                  className="w-full min-h-[160px] bg-sky-50/50 rounded-xl p-4 resize-none outline-none border border-sky-100 text-slate-700 placeholder:text-slate-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="text-center opacity-60 flex flex-col items-center">
            <Droplets size={64} className="text-slate-500 mb-4" />
            <p className="text-slate-600 font-bold">这片海域静寂无声...</p>
          </div>
        )}

        {currentBottle && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 px-6">
            {!isReplying ? (
              <>
                <button 
                  onClick={handleThrowBack}
                  className="flex-1 bg-white/60 backdrop-blur-sm border-2 border-primary/20 text-slate-700 font-bold py-4 rounded-xl hover:bg-white transition-colors"
                >
                  丢回海里
                </button>
                <button 
                  onClick={() => setIsReplying(true)}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
                >
                  写回信
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsReplying(false)}
                  disabled={isSending}
                  className="flex-1 bg-white/60 backdrop-blur-sm border-2 border-slate-200 text-slate-500 font-bold py-4 rounded-xl hover:bg-white transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleReply}
                  disabled={isSending || !replyContent.trim()}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending && <Loader2 size={18} className="animate-spin" />}
                  发出去
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </motion.div>
  );
};

const WritePage = ({ 
  type, 
  onBack, 
  onSend,
  session,
}: { 
  type: 'bottle' | 'plane', 
  onBack: () => void, 
  onSend: (note: Note | null) => void,
  session: Session | null,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    if (!session) {
      alert('请先登录后再发送');
      return;
    }
    setIsSending(true);
    try {
      const created = await createNote({
        type,
        title: type === 'plane' ? title.trim() : null,
        content: content.trim(),
        imageUrl: selectedImage,
        location: type === 'bottle' ? '大海 · 漂流中' : '天空 · 飞行中',
      }, session);
      // Wait for animation to complete before calling onSend
      setTimeout(() => {
        onSend(created);
      }, 2800);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('发送失败，请稍后再试');
      setIsSending(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-0 z-[110] bg-bg-light flex flex-col max-w-md mx-auto overflow-hidden"
    >
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {type === 'bottle' ? (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-blue-200 to-teal-400 opacity-60">
            {/* Bubbles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "110%", x: `${Math.random() * 100}%`, opacity: 0 }}
                animate={{ 
                  y: "-10%", 
                  opacity: [0, 0.4, 0],
                  x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 5, 
                  repeat: Infinity, 
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                className="absolute size-4 rounded-full border border-white/40 bg-white/10"
              />
            ))}
            {/* Wave overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-teal-500/20 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-sky-100 to-white opacity-80">
            {/* Clouds */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: "-20%", y: `${15 + i * 20}%`, opacity: 0 }}
                animate={{ x: "120%", opacity: [0, 0.6, 0] }}
                transition={{ 
                  duration: 15 + Math.random() * 10, 
                  repeat: Infinity, 
                  delay: i * 3,
                  ease: "linear"
                }}
                className="absolute text-white/60"
              >
                <Cloud size={60 + Math.random() * 40} fill="currentColor" />
              </motion.div>
            ))}
            {/* Wind lines */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ x: [0, 1000] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-[200%] h-full opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, white 101px, white 150px, transparent 151px)' }}
              />
            </div>
          </div>
        )}
      </div>

      <header className="flex items-center px-4 py-4 sticky top-0 bg-white/20 backdrop-blur-sm z-10">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold tracking-tight mr-10">
          {type === 'bottle' ? '海之语' : '写信'}
        </h1>
      </header>

      <main className={`flex-1 px-6 relative z-10 overflow-y-auto pb-10 ${type === 'plane' ? 'watercolor-bg' : 'watercolor-bg-sea'}`}>
        {type === 'plane' && (
          <>
            <div className="absolute top-10 right-10 opacity-20 pointer-events-none">
              <Cloud size={60} className="text-primary rotate-12" />
            </div>
            <div className="absolute bottom-40 left-4 opacity-10 pointer-events-none">
              <Cloud size={80} className="text-primary -rotate-12" />
            </div>
          </>
        )}
        {type === 'bottle' && (
          <>
            {/* Decorative Marine Elements */}
            <div className="absolute top-1/4 left-10 opacity-10 pointer-events-none transform -rotate-12 z-0">
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-800 mt-2" />
              </div>
            </div>
            <div className="absolute top-1/3 right-1/4 opacity-10 pointer-events-none z-0">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
            </div>
            <div className="absolute bottom-1/3 left-1/4 opacity-10 pointer-events-none z-0">
              <div className="w-5 h-5 rounded-full bg-slate-800" />
            </div>
            <div className="absolute top-20 right-10 opacity-15 pointer-events-none flex flex-col gap-1 transform rotate-12 z-0">
              <Fish size={24} className="text-slate-800" />
              <Fish size={20} className="text-slate-800 ml-4" />
              <Fish size={24} className="text-slate-800" />
            </div>
            <div className="absolute bottom-40 left-8 opacity-15 pointer-events-none flex gap-2 transform -rotate-6 z-0">
              <Fish size={32} className="text-slate-800" />
              <Fish size={24} className="text-slate-800 mt-2" />
            </div>
            <div className="absolute bottom-0 left-0 opacity-20 pointer-events-none transform translate-y-4 z-0">
              <Leaf size={72} className="text-slate-800/60" />
            </div>
            <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none transform translate-y-4 scale-x-[-1]">
              <Leaf size={80} className="text-slate-800/60" />
            </div>
            <div className="absolute bottom-24 right-8 w-24 h-24 opacity-40 pointer-events-none transform rotate-[20deg] z-0">
              <Droplets size={96} className="text-slate-800" />
            </div>
          </>
        )}
        <div className="mt-8 text-center">
          <h2 className={`text-2xl font-bold ${type === 'bottle' ? 'text-slate-800 drop-shadow-sm' : 'text-slate-800'}`}>
            {type === 'bottle' ? '写下你的心声' : '将心事寄往远方'}
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {type === 'bottle' ? '让思绪随着海浪漂向远方' : '写下你的话，让它随风而去'}
          </p>
        </div>

        <div className="mt-10 relative flex justify-center">
          {/* Paper Plane Animation Overlay */}
          {type === 'plane' && isSending && (
            <>
              {/* Wind Particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{ 
                    x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
                    y: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.8 + Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute z-40 w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
                />
              ))}

              <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 40, width: '100%', height: '100%' }}>
                <motion.path
                  d="M 0 0 C 120 0, 120 -240, 0 -240 C -120 -240, -120 0, 0 0 L 600 -900"
                  fill="transparent"
                  stroke="#f08b42"
                  strokeWidth="2.5"
                  strokeDasharray="8,6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2.6, ease: "easeInOut", times: [0, 0.1, 0.85, 1] }}
                />
              </svg>
              <motion.div
                initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.3, 1.1, 1.1, 1.4, 0.4], 
                  opacity: [0, 1, 1, 1, 1, 0],
                  x: [0, 120, 0, -120, 0, 600], 
                  y: [0, -60, -240, -60, 0, -900],
                  rotate: [0, -90, -180, -270, -360, -405],
                  filter: ["blur(0px)", "blur(0px)", "drop-shadow(0 0 15px rgba(240,139,66,0.6))", "blur(0px)"]
                }}
                transition={{ duration: 2.6, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                className="absolute z-50 text-primary"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    y: [0, -2, 2, 0]
                  }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  <Send size={80} fill="currentColor" />
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Drift Bottle Animation Overlay */}
          {type === 'bottle' && isSending && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 0 }}
              animate={{ 
                scale: [0, 0, 1.2, 1, 0.8], 
                opacity: [0, 0, 1, 1, 0],
                y: [0, 0, 0, 100, 400],
                rotate: [0, 0, 5, -5, 10]
              }}
              transition={{ duration: 1.5, ease: "easeInOut", times: [0, 0.4, 0.6, 0.8, 1] }}
              className="absolute z-50 text-primary"
            >
              <div className="relative">
                <Droplets size={100} className="opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary/60 rounded-full blur-[2px]" />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            animate={isSending ? (
              type === 'plane' ? {
                scaleX: [1, 0.4, 0.05, 0],
                scaleY: [1, 0.9, 0.6, 0],
                skewX: [0, 20, 40, 60],
                rotate: [1, -5, -15, -30],
                opacity: [1, 1, 0.8, 0],
                y: [0, 10, 0, 0]
              } : {
                scale: [1, 0.8, 0.4, 0],
                rotate: [1, 15, -10, 20],
                borderRadius: ["1.5rem", "40%", "50%", "50%"],
                x: [0, 5, -5, 0],
                opacity: [1, 1, 0.8, 0],
              }
            ) : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full relative origin-center"
          >
            {type === 'plane' && (
              <input
                type="text"
                placeholder="这封信的标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSending}
                maxLength={30}
                className="w-full bg-white/50 backdrop-blur-sm px-5 py-3 rounded-2xl border-2 border-primary/20 focus:border-primary outline-none mb-4 font-bold text-slate-800 transition-colors shadow-sm placeholder:text-slate-400 placeholder:font-normal"
              />
            )}
            {type === 'plane' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-primary/20 rounded-sm rotate-1 z-10"></div>
            )}
            <div className={`p-6 pt-10 shadow-xl transform rotate-1 relative overflow-hidden ${type === 'plane' ? 'bg-white sketch-border' : 'parchment-texture rounded-xl'}`}>
              {type === 'bottle' && (
                <div className="absolute -top-4 -left-4 w-12 h-12 opacity-20">
                  <Ship size={48} className="text-primary" />
                </div>
              )}
              <textarea 
                disabled={isSending}
                className="w-full min-h-[240px] border-none focus:ring-0 bg-transparent text-lg text-slate-700 placeholder:text-slate-400 font-medium resize-none leading-relaxed" 
                placeholder={type === 'bottle' ? '此刻你在想什么？将其封存在瓶中...' : '在贴纸上留下你的思绪...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                {type === 'bottle' ? (
                  <div className="mt-4 flex justify-end border-t border-slate-300/50 pt-4 w-full">
                    <span className="text-sm italic text-slate-400">—— 拾贝者</span>
                  </div>
                ) : (
                  <Edit2 size={32} className="text-primary/40" />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={isSending ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          className="mt-12 flex flex-col items-center"
        >
          <div className="w-full max-w-[280px] aspect-video mb-8 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full bg-primary/5 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img src={selectedImage} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full h-full justify-center">
                  <Camera size={48} className="text-primary/40" />
                  <span className="text-sm font-bold text-primary/60">点击添加图片</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleSend}
            disabled={isSending}
            className="group relative flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-lg font-bold">
              {type === 'bottle' ? '封存并投掷' : '折成纸飞机'}
            </span>
            {type === 'plane' ? <Send size={20} className="group-hover:translate-x-1 transition-transform" /> : <Droplets size={20} />}
          </button>
          <p className="mt-4 text-xs text-slate-400 italic">
            {type === 'bottle' ? '“ 大海会带走忧愁，留下温柔 ”' : '“ 随风潜入夜，润物细无声 ”'}
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
};

const SettingsPage = ({ onBack, user, onUpdateUser, onLogout }: { onBack: () => void, user: User, onUpdateUser: (user: User) => void, onLogout: () => void }) => {
  const [editingField, setEditingField] = useState<'name' | 'bio' | 'gender' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [cacheSize, setCacheSize] = useState('24.5MB');
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getGenderLabel = (g: string) => {
    switch (g) {
      case 'male': return '男';
      case 'female': return '女';
      case 'secret': return '保密';
      default: return '保密';
    }
  };

  const startEditing = (field: 'name' | 'bio' | 'gender', current: string) => {
    setEditingField(field);
    setEditValue(current);
  };

  const saveEdit = () => {
    if (editingField === 'name') onUpdateUser({ ...user, name: editValue });
    if (editingField === 'bio') onUpdateUser({ ...user, bio: editValue });
    if (editingField === 'gender') onUpdateUser({ ...user, gender: editValue as any });
    setEditingField(null);
  };

  const clearCache = () => {
    setCacheSize('0KB');
    alert('缓存已清除');
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-0 z-[120] bg-bg-light flex flex-col max-w-md mx-auto overflow-x-hidden watercolor-bg-settings"
    >
      {/* TopAppBar */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <button 
          onClick={onBack}
          className="text-primary flex size-12 shrink-0 items-center justify-center sketchy-border bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-white/70 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight flex-1 text-center mr-12">设置</h2>
      </div>

      <div className="px-4 py-6 space-y-8 notebook-line flex-1 overflow-y-auto no-scrollbar">
        {/* Personal Info Section */}
        <section>
          <h3 className="text-primary text-lg font-bold mb-4 flex items-center gap-2">
            <Edit2 size={16} />
            个人信息
          </h3>
          <div className="space-y-2">
            {/* Avatar Item */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-4 bg-white/60 p-4 rounded-xl border border-primary/10 backdrop-blur-sm cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4 flex-1">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 sketchy-border border-primary p-0.5 overflow-hidden" 
                  style={{ backgroundImage: `url(${user.avatar})` }}
                />
                <p className="text-slate-800 text-base font-medium">更换头像</p>
              </div>
              <div className="shrink-0">
                <ChevronRight size={20} className="text-slate-400" />
              </div>
            </div>
            {/* Row Items */}
            <div className="bg-white/60 rounded-xl border border-primary/10 backdrop-blur-sm divide-y divide-primary/5">
              <div 
                onClick={() => startEditing('name', user.name)}
                className="flex items-center gap-4 px-4 py-4 justify-between cursor-pointer active:bg-primary/5 transition-colors"
              >
                <p className="text-slate-800 text-base">昵称</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">{user.name}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
              <div 
                onClick={() => startEditing('gender', user.gender)}
                className="flex items-center gap-4 px-4 py-4 justify-between cursor-pointer active:bg-primary/5 transition-colors"
              >
                <p className="text-slate-800 text-base">性别</p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">{getGenderLabel(user.gender)}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
              <div 
                onClick={() => startEditing('bio', user.bio)}
                className="flex items-center gap-4 px-4 py-4 justify-between cursor-pointer active:bg-primary/5 transition-colors"
              >
                <p className="text-slate-800 text-base">个性签名</p>
                <div className="flex items-center gap-2 max-w-[60%]">
                  <span className="text-slate-500 text-sm truncate">{user.bio}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Security Section */}
        <section>
          <h3 className="text-primary text-lg font-bold mb-4 flex items-center gap-2">
            <Shield size={16} />
            账号安全
          </h3>
          <div className="bg-white/60 rounded-xl border border-primary/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-4 py-4 justify-between cursor-pointer active:bg-primary/5 transition-colors">
              <p className="text-slate-800 text-base">绑定邮箱</p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">{user.email || '未绑定'}</span>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Other Settings Section */}
        <section>
          <div className="bg-white/60 rounded-xl border border-primary/10 backdrop-blur-sm divide-y divide-primary/5">
            <div 
              onClick={clearCache}
              className="flex items-center gap-4 px-4 py-4 justify-between cursor-pointer active:bg-primary/5 transition-colors"
            >
              <p className="text-slate-800 text-base">清除缓存</p>
              <span className="text-slate-500 text-sm">{cacheSize}</span>
            </div>
            <div 
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-4 px-4 py-4 justify-between cursor-pointer active:bg-primary/5 transition-colors"
            >
              <p className="text-slate-800 text-base">关于我们</p>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <div className="pt-8 pb-12">
          <button 
            onClick={onLogout}
            className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl sketchy-border border-2 border-slate-800 shadow-[4px_4px_0px_0px_#5a4a42] active:translate-y-1 active:shadow-none transition-all"
          >
            退出登录
          </button>
          <p className="text-center text-slate-400 text-xs mt-6 italic">
            v2.4.0 • 愿生活如画般绚烂
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingField && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingField(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full bg-white rounded-2xl p-6 sketch-border shadow-2xl"
            >
              <h4 className="text-lg font-bold mb-4">
                修改{editingField === 'name' ? '昵称' : editingField === 'bio' ? '个性签名' : '性别'}
              </h4>
              
              {editingField === 'gender' ? (
                <div className="flex flex-col gap-3 mb-6">
                  {['male', 'female', 'secret'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setEditValue(g)}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${
                        editValue === g 
                          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                          : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {getGenderLabel(g)}
                    </button>
                  ))}
                </div>
              ) : (
                <input 
                  autoFocus
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-primary/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors mb-6"
                />
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingField(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={saveEdit}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full bg-white rounded-2xl p-8 sketch-border shadow-2xl text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center sketchy-border">
                  <Cloud size={40} className="text-primary" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">漫步云端</h4>
              <p className="text-primary font-medium mb-6">寻找那一抹诗意</p>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 mb-8">
                <p>“漫步云端”是一个致力于连接孤独灵魂的艺术社交平台。</p>
                <p>在这里，你可以将心事封存在漂流瓶中，或是折成纸飞机，让它们随风而去，寻找那个能听懂你的人。</p>
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LoginPage = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('https://picsum.photos/seed/new-user/200/200');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    const { data, error } = await signInWithPassword(email, password);
    if (error || !data.session) {
      setIsSubmitting(false);
      alert(`登录失败: ${error?.message ?? '账号或密码错误'}`);
      return;
    }
    await ensureProfileForCurrentUser();
    setIsSubmitting(false);
    onLogin();
  };

  const handleRegister = async () => {
    if (!nickname.trim() || !email.trim() || !password.trim() || confirmPassword.trim() === '') {
      alert('请填写完整的必填信息');
      return;
    }
    if (password.length < 6) {
      alert('密码至少需要6位');
      return;
    }
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await signUpWithPassword(email, password, nickname, avatarUrl);
    if (error) {
      setIsSubmitting(false);
      alert(`注册失败: ${error.message}`);
      return;
    }
    if (!data.session) {
      setIsSubmitting(false);
      alert('注册成功，请前往邮箱验证您的账号');
      return;
    }
    await ensureProfileForCurrentUser();
    setIsSubmitting(false);
    onLogin();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[200] font-display bg-background-light flex flex-col items-center justify-center p-6 watercolor-bg-login overflow-y-auto no-scrollbar"
    >
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-400 hover:text-primary transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-md flex flex-col items-center gap-8 py-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {mode === 'login' ? '开启治愈之旅' : '加入漫步云端'}
          </h1>
          <p className="text-slate-500 italic">绘出心中的那一抹暖色</p>
        </div>

        <div className="sticky-note-login w-full p-8 hand-drawn-border-login relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-primary/20 rotate-1"></div>
          <div className="space-y-6">
            
            {mode === 'register' && (
              <div className="flex flex-col items-center mb-6">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden cursor-pointer relative group sketchy-border border-primary/40 flex items-center justify-center"
                >
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">点击设置头像 (非必填)</p>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <UserIcon size={18} className="text-primary" />
                  昵称 <span className="text-red-400">*</span>
                </label>
                <input 
                  className="w-full bg-transparent border-b-2 border-[#897261]/30 focus:border-primary focus:ring-0 transition-colors py-2 px-1 text-slate-900 placeholder:text-slate-400 outline-none" 
                  placeholder="你想叫什么名字？" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-medium flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                邮箱 <span className="text-red-400">*</span>
              </label>
              <input 
                className="w-full bg-transparent border-b-2 border-[#897261]/30 focus:border-primary focus:ring-0 transition-colors py-2 px-1 text-slate-900 placeholder:text-slate-400 outline-none" 
                placeholder="请输入您的邮箱" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-medium flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                密码 <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full bg-transparent border-b-2 border-[#897261]/30 focus:border-primary focus:ring-0 transition-colors py-2 px-1 text-slate-900 placeholder:text-slate-400 outline-none"
                placeholder="请输入密码（不少于6位）"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-slate-700 text-sm font-medium flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary/70" />
                  确认密码 <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full bg-transparent border-b-2 border-[#897261]/30 focus:border-primary focus:ring-0 transition-colors py-2 px-1 text-slate-900 placeholder:text-slate-400 outline-none"
                  placeholder="请再次输入密码"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button 
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? '请稍候...' : mode === 'login' ? '登录' : '注册并登录'}
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setConfirmPassword('');
                }}
                className="text-primary/80 hover:text-primary text-sm font-medium underline underline-offset-4"
              >
                {mode === 'login' ? '还没账号？去注册' : '已有账号？去登录'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [user, setUser] = useState(MOCK_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    const handleSessionRefresh = async (s: Session | null) => {
      setSession(s);
      setIsLoggedIn(Boolean(s));
      if (s) {
        const profile = await getCurrentProfile();
        if (profile) {
          setUser({ ...MOCK_USER, ...profile } as User);
        }
      } else {
        setUser(MOCK_USER);
      }
    };

    getSession().then((s) => handleSessionRefresh(s));
    const { data } = supabaseAuth.auth.onAuthStateChange((_event, s) => {
      handleSessionRefresh(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoadingNotes(true);
        setNotesError(null);
        const remoteNotes = await fetchNotes({ limit: 50 }, session);
        setNotes(remoteNotes);
      } catch (e) {
        setNotesError('无法从服务器获取最新奇遇，已展示示例数据。');
        setNotes(MOCK_NOTES);
      } finally {
        setIsLoadingNotes(false);
      }
    };
    loadNotes();
  }, [session]);

  const handleSelectPostType = (type: 'bottle' | 'plane') => {
    setIsPostModalOpen(false);
    setActivePage(type === 'bottle' ? 'write-bottle' : 'write-plane');
  };

  const handlePageChange = (page: Page) => {
    if ((page === 'profile' || page === 'collection') && !isLoggedIn) {
      setActivePage('login');
    } else {
      setActivePage(page);
    }
  };

  const handleLogout = () => {
    signOut();
    setIsLoggedIn(false);
    setSession(null);
    setActivePage('home');
  };

  const handleToggleLike = async (note: Note) => {
    if (!session) {
      setActivePage('login');
      return;
    }
    if (note.likedByMe) {
      await unlikeNote(note.id, session);
    } else {
      await likeNote(note.id, session);
    }
    const latest = await fetchNotes({ limit: 50 }, session);
    setNotes(latest);
  };

  const handleToggleCollect = async (note: Note) => {
    if (!session) {
      setActivePage('login');
      return;
    }
    if (note.collectedByMe) {
      await uncollectNote(note.id, session);
    } else {
      await collectNote(note.id, session);
    }
    const latest = await fetchNotes({ limit: 50 }, session);
    setNotes(latest);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home': 
        return (
          <>
            <Home notes={notes} onToggleLike={handleToggleLike} onToggleCollect={handleToggleCollect} />
            {isLoadingNotes && (
              <p className="px-6 text-xs text-slate-400 mt-2">
                正在加载最新奇遇…
              </p>
            )}
            {notesError && (
              <p className="px-6 text-xs text-red-400 mt-2">
                {notesError}
              </p>
            )}
          </>
        );
      case 'discover': return <Discover notes={notes} onToggleCollect={handleToggleCollect} onToggleLike={handleToggleLike} onPickBottle={() => setActivePage('pick-bottle')} />;
      case 'collection': 
        return <Collection notes={notes} />;
      case 'profile':
        return <Profile user={user} notes={notes} session={session} onNavigateToSettings={() => setActivePage('settings')} onUpdateUser={setUser} />;
      case 'settings': return <SettingsPage user={user} onUpdateUser={setUser} onBack={() => setActivePage('profile')} onLogout={handleLogout} />;
      case 'login': return <LoginPage onLogin={() => { setIsLoggedIn(true); setActivePage('profile'); }} onBack={() => setActivePage('home')} />;
      case 'pick-bottle':
        return <PickBottlePage session={session} notes={notes} onBack={() => setActivePage('discover')} />;
      case 'write-bottle': 
        return (
          <WritePage 
            type="bottle" 
            session={session}
            onBack={() => setActivePage('home')} 
            onSend={(note) => {
              if (note) {
                setNotes((prev) => [note, ...prev]);
              }
              setActivePage('home');
            }} 
          />
        );
      case 'write-plane': 
        return (
          <WritePage 
            type="plane" 
            session={session}
            onBack={() => setActivePage('home')} 
            onSend={(note) => {
              if (note) {
                setNotes((prev) => [note, ...prev]);
              }
              setActivePage('home');
            }} 
          />
        );
      default: return <Home notes={notes} onToggleLike={handleToggleLike} onToggleCollect={handleToggleCollect} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-light max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>

      {!activePage.startsWith('write') && activePage !== 'settings' && activePage !== 'login' && (
        <BottomNav 
          activePage={activePage} 
          onPageChange={handlePageChange} 
          onAddClick={() => setIsPostModalOpen(true)}
        />
      )}

      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onSelect={handleSelectPostType}
      />
    </div>
  );
}
