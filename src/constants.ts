import { Note, User } from './types';

export const MOCK_USER: User = {
  name: "小画家笔墨",
  id: "8829401",
  bio: "用画笔记录生活中的每一刻",
  avatar: "https://picsum.photos/seed/artist/200/200",
  gender: 'secret',
  bottlesSent: 12,
  planesFlown: 45
};

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    type: 'bottle',
    content: '夏日海边的信',
    date: '2023.08.15',
    imageUrl: 'https://picsum.photos/seed/sea/400/400',
    location: '大西洋 · 漂流中'
  },
  {
    id: '2',
    type: 'plane',
    content: '星空下的告白',
    date: '2023.07.22',
    imageUrl: 'https://picsum.photos/seed/stars/400/400',
    location: '3小时前 · 飞行中'
  },
  {
    id: '3',
    type: 'bottle',
    content: '午后蝉鸣',
    date: '2023.06.10',
    imageUrl: 'https://picsum.photos/seed/summer/400/400'
  },
  {
    id: '4',
    type: 'plane',
    content: '旧时光的信',
    date: '2023.05.04',
    imageUrl: 'https://picsum.photos/seed/vintage/400/400'
  }
];

export const DISCOVER_ITEMS = [
  {
    title: '瓶中信',
    description: '他在深蓝的海底，写给一个从未谋面的远方。',
    icon: 'bottle',
    image: 'https://picsum.photos/seed/bottle-art/300/400'
  },
  {
    title: '纸飞机',
    description: '逆风而行时，我终于听见了云朵的心事。',
    icon: 'plane',
    image: 'https://picsum.photos/seed/plane-art/300/300'
  },
  {
    title: '许愿瓶',
    description: '收集了一些碎掉的光，放在枕边陪我入梦。',
    icon: 'jar',
    image: 'https://picsum.photos/seed/jar-art/300/400'
  },
  {
    title: '天空来信',
    description: '那是被风吻过的笔迹，落在了谁的窗台？',
    icon: 'mail',
    image: 'https://picsum.photos/seed/mail-art/400/300'
  },
  {
    title: '随风羽毛',
    description: '轻得像一个没能实现的承诺，在空中起舞。',
    icon: 'feather',
    image: 'https://picsum.photos/seed/feather-art/300/500'
  },
  {
    title: '坠落之星',
    description: '它跨越了千万光年，只为跌入这一池春水。',
    icon: 'star',
    image: 'https://picsum.photos/seed/star-art/300/300'
  }
];
