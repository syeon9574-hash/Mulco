import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { BottomSheet } from '../components/common/BottomSheet';
import { ChatBubble } from '../components/chat/ChatMessage';
import { MarketCard } from '../components/chat/MarketCard';
import { MarketItem, ChatMessage } from '../types';
import { getCurrentTime, resizeAndCompressImage } from '../utils/format';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const TabBar = styled.nav`
  height: 48px;
  background-color: ${props => props.theme.colors.bg};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  display: flex;
  position: sticky;
  top: 56px;
  z-index: 99;
`;

const TabBtn = styled.button<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${props => (props.active ? props.theme.colors.text : props.theme.colors.text + '80')};
  border-bottom: 2.5px solid ${props => (props.active ? props.theme.colors.point : 'transparent')};
  transition: ${props => props.theme.transitions.default};
`;

const TabWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const TabContent = styled.div<{ active: boolean }>`
  display: ${props => (props.active ? 'flex' : 'none')};
  flex-direction: column;
  height: 100%;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 80px;
  background-color: ${props => props.theme.colors.bg};
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 0.72rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.4;
  margin: 12px 0 20px;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 25%;
    height: 1px;
    background-color: ${props => props.theme.colors.muted};
  }
  &::before { left: 8px; }
  &::after { right: 8px; }
`;

const AdBanner = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-top: 1px solid ${props => props.theme.colors.muted};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  padding: 8px 16px;
  font-size: 0.76rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text};
  line-height: 1.3;
  z-index: 10;
`;

const AdLabel = styled.span`
  background-color: ${props => props.theme.colors.sub};
  color: #2e6a4f;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1.5px 5px;
  border-radius: 4px;
`;

const ChatInputBar = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-top: 1px solid ${props => props.theme.colors.muted};
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
`;

const ChatInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.bg};
  border: 1px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 16px;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const SendBtn = styled.button`
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.circle};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MarketGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 80px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background-color: ${props => props.theme.colors.bg};
  align-content: start;
`;

const Fab = styled.button`
  position: absolute;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.circle};
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  box-shadow: 0 4px 16px rgba(58, 96, 115, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 98;
  transition: ${props => props.theme.transitions.default};

  &:active {
    transform: scale(0.95);
  }
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  background: transparent;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;

  span {
    color: ${props => props.theme.colors.point};
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ImageUploadTrigger = styled.div`
  width: 100%;
  aspect-ratio: 3/2;
  background: #f8f9fa;
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${props => props.theme.colors.text + 'AA'};
  border: 1.8px dashed ${props => props.theme.colors.muted};
  overflow: hidden;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0.6;
`;

const ModalInput = styled.input`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 14px;
  font-size: 0.88rem;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const ModalTextarea = styled.textarea`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 14px;
  font-size: 0.88rem;
  resize: none;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const ModalBtn = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.86rem;
  border: 1.5px solid ${props => (props.selected ? props.theme.colors.point : props.theme.colors.muted)};
  background-color: ${props => (props.selected ? props.theme.colors.point : props.theme.colors.white)};
  color: ${props => (props.selected ? props.theme.colors.white : props.theme.colors.text)};
  transition: ${props => props.theme.transitions.default};
`;

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.default};
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  box-shadow: 0 4px 12px rgba(58, 96, 115, 0.15);
  margin-top: 8px;

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GpsHintText = styled.p`
  font-size: 0.76rem;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
  margin-top: -2px;
  margin-bottom: 18px;
  line-height: 1.45;
  padding: 0 4px;
`;

const LobbyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.colors.bg};
`;

const LobbyHeader = styled.header`
  height: 56px;
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1.5px solid ${props => props.theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LobbyHeaderTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.point};
`;

const LobbyLogoutBtn = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
`;

const LobbyHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LobbyHeaderBtn = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:active {
    opacity: 0.7;
  }
`;

const LobbyContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LobbySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LobbySectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LobbySectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const LobbyAddBtn = styled.button`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${props => props.theme.colors.point};
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RoomCard = styled.div<{ registered?: boolean }>`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.registered ? props.theme.colors.main : props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);

  &:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: ${props => props.theme.colors.point};
  }
`;

const RoomDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RoomIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.sub};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const RoomText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RoomName = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const RoomMembers = styled.span`
  font-size: 0.76rem;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
`;

const EnterArrow = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.colors.point};
  opacity: 0.7;
`;

