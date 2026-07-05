export interface User {
  user_id: string;
  nickname: string;
  phone_number?: string;
  region: string;
  profile_memo: string;
  created_at?: string;
  avatar_letter?: string;
  avatar: string;
  reviews?: Record<string, number>;
}

export interface ChatRoom {
  room_id: string;
  region_code: string;
  name: string;
  user_count: number;
}

export interface ChatMessage {
  message_id: string;
  user_id: string;
  type: 'mine' | 'other' | 'system';
  content: string;
  time: string;
}

export interface MarketItem {
  item_id: string;
  user_id: string;
  category: 'BIOLOGY' | 'GOODS';
  trade_type: 'GIVE' | 'TAKE';
  title: string;
  price: number;
  emoji: string;
  description: string;
  status: 'AVAILABLE' | 'COMPLETED';
  created_at: string;
}

export interface DmMessage {
  message_id: string;
  user_id: string;
  type: 'mine' | 'other';
  content: string;
  time: string;
}
