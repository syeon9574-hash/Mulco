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

const TabContent = styled.div<{ active: boolean }>`
  display: ${props => (props.active ? 'flex' : 'none')};
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
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
  border-radius: 3px;
  text-transform: uppercase;
`;

const ChatInputBar = styled.div`
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.bg};
  border-top: 1px solid ${props => props.theme.colors.muted};
  display: flex;
  gap: 8px;
  align-items: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;
`;

const ChatInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: 9999px;
  padding: 10px 16px;
  font-size: 0.88rem;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const SendBtn = styled.button`
  width: 38px;
  height: 38px;
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:active {
    opacity: 0.9;
  }
`;

const MarketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const Fab = styled.button`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.circle};
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const MenuItem = styled.button`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 16px;
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.92rem;
  font-weight: 700;
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
  gap: 8px;

  &:active {
    background-color: #f8f9fa;
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

const autoReplies = [
  { user_id: 'u002', content: '저도 궁금했던 내용이에요 😊' },
  { user_id: 'u003', content: '오 정보 감사해요! 도움 됩니다 🌿' },
  { user_id: 'u005', content: '맞아요 저도 그렇게 하고 있어요 👍' },
  { user_id: 'u004', content: '알려주셔서 감사해요! 초보라 모르는 게 많아요 😅' },
];

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
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

  const [chatText, setChatText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Scroll to bottom on messages load
  useEffect(() => {
    if (currentTab === 'all-chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentTab]);

  const handleSendMessage = () => {
    if (!chatText.trim() || !currentUser) return;

    const newMsg: ChatMessage = {
      message_id: 'new_' + Date.now(),
      user_id: currentUser.user_id,
      type: 'mine',
      content: chatText.trim(),
      time: getCurrentTime(),
    };

    setMessages(prev => [...prev, newMsg]);
    setChatText('');

    // Simulate Reply
    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      if (blockedUsers.includes(reply.user_id)) return; // Don't show from blocked users

      const autoMsg: ChatMessage = {
        message_id: 'auto_' + Date.now(),
        user_id: reply.user_id,
        type: 'other',
        content: reply.content,
        time: getCurrentTime(),
      };
      setMessages(prev => [...prev, autoMsg]);
    }, 1500 + Math.random() * 2000);
  };

  const handleCompleteItem = (itemId: string, category: 'BIOLOGY' | 'GOODS') => {
    const list = category === 'BIOLOGY' ? biologyItems : goodsItems;
    const setter = category === 'BIOLOGY' ? setBiologyItems : setGoodsItems;
    
    setter(prev => prev.map(item => {
      if (item.item_id === itemId) {
        return { ...item, status: 'COMPLETED' };
      }
      return item;
    }));

    // Trigger review modal for a random user (mock behavior)
    const otherUserIds = Object.keys(users).filter(id => id !== currentUser?.user_id);
    const targetUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];

    showToast('거래 상태가 완료로 변경되었습니다. 후기 팝업을 엽니다.');
    setTimeout(() => {
      navigate(`/profile/${targetUserId}?review=true`);
    }, 600);
  };

  const handleImageUpload = (file: File) => {
    resizeAndCompressImage(file, 600, 600, 0.7, (compressedBase64) => {
      setPostImageBase64(compressedBase64);
    });
  };

  const handlePostSubmit = () => {
    if (!postTitle.trim() || !currentUser) {
      showToast('제목을 입력해주세요');
      return;
    }

    const emojiMap = { GIVE: '🐠', TAKE: '🔍' };
    const newItem: MarketItem = {
      item_id: 'new_' + Date.now(),
      user_id: currentUser.user_id,
      category: currentTab === 'biology' ? 'BIOLOGY' : 'GOODS',
      trade_type: postTradeType,
      title: postTitle.trim(),
      price: parseInt(postPrice) || 0,
      emoji: emojiMap[postTradeType],
      description: postDesc.trim(),
      status: 'AVAILABLE',
      created_at: new Date().toISOString().split('T')[0],
      // image: postImageBase64 // Custom Image Support
    };

    // Store custom image in metadata if provided
    if (postImageBase64) {
      (newItem as any).image = postImageBase64;
    }

    const setter = currentTab === 'biology' ? setBiologyItems : setGoodsItems;
    setter(prev => [newItem, ...prev]);

    // Reset Form & Close
    setPostTitle('');
    setPostPrice('');
    setPostDesc('');
    setPostImageBase64(null);
    setIsPostModalOpen(false);
    showToast('✅ 등록되었습니다!');
  };

  const filteredMessages = messages.filter(msg => !blockedUsers.includes(msg.user_id));
  const filteredBiology = biologyItems.filter(item => !blockedUsers.includes(item.user_id));
  const filteredGoods = goodsItems.filter(item => !blockedUsers.includes(item.user_id));

  return (
    <Container>
      <Header 
        title={currentUser?.region + ' 물생활 단톡방'} 
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

      {/* Tab 1: Chatting */}
      <TabContent active={currentTab === 'all-chat'}>
        <ChatContainer>
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
          <div ref={chatEndRef} />
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

      {currentTab !== 'all-chat' && (
        <Fab onClick={() => setIsPostModalOpen(true)} aria-label="게시글 작성">
          <span className="ms" style={{ fontSize: '28px' }}>add</span>
        </Fab>
      )}

      {/* Menu Drawer */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="더보기">
        <MenuItem onClick={() => { setIsMenuOpen(false); navigate(`/profile/${currentUser?.user_id}`); }}>
          <span className="ms" style={{ fontSize: '20px' }}>person</span> 내 프로필 보기
        </MenuItem>
        <MenuItem onClick={() => { setIsMenuOpen(false); logout(); }} style={{ borderColor: 'var(--muted)' }}>
          <span className="ms" style={{ fontSize: '20px', color: 'var(--danger)' }}>logout</span> 로그아웃
        </MenuItem>
        <button 
          className="btn btn-main" 
          style={{ marginTop: '8px', height: '46px', width: '100%', borderRadius: '12px', background: 'var(--main)', color: 'var(--point)', fontWeight: 700 }} 
          onClick={() => setIsMenuOpen(false)}
        >
          닫기
        </button>
      </BottomSheet>

      {/* Write Post Modal */}
      <BottomSheet 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        title={currentTab === 'biology' ? '✍️ 생물 분양 등록하기' : '✍️ 용품·수초 등록하기'}
      >
        <InputGroup>
          <Label>분양 형태</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ModalBtn selected={postTradeType === 'GIVE'} onClick={() => setPostTradeType('GIVE')}>📤 보내요</ModalBtn>
            <ModalBtn selected={postTradeType === 'TAKE'} onClick={() => setPostTradeType('TAKE')}>📥 받아요</ModalBtn>
          </div>
        </InputGroup>

        <InputGroup>
          <Label>{currentTab === 'biology' ? '어종 / 생물명' : '품목 이름'}</Label>
          <ModalInput 
            placeholder={currentTab === 'biology' ? '예: 구피 치어, 안시 플레코...' : '예: 외부여과기, 자바모스...'} 
            value={postTitle}
            onChange={e => setPostTitle(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>책임비 / 가격 (0원 = 나눔)</Label>
          <ModalInput 
            type="number" 
            placeholder="0" 
            value={postPrice}
            onChange={e => setPostPrice(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>설명</Label>
          <ModalTextarea 
            rows={3} 
            placeholder="간단한 설명을 적어주세요..." 
            value={postDesc}
            onChange={e => setPostDesc(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>사진 등록 (선택)</Label>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            style={{ display: 'none' }}
            onChange={e => e.target.files && handleImageUpload(e.target.files[0])}
          />
          <input 
            type="file" 
            ref={cameraInputRef} 
            accept="image/*" 
            capture="environment" 
            style={{ display: 'none' }}
            onChange={e => e.target.files && handleImageUpload(e.target.files[0])}
          />

          <ImageUploadTrigger onClick={() => setIsPhotoOptionOpen(true)}>
            {postImageBase64 ? (
              <img src={postImageBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <span style={{ fontSize: '2rem', marginBottom: '4px' }}>📷</span>
                <span>터치해서 사진 올리기</span>
              </>
            )}
          </ImageUploadTrigger>
        </InputGroup>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', background: 'var(--point)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 700 }}
          onClick={handlePostSubmit}
        >
          등록하기
        </button>
      </BottomSheet>

      {/* Photo source bottom sheet */}
      <BottomSheet isOpen={isPhotoOptionOpen} onClose={() => setIsPhotoOptionOpen(false)} title="사진 등록 방식 선택">
        <MenuItem onClick={() => { setIsPhotoOptionOpen(false); fileInputRef.current?.click(); }}>
          <span className="ms" style={{ fontSize: '20px', color: 'var(--point)' }}>photo_library</span> 갤러리에서 선택하기
        </MenuItem>
        <MenuItem onClick={() => { setIsPhotoOptionOpen(false); cameraInputRef.current?.click(); }} style={{ borderColor: 'var(--muted)' }}>
          <span className="ms" style={{ fontSize: '20px', color: 'var(--point)' }}>photo_camera</span> 직접 카메라로 촬영하기
        </MenuItem>
        <button 
          className="btn btn-main" 
          style={{ marginTop: '8px', height: '46px', width: '100%', borderRadius: '12px', background: 'var(--main)', color: 'var(--point)', fontWeight: 700 }} 
          onClick={() => setIsPhotoOptionOpen(false)}
        >
          취소
        </button>
      </BottomSheet>
    </Container>
  );
};