const LockCard = styled(RoomCard)`
  border: 1.5px dashed ${props => props.theme.colors.muted};
  background-color: rgba(240, 240, 240, 0.3);
  cursor: not-allowed;

  &:hover {
    transform: none;
    box-shadow: none;
    border-color: ${props => props.theme.colors.muted};
  }
`;

const LockDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.6;
`;

const LockText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LockTitle = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const LockBadge = styled.span`
  font-size: 0.68rem;
  background-color: #ffd700;
  color: #5d4d00;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 4px;
  width: fit-content;
`;

const AddRegionModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const AddRegionModalContent = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 360px;
  padding: 24px;
  box-sizing: border-box;
  animation: slideUp 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
`;

const ModalTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
`;

const SearchBtn = styled.button`
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.point};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.88rem;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

  &:active {
    background-color: #FFCDD9;
  }
`;

const autoReplies = [
  { user_id: 'u002', content: '저도 궁금했던 내용이에요 😊' },
  { user_id: 'u003', content: '오 정보 감사해요! 도움 됩니다 🌿' },
  { user_id: 'u005', content: '맞아요 저도 그렇게 하고 있어요 👍' },
  { user_id: 'u004', content: '알려주셔서 감사해요! 초보라 모르는 게 많아요 😅' },
];

const popularRooms = [
  { name: '서울특별시', count: 184, emoji: '🏙️' },
  { name: '경기도 성남시', count: 96, emoji: '🌿' },
  { name: '경기도 수원시', count: 72, emoji: '🏰' },
  { name: '인천광역시', count: 54, emoji: '⚓' },
  { name: '대구광역시', count: 48, emoji: '🍎' },
  { name: '부산광역시', count: 82, emoji: '🌊' }
];

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    setCurrentUser,
    logout, 
    messages, 
    setMessages, 
    biologyItems, 
    setBiologyItems, 
    goodsItems, 
    setGoodsItems, 
    users, 
    blockedUsers,
    showToast 
  } = useApp();

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isAddRegionModalOpen, setIsAddRegionModalOpen] = useState(false);
  const [newRegionQuery, setNewRegionQuery] = useState('');
  const [searchRegionsResult, setSearchRegionsResult] = useState<string[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState<'all-chat' | 'biology' | 'goods'>('all-chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPhotoOptionOpen, setIsPhotoOptionOpen] = useState(false);

  // Post form states
  const [postTradeType, setPostTradeType] = useState<'GIVE' | 'TAKE'>('GIVE');
  const [postTitle, setPostTitle] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postImageBase64, setPostImageBase64] = useState<string | null>(null);
  const [postAgree, setPostAgree] = useState(false);

  const [chatText, setChatText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const [roomBiologyItems, setRoomBiologyItems] = useState<MarketItem[]>([]);
  const [roomGoodsItems, setRoomGoodsItems] = useState<MarketItem[]>([]);

  const userRegions = currentUser?.regions || (currentUser?.region ? [currentUser.region] : []);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Firestore real-time listener for selectedRoom
  useEffect(() => {
    if (!selectedRoom) return;

    // Listen to chatMessages (limit to latest 50 to protect free quota)
    const qMessages = query(
      collection(db, 'chatMessages'),
      where('region', '==', selectedRoom),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to mock data for selectedRoom
        const defaultMsgs = messages.filter(msg => {
          const msgUser = users[msg.user_id] || (msg.user_id === currentUser?.user_id ? currentUser : null);
          return msgUser?.region === selectedRoom;
        });
        setRoomMessages(defaultMsgs);
      } else {
        const msgs: ChatMessage[] = [];
        snapshot.forEach(doc => {
          msgs.push({ message_id: doc.id, ...doc.data() } as ChatMessage);
        });
        // Sort by timestamp asc (chronological display order)
        msgs.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
        setRoomMessages(msgs);
      }
    }, (err) => {
      console.warn("Firestore messages fetch failed, using fallback: ", err);
    });

    // Listen to marketItems
    const qMarket = query(collection(db, 'marketItems'), where('region', '==', selectedRoom));
    const unsubMarket = onSnapshot(qMarket, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to mock data
        const defaultBio = biologyItems.filter(item => {
          const itemUser = users[item.user_id] || (item.user_id === currentUser?.user_id ? currentUser : null);
          return itemUser?.region === selectedRoom;
        });
        const defaultGoods = goodsItems.filter(item => {
          const itemUser = users[item.user_id] || (item.user_id === currentUser?.user_id ? currentUser : null);
          return itemUser?.region === selectedRoom;
        });
        setRoomBiologyItems(defaultBio);
        setRoomGoodsItems(defaultGoods);
      } else {
        const bios: MarketItem[] = [];
        const goods: MarketItem[] = [];
        snapshot.forEach(doc => {
          const data = { item_id: doc.id, ...doc.data() } as MarketItem;
          if (data.category === 'BIOLOGY') {
            bios.push(data);
          } else {
            goods.push(data);
          }
        });
        // Sort by created_at desc (latest first)
        bios.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        goods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRoomBiologyItems(bios);
        setRoomGoodsItems(goods);
      }
    }, (err) => {
      console.warn("Firestore marketItems fetch failed, using fallback: ", err);
    });

    return () => {
      unsubMessages();
      unsubMarket();
    };
  }, [selectedRoom, messages, biologyItems, goodsItems, users, currentUser]);

  // Scroll to bottom on messages load
  useEffect(() => {
    if (currentTab === 'all-chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [roomMessages, currentTab]);

  const handleSendMessage = () => {
    if (!chatText.trim() || !currentUser || !selectedRoom) return;

    const newMsg = {
      user_id: currentUser.user_id,
      type: 'mine',
      content: chatText.trim(),
      time: getCurrentTime(),
      timestamp: Date.now(),
      region: selectedRoom
    };

    addDoc(collection(db, 'chatMessages'), newMsg).catch(err => {
      console.error("Failed to send message: ", err);
      showToast('❌ 메시지 전송에 실패했습니다.');
    });
    setChatText('');

    // Simulate Reply (Only in test/demo mode)
    if (currentUser.user_id.startsWith('test_')) {
      setTimeout(() => {
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        if (blockedUsers.includes(reply.user_id)) return; // Don't show from blocked users

        const botMsg = {
          user_id: reply.user_id,
          type: 'other',
          content: reply.content,
          time: getCurrentTime(),
          timestamp: Date.now(),
          region: selectedRoom
        };
        addDoc(collection(db, 'chatMessages'), botMsg).catch(err => {
          console.error("Failed to send mock reply: ", err);
        });
      }, 1200);
    }
  };

  const handleCompleteItem = (itemId: string, category: 'BIOLOGY' | 'GOODS') => {
    // If it's a Firestore item (does not start with 'item_'), update Firestore doc status
    if (!itemId.startsWith('item_')) {
      const itemRef = doc(db, 'marketItems', itemId);
      updateDoc(itemRef, { status: 'COMPLETED' }).then(() => {
        showToast('🎉 거래 완료 상태로 변경되었습니다!');
      }).catch(err => {
        console.error("Failed to update Firestore item status: ", err);
        showToast('❌ 상태 변경에 실패했습니다.');
      });
    } else {
      // Fallback for mock local items
      const setter = category === 'BIOLOGY' ? setBiologyItems : setGoodsItems;
      setter(prev => prev.map(item => {
        if (item.item_id === itemId) {
          return { ...item, status: 'COMPLETED' };
        }
        return item;
      }));
      showToast('🎉 거래 완료 상태로 변경되었습니다!');
    }
  };

  const triggerFileSelect = () => {
    setIsPhotoOptionOpen(false);
    fileInputRef.current?.click();
  };

  const triggerCameraSelect = () => {
    setIsPhotoOptionOpen(false);
    cameraInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('📸 이미지 압축 중...');
      resizeAndCompressImage(file, 800, 800, 0.7, (base64) => {
        setPostImageBase64(base64);
        showToast('📸 업로드 완료!');
      });
    } catch (err) {
      console.error(err);
      showToast('❌ 이미지 처리에 실패했어요.');
    }
  };

  const handleCreatePost = () => {
    if (!postTitle.trim() || !postDesc.trim() || !currentUser || !selectedRoom) {
      showToast('제목과 내용을 적어주세요.');
      return;
    }

    if (!postAgree) {
      showToast('⚠️ 생물 분양 준수사항에 동의해 주세요.');
      return;
    }

    const priceNum = postPrice.trim() ? parseInt(postPrice.replace(/[^0-9]/g, '')) : 0;
    const category = currentTab === 'biology' ? 'BIOLOGY' : 'GOODS';

    const newItem = {
      user_id: currentUser.user_id,
      category,
      trade_type: postTradeType,
      title: postTitle.trim(),
      price: priceNum,
      emoji: category === 'BIOLOGY' ? (postTradeType === 'GIVE' ? '🐠' : '🔍') : '⚙️',
      description: postDesc.trim(),
      image_base64: postImageBase64 || null,
      status: 'AVAILABLE',
      created_at: new Date().toISOString().split('T')[0],
      region: selectedRoom,
      timestamp: Date.now()
    };

    // Add to Firestore
    addDoc(collection(db, 'marketItems'), newItem).then(() => {
      // Reset Form & Close
      setPostTitle('');
      setPostPrice('');
      setPostDesc('');
      setPostImageBase64(null);
      setPostAgree(false);
      setIsPostModalOpen(false);
      showToast('✅ 등록되었습니다!');
    }).catch(err => {
      console.error("Failed to create post in Firestore: ", err);
      showToast('❌ 등록에 실패했습니다.');
    });
  };

  const handleEnterRoom = (roomName: string) => {
    if (!currentUser) return;
    
    // Sync current user region in AppContext (automatically syncs neighbors' mock data region)
    const updatedUser = {
      ...currentUser,
      region: roomName
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('mulco_user', JSON.stringify(updatedUser));
    
    setSelectedRoom(roomName);
    showToast(`📍 ${roomName} 방에 입장했습니다.`);
  };

  const handleAddRegion = (regionName: string) => {
    if (!currentUser) return;
    
    if (userRegions.includes(regionName)) {
      showToast('이미 등록된 동네입니다.');
      return;
    }
    
    if (userRegions.length >= 2) {
      showToast('🔒 3개 이상 지역 등록은 프리미엄 멤버십 기능입니다.');
      return;
    }
    
    const updatedUser = {
      ...currentUser,
      regions: [...userRegions, regionName]
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('mulco_user', JSON.stringify(updatedUser));
    
    showToast(`✅ '${regionName}' 동네가 추가되었습니다.`);
    setIsAddRegionModalOpen(false);
    setNewRegionQuery('');
    setSearchRegionsResult([]);
  };

  const handleSearchNewRegion = async () => {
    if (!newRegionQuery.trim()) {
      showToast('검색어를 입력해 주세요.');
      return;
    }

    setIsSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newRegionQuery.trim())}&accept-language=ko&addressdetails=1&countrycodes=kr`
      );
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();

      if (data.length === 0) {
        showToast('검색 결과가 없습니다.');
        setSearchRegionsResult([]);
        return;
      }

      const formattedList = data.map((item: any) => {
        const addr = item.address;
        const city = addr.city || addr.town || addr.province || addr.state || '';
        const county = addr.county || addr.borough || addr.district || '';
        
        const cleanCity = city.trim();
        const cleanCounty = county.trim();
        
        if (cleanCity.includes('특별시') || cleanCity.includes('광역시') || cleanCity.includes('특별자치시')) {
          return cleanCity;
        } else if (cleanCity && cleanCounty) {
          return `${cleanCity} ${cleanCounty}`;
        } else if (cleanCity) {
          return cleanCity;
        } else {
          return item.display_name.split(',')[0];
        }
      });

      const uniqueList = formattedList.filter((v: string, i: number, a: string[]) => v && a.indexOf(v) === i);
      setSearchRegionsResult(uniqueList);
    } catch (err) {
      console.error(err);
      showToast('검색에 실패했습니다.');
    } finally {
      setIsSearchLoading(false);
    }
  };

  const filteredMessages = roomMessages.filter(msg => {
    const isBlocked = blockedUsers.includes(msg.user_id);
    const msgUser = users[msg.user_id];
    const isBanned = msgUser?.status === 'BANNED';
    return !isBlocked && !isBanned;
  });
  const filteredBiology = roomBiologyItems.filter(item => {
    const isBlocked = blockedUsers.includes(item.user_id);
    const itemUser = users[item.user_id];
    const isBanned = itemUser?.status === 'BANNED';
    return !isBlocked && !isBanned;
  });
  const filteredGoods = roomGoodsItems.filter(item => {
    const isBlocked = blockedUsers.includes(item.user_id);
    const itemUser = users[item.user_id];
    const isBanned = itemUser?.status === 'BANNED';
    return !isBlocked && !isBanned;
  });

  // Render Lobby if no room is selected
  if (!selectedRoom) {
    return (
      <LobbyWrapper>
        <LobbyHeader>
          <LobbyHeaderTitle>물꼬 동네방 로비</LobbyHeaderTitle>
          <LobbyHeaderActions>
            <LobbyHeaderBtn onClick={() => navigate(`/profile/${currentUser?.user_id}`)}>
              <span className="ms" style={{ fontSize: '18px', color: 'var(--point)' }}>account_circle</span>
              내 프로필
            </LobbyHeaderBtn>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>|</span>
            <LobbyLogoutBtn onClick={logout}>로그아웃</LobbyLogoutBtn>
          </LobbyHeaderActions>
        </LobbyHeader>

        <LobbyContent>
          {/* 내 동네 목록 */}
          <LobbySection>
            <LobbySectionHeader>
              <LobbySectionTitle>내 동네방</LobbySectionTitle>
              <LobbyAddBtn onClick={() => {
                if (userRegions.length >= 2) {
                  showToast('🔒 3개 이상 지역 등록은 프리미엄 멤버십 기능입니다.');
                } else {
                  setIsAddRegionModalOpen(true);
                }
              }}>
                <span className="ms" style={{ fontSize: '16px' }}>add</span> 동네 추가하기
              </LobbyAddBtn>
            </LobbySectionHeader>

            {userRegions.map((regionName, idx) => {
              // Calculate mock counts
              const baseCount = regionName === '서울특별시' ? 184 : (regionName.includes('성남') ? 96 : 42);
              return (
                <RoomCard key={idx} registered onClick={() => handleEnterRoom(regionName)}>
                  <RoomDetails>
                    <RoomIcon>🏠</RoomIcon>
                    <RoomText>
                      <RoomName>{regionName} 방</RoomName>
                      <RoomMembers>👥 접속자 {baseCount}명</RoomMembers>
                    </RoomText>
                  </RoomDetails>
                  <EnterArrow>입장 →</EnterArrow>
                </RoomCard>
              );
            })}

            <LockCard onClick={() => {
              if (currentUser?.user_id.startsWith('test_')) {
                showToast('🔒 프리미엄 멤버십을 결제하시면 3개 이상의 동네를 제한 없이 설정할 수 있습니다! (추후 제공 예정)');
              } else {
                showToast('🔒 프리미엄 멤버십 전용 기능입니다. 멤버십을 구독하고 제한 없이 동네방에 참여해 보세요.');
              }
            }}>
              <LockDetails>
                <RoomIcon style={{ backgroundColor: '#FFF9E6' }}>🔒</RoomIcon>
                <LockText>
                  <LockTitle>3번째 동네 등록하기</LockTitle>
                  <LockBadge>PREMIUM</LockBadge>
                </LockText>
              </LockDetails>
              <span className="ms" style={{ color: '#E0E0DB' }}>lock</span>
            </LockCard>
          </LobbySection>

          {/* 전체 동네방 둘러보기 */}
          <LobbySection>
            <LobbySectionTitle>인기 동네방 둘러보기</LobbySectionTitle>
            {popularRooms.map((room, idx) => {
              const isRegistered = userRegions.includes(room.name);
              return (
                <RoomCard 
                  key={idx} 
                  onClick={() => {
                    if (isRegistered) {
                      handleEnterRoom(room.name);
                    } else {
                      showToast(`💡 이 방에 참여하려면 '내 동네 추가하기'로 먼저 등록해 주세요!`);
                    }
                  }}
                  style={{ opacity: isRegistered ? 1 : 0.7 }}
                >
                  <RoomDetails>
                    <RoomIcon>{room.emoji}</RoomIcon>
                    <RoomText>
                      <RoomName>{room.name} 방</RoomName>
                      <RoomMembers>👥 접속자 {room.count}명</RoomMembers>
                    </RoomText>
                  </RoomDetails>
                  {isRegistered ? (
                    <EnterArrow>입장 →</EnterArrow>
                  ) : (
                    <span className="ms" style={{ fontSize: '18px', color: '#E0E0DB' }}>add_circle</span>
                  )}
                </RoomCard>
              );
            })}
          </LobbySection>
        </LobbyContent>

        {/* 동네 추가 모달 */}
        {isAddRegionModalOpen && (
          <AddRegionModalOverlay onClick={() => setIsAddRegionModalOpen(false)}>
            <AddRegionModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>새 동네 추가 (최대 2개 무료)</ModalTitle>
                <CloseBtn onClick={() => setIsAddRegionModalOpen(false)}>×</CloseBtn>
              </ModalHeader>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <ModalInput 
                  style={{ flex: 1 }}
                  placeholder="예: 서울, 성남, 부산" 
                  value={newRegionQuery}
                  onChange={e => setNewRegionQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSearchNewRegion();
                  }}
                />
                <SearchBtn onClick={handleSearchNewRegion} disabled={isSearchLoading}>
                  {isSearchLoading ? '검색...' : '검색'}
                </SearchBtn>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchRegionsResult.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleAddRegion(res)}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid #E0E0DB'
                    }}
                  >
                    📍 {res} 추가하기
                  </div>
                ))}
                {searchRegionsResult.length === 0 && !isSearchLoading && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8c8c8c', padding: '16px 0' }}>
                    추가할 동네의 시/군 이름을 검색해 주세요.
                  </div>
                )}
              </div>
            </AddRegionModalContent>
          </AddRegionModalOverlay>
        )}
      </LobbyWrapper>
    );
  }

  return (
    <Container>
      <Header 
        title={`${selectedRoom} 방`} 
        onBack={() => setSelectedRoom(null)}
        onMenu={() => setIsMenuOpen(true)}
      />

      <TabBar role="tablist">
        <TabBtn 
          active={currentTab === 'all-chat'} 
          onClick={() => setCurrentTab('all-chat')}
        >
          💬 전체
        </TabBtn>
        <TabBtn 
          active={currentTab === 'biology'} 
          onClick={() => setCurrentTab('biology')}
        >
          🐟 생물 분양
        </TabBtn>
        <TabBtn 
          active={currentTab === 'goods'} 
          onClick={() => setCurrentTab('goods')}
        >
          🌿 용품·수초
        </TabBtn>
      </TabBar>

      <TabWrapper>
        {/* Tab 1: Chatting */}
        <TabContent active={currentTab === 'all-chat'}>
          <ChatContainer ref={chatContainerRef}>
            <DateDivider>2026년 7월 5일</DateDivider>
            {filteredMessages.map(msg => (
              <ChatBubble 
                key={msg.message_id}
                message={msg}
                isMe={msg.user_id === currentUser?.user_id}
                sender={users[msg.user_id] || currentUser}
                onAvatarClick={() => navigate(`/profile/${msg.user_id}`)}
              />
            ))}
          </ChatContainer>

          <AdBanner>
            <AdLabel>광고</AdLabel>
            <span>물생활 전문 쇼핑몰 '아쿠아팜' — 물꼬 회원 10% 할인</span>
          </AdBanner>

          <ChatInputBar>
            <ChatInput 
              placeholder="메시지를 입력하세요..." 
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <SendBtn onClick={handleSendMessage} aria-label="전송">
              <span className="ms" style={{ fontSize: '18px' }}>send</span>
            </SendBtn>
          </ChatInputBar>
        </TabContent>

        {/* Tab 2: Biology Market */}
        <TabContent active={currentTab === 'biology'}>
          <MarketGrid>
            {filteredBiology.map(item => (
              <MarketCard 
                key={item.item_id}
                item={item}
                seller={users[item.user_id] || currentUser}
                isMine={item.user_id === currentUser?.user_id}
                onCompleteClick={(e) => {
                  e.stopPropagation();
                  handleCompleteItem(item.item_id, 'BIOLOGY');
                }}
                onCardClick={() => navigate(`/profile/${item.user_id}`)}
              />
            ))}
          </MarketGrid>
        </TabContent>

        {/* Tab 3: Goods Market */}
        <TabContent active={currentTab === 'goods'}>
          <MarketGrid>
            {filteredGoods.map(item => (
              <MarketCard 
                key={item.item_id}
                item={item}
                seller={users[item.user_id] || currentUser}
                isMine={item.user_id === currentUser?.user_id}
                onCompleteClick={(e) => {
                  e.stopPropagation();
                  handleCompleteItem(item.item_id, 'GOODS');
                }}
                onCardClick={() => navigate(`/profile/${item.user_id}`)}
              />
            ))}
          </MarketGrid>
        </TabContent>
      </TabWrapper>

      {currentTab !== 'all-chat' && (
        <Fab onClick={() => setIsPostModalOpen(true)} aria-label="게시글 작성">
          <span className="ms" style={{ fontSize: '28px' }}>add</span>
        </Fab>
      )}

      {/* Menu Drawer */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="더보기">
        <MenuItem onClick={() => { setIsMenuOpen(false); navigate(`/profile/${currentUser?.user_id}`); }}>
          <span className="ms">person</span> 내 프로필 보기
        </MenuItem>
        <MenuItem onClick={() => { setIsMenuOpen(false); logout(); }}>
          <span className="ms">logout</span> 로그아웃
        </MenuItem>
      </BottomSheet>

      {/* Write Post BottomSheet */}
      <BottomSheet 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        title={currentTab === 'biology' ? '🐟 생물 분양글 올리기' : '🌿 용품/수초 글 올리기'}
      >
        <InputGroup>
          <Label>거래 방식</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ModalBtn 
              selected={postTradeType === 'GIVE'} 
              onClick={() => setPostTradeType('GIVE')}
            >
              나눔/분양하기
            </ModalBtn>
            <ModalBtn 
              selected={postTradeType === 'TAKE'} 
              onClick={() => setPostTradeType('TAKE')}
            >
              찾아요/구해요
            </ModalBtn>
          </div>
        </InputGroup>

        <InputGroup>
          <Label>사진 등록 (선택)</Label>
          <ImageUploadTrigger onClick={() => setIsPhotoOptionOpen(true)}>
            {postImageBase64 ? (
              <img src={postImageBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <span className="ms" style={{ fontSize: '28px', marginBottom: '4px' }}>photo_camera</span>
                <span>사진 추가하기</span>
              </>
            )}
          </ImageUploadTrigger>
        </InputGroup>

        <InputGroup>
          <Label>글 제목</Label>
          <ModalInput 
            placeholder="제목을 입력해 주세요" 
            value={postTitle}
            onChange={e => setPostTitle(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>분양가 / 책임비 (원)</Label>
          <ModalInput 
            placeholder="무료 나눔은 비워두세요" 
            type="text"
            inputMode="numeric"
            value={postPrice}
            onChange={e => setPostPrice(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </InputGroup>

        <InputGroup>
          <Label>상세 설명</Label>
          <ModalTextarea 
            rows={4} 
            placeholder="생물의 종류, 건강 상태, 크기 및 직거래 약속 장소 등을 남겨주세요." 
            value={postDesc}
            onChange={e => setPostDesc(e.target.value)}
          />
        </InputGroup>

        <div style={{
          backgroundColor: 'var(--sub)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          lineHeight: '1.45',
          color: 'var(--text)',
          marginBottom: '16px',
          border: '1px solid var(--muted-dark)'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--point-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="ms" style={{ fontSize: '16px' }}>gavel</span> 안전한 생물 분양 준수사항
          </div>
          • 개, 고양이, 햄스터 등 6대 반려동물은 관련법상 개인 거래가 금지되어 물코에서 분양할 수 없습니다. (위반 시 제재)<br />
          • 물코는 <strong>관상어, 수초, 물생활 용품</strong> 거래만 허용합니다.<br />
          • 개인 간의 비상업적인 거래여야 하며, 거래 시 발생한 직거래 문제에 대해 물코는 책임을 지지 않습니다.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="checkbox" 
            id="postAgree" 
            checked={postAgree} 
            onChange={e => setPostAgree(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--point)' }} 
          />
          <label htmlFor="postAgree" style={{ fontSize: '0.84rem', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
            [필수] 위의 생물 분양 준수사항을 확인했으며 동의합니다.
          </label>
        </div>

        <PrimaryBtn onClick={handleCreatePost} style={{ marginTop: '16px' }}>
          등록 완료
        </PrimaryBtn>
      </BottomSheet>

      {/* Select Photo Option Sheet */}
      <BottomSheet 
        isOpen={isPhotoOptionOpen} 
        onClose={() => setIsPhotoOptionOpen(false)} 
        title="사진 추가"
      >
        <MenuItem onClick={triggerFileSelect}>
          <span className="ms">image</span> 앨범에서 선택
        </MenuItem>
        <MenuItem onClick={triggerCameraSelect}>
          <span className="ms">photo_camera</span> 카메라로 촬영
        </MenuItem>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleImageChange} 
        />
        <input 
          ref={cameraInputRef} 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleImageChange} 
        />
      </BottomSheet>
    </Container>
  );
};
