import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const quotes = [
  { content: '我跨越山海，只为能与你相遇。', author: '星空拾荒者' },
  { content: '心与心的距离，往往只差一封信。', author: '匿名' },
  { content: '即使在最黑的夜晚，也会有星星为你闪烁。', author: '夜航者' },
  { content: '有些话，只有写在风里，才能被懂得。', author: '风的声音' },
  { content: '所有的相遇，都是久别重逢。', author: '时间旅行者' },
  { content: '不要害怕孤独，因为大海包容一切。', author: '深海' },
  { content: '愿你的每一份心事，都能有回音。', author: '云端信使' },
  { content: '生命是一场漫长的漂流，偶尔停下来看看风景。', author: '拾贝人' }
];

async function seed() {
  // Clear existing quotes (optional, but good for reset)
  await supabase.from('daily_quotes').delete().neq('id', 0);

  const { data, error } = await supabase.from('daily_quotes').insert(quotes);
  if (error) {
    console.error('Error seeding quotes:', error);
  } else {
    console.log('Quotes seeded successfully!');
  }
}

seed();
