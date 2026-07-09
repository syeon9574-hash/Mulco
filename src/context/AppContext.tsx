import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ChatRoom, ChatMessage, MarketItem, DmMessage } from '../types';
import { 
  mockUsers, 
  mockChatMessages, 
  mockBiologyItems, 
  mockGoodsItems, 
  mockDmMessages 
} from '../data/mockData';

import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

interface ToastInfo {
  id: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: Record<string, User>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  biologyItems: MarketItem[];
  setBiologyItems: React.Dispatch<React.SetStateAction<MarketItem[]>>;
  goodsItems: MarketItem[];
  setGoodsItems: React.Dispatch<React.SetStateAction<MarketItem[]>>;
  dmMessages: Record<string, DmMessage[]>;
  setDmMessages: React.Dispatch<React.SetStateAction<Record<string, DmMessage[]>>>;
  blockedUsers: string[];
  toggleBlockUser: (userId: string) => void;
  showToast: (message: string) => void;
  toasts: ToastInfo[];
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Record<string, User>>(mockUsers);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [biologyItems, setBiologyItems] = useState<MarketItem[]>(mockBiologyItems);
  const [goodsItems, setGoodsItems] = useState<MarketItem[]>(mockGoodsItems);
  const [dmMessages, setDmMessages] = useState<Record<string, DmMessage[]>>(mockDmMessages);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['u004']);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Load user from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('mulco_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch (e) {
        console.error('Failed to parse user from storage', e);
        localStorage.removeItem('mulco_user');
      }
    }
  }, []);

  // Listen to users collection on Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const dbUsers: Record<string, User> = {};
      snapshot.forEach((doc) => {
        dbUsers[doc.id] = doc.data() as User;
      });
      setUsers(prev => ({
        ...prev,
        ...dbUsers
      }));
    }, (error) => {
      console.warn("Firestore user sync disabled or failed: ", error);
    });
    return () => unsub();
  }, []);

  // Save current user profile to Firestore
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.user_id);
      setDoc(userRef, currentUser, { merge: true }).catch(err => {
        console.warn("Failed to sync current user profile to Firestore: ", err);
      });
    }
  }, [currentUser]);

  // Synchronize neighbors' regions with current user's region
  useEffect(() => {
    if (currentUser?.region) {
      setUsers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(uid => {
          if (uid !== currentUser.user_id) {
            next[uid] = {
              ...next[uid],
              region: currentUser.region
            };
          }
        });
        return next;
      });
    }
  }, [currentUser?.region]);

  const toggleBlockUser = (userId: string) => {
    const target = users[userId];
    if (!target) return;

    setBlockedUsers(prev => {
      const index = prev.indexOf(userId);
      if (index !== -1) {
        const next = [...prev];
        next.splice(index, 1);
        showToast(`✅ ${target.nickname}님의 차단을 해제했습니다.`);
        return next;
      } else {
        showToast(`🚫 ${target.nickname}님을 차단했습니다. 이제 이웃의 글과 메시지가 보이지 않습니다.`);
        return [...prev, userId];
      }
    });
  };

  const showToast = (message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const logout = () => {
    localStorage.removeItem('mulco_user');
    setCurrentUser(null);
    showToast('로그아웃되었습니다. 첫 화면으로 이동합니다. 👋');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      setUsers,
      messages,
      setMessages,
      biologyItems,
      setBiologyItems,
      goodsItems,
      setGoodsItems,
      dmMessages,
      setDmMessages,
      blockedUsers,
      toggleBlockUser,
      showToast,
      toasts,
      logout
    }}>
      {children}
      {/* Global Toast Render */}
      <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'rgba(44, 44, 44, 0.88)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            animation: 'slideUp 0.25s ease',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
