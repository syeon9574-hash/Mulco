import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { BottomSheet } from '../components/common/BottomSheet';
import { DmMessage } from '../types';
import { getCurrentTime } from '../utils/format';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: ${props => props.theme.colors.bg};
`;

const DmHeader = styled.header`
  height: 56px;
  background-color: ${props => props.theme.colors.bg};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 4px;
`;

const BackBtn = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text};
  border-radius: 50%;
  
  &:active {
    background-color: rgba(0,0,0,0.05);
  }
`;

const DmAvatar = styled.div<{ bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  filter: contrast(1.05);
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 4px;
`;

const UserName = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const UserRegion = styled.div`
  font-size: 0.68rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 1px;
`;

const MenuBtn = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text};
  border-radius: 50%;
  
  &:active {
    background-color: rgba(0,0,0,0.05);
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 80px;
`;

const BubbleRow = styled.div<{ isMe: boolean }>`
  display: flex;
  margin-bottom: 16px;
  justify-content: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
  animation: fadeIn 0.25s ease;
`;

const BubbleAvatar = styled.div<{ bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.bg};
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const BubbleContentCol = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 72%;
`;

const BubbleSenderName = styled.div`
  font-size: 0.72rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.7;
  margin-bottom: 4px;
`;

const BubbleWrap = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
`;

const BubbleText = styled.div<{ isMe: boolean }>`
  background-color: ${props => (props.isMe ? props.theme.colors.main : props.theme.colors.white)};
  color: ${props => props.theme.colors.text};
  padding: 10px 14px;
  border-radius: ${props => (props.isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px')};
  font-size: 0.86rem;
  line-height: 1.4;
  word-break: break-all;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const BubbleTime = styled.div`
  font-size: 0.65rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.5;
  white-space: nowrap;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:active {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  color: ${props => props.theme.colors.text};
  opacity: 0.45;
  text-align: center;
  gap: 12px;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
`;

const EmptyText = styled.div`
  font-size: 0.86rem;
  line-height: 1.4;
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

const dmAutoReplies = [
  '네 가능해요! 언제 편하세요?',
  '알겠어요 😊 오후 시간대 어떠세요?',
  '좋아요! 위치는 역삼역 근처로 할까요?',
  '네 확인했어요. 조금 이따 연락드릴게요!',
  '감사해요! 건강한 생물 보내드릴게요 🐟',
];

export const DMPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { 
    currentUser, 
    users, 
    dmMessages, 
    setDmMessages, 
    blockedUsers, 
    toggleBlockUser,
    showToast 
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const targetUser = users[userId || ''];

  const chatKey = [currentUser?.user_id || '', targetUser?.user_id || ''].sort().join('_');
  const [localDmMessages, setLocalDmMessages] = useState<DmMessage[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (!targetUser) {
      navigate('/main');
    }
  }, [currentUser, targetUser, navigate]);

  useEffect(() => {
    if (!currentUser || !targetUser) return;

    // Limit to latest 50 messages to protect free quota
    const q = query(
      collection(db, 'dmMessages'),
      where('chat_key', '==', chatKey),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to local mock data
        const fallback = dmMessages[targetUser.user_id] || [];
        setLocalDmMessages(fallback);
      } else {
        const msgs: DmMessage[] = [];
        snapshot.forEach(doc => {
          msgs.push({ message_id: doc.id, ...doc.data() } as DmMessage);
        });
        // Sort by timestamp asc (chronological display order)
        msgs.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
        
        // Map messages' type field based on sender_id
        const mappedMsgs = msgs.map(m => {
          const mData = m as any;
          return {
            ...m,
            type: mData.sender_id === currentUser.user_id ? 'mine' : 'other',
            user_id: mData.sender_id
          } as DmMessage;
        });

        setLocalDmMessages(mappedMsgs);
      }
    }, (err) => {
      console.warn("Firestore DMs fetch failed, using fallback: ", err);
    });

    return () => unsub();
  }, [currentUser, targetUser, chatKey, dmMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localDmMessages]);

  if (!targetUser) return null;

  const handleSendDM = () => {
    if (!chatText.trim() || !currentUser) return;

    const uId = targetUser.user_id;
    const newMsg = {
      sender_id: currentUser.user_id,
      receiver_id: uId,
      chat_key: chatKey,
      content: chatText.trim(),
      time: getCurrentTime(),
      timestamp: Date.now()
    };

    addDoc(collection(db, 'dmMessages'), newMsg).catch(err => {
      console.error("Failed to send DM: ", err);
      showToast('❌ 메시지 전송에 실패했습니다.');
    });
    setChatText('');

    // Trigger mock auto reply (Only in test/demo mode)
    if (currentUser?.user_id.startsWith('test_')) {
      setTimeout(() => {
        if (blockedUsers.includes(uId)) return;

        const reply = {
          sender_id: uId,
          receiver_id: currentUser.user_id,
          chat_key: chatKey,
          content: dmAutoReplies[Math.floor(Math.random() * dmAutoReplies.length)],
          time: getCurrentTime(),
          timestamp: Date.now()
        };

        addDoc(collection(db, 'dmMessages'), reply).catch(err => {
          console.error("Failed to send mock DM reply: ", err);
        });
      }, 1000 + Math.random() * 1500);
    }
  };

  const handleLeaveRoom = () => {
    showToast(`🚪 ${targetUser.nickname}님과의 대화방을 나갔습니다.`);
    navigate('/main');
  };

  const getAvatarBg = (user: any) => {
    if (!user?.avatar) return 'var(--main)';
    const avatarBgMap: Record<string, string> = {
      'images/avatar-girl.png': '#FFE5EC',
      'images/avatar-boy.png': '#E5F7FF',
      'images/avatar-woman.png': '#E5FAF0',
      'images/avatar-man.png': '#FFF5D1',
      'images/avatar-child.png': '#FFEAF0'
    };
    return avatarBgMap[user.avatar] || 'var(--main)';
  };

  const history = localDmMessages;
  const isBlocked = blockedUsers.includes(targetUser.user_id);

  return (
    <Container>
      <DmHeader>
        <BackBtn onClick={() => navigate(`/profile/${targetUser.user_id}`)} aria-label="뒤로가기">
          <span className="ms" style={{ fontSize: '24px' }}>chevron_left</span>
        </BackBtn>
        <DmAvatar bg={getAvatarBg(targetUser)}>
          {targetUser.avatar ? (
            <AvatarImage src={`/${targetUser.avatar}`} alt={targetUser.nickname} />
          ) : (
            targetUser.avatar_letter || targetUser.nickname.charAt(0)
          )}
        </DmAvatar>
        <UserInfo>
          <UserName>{targetUser.nickname}</UserName>
          <UserRegion>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {targetUser.region}
          </UserRegion>
        </UserInfo>
        <MenuBtn onClick={() => setIsMenuOpen(true)} title="설정">
          <span className="ms">more_horiz</span>
        </MenuBtn>
      </DmHeader>

      <ChatContainer>
        {history.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>{targetUser.nickname}님과의 첫 대화를 시작해보세요!</EmptyText>
          </EmptyState>
        ) : (
          history.map(msg => {
            const isMe = msg.user_id === currentUser?.user_id;
            const msgUser = isMe ? currentUser : targetUser;
            return (
              <BubbleRow key={msg.message_id} isMe={isMe}>
                {!isMe && (
                  <BubbleAvatar bg={getAvatarBg(targetUser)}>
                    {targetUser.avatar ? (
                      <AvatarImage src={`/${targetUser.avatar}`} alt={targetUser.nickname} />
                    ) : (
                      targetUser.avatar_letter || targetUser.nickname.charAt(0)
                    )}
                  </BubbleAvatar>
                )}
                <BubbleContentCol>
                  {!isMe && <BubbleSenderName>{targetUser.nickname}</BubbleSenderName>}
                  <BubbleWrap style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <BubbleText isMe={isMe}>{msg.content}</BubbleText>
                    <BubbleTime>{msg.time}</BubbleTime>
                  </BubbleWrap>
                </BubbleContentCol>
              </BubbleRow>
            );
          })
        )}
        <div ref={chatEndRef} />
      </ChatContainer>

      <ChatInputBar>
        <ChatInput 
          placeholder="메시지를 입력하세요..." 
          value={chatText}
          onChange={e => setChatText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSendDM();
            }
          }}
        />
        <SendBtn onClick={handleSendDM} aria-label="전송">
          <span className="ms" style={{ fontSize: '18px' }}>send</span>
        </SendBtn>
      </ChatInputBar>

      {/* DM settings bottom sheet */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="채팅방 설정">
        <MenuItem onClick={() => { setIsMenuOpen(false); navigate(`/profile/${targetUser.user_id}`); }}>
          <span className="ms" style={{ fontSize: '20px' }}>person</span> 상대방 프로필 보기
        </MenuItem>
        <MenuItem onClick={() => { setIsMenuOpen(false); toggleBlockUser(targetUser.user_id); }} style={{ borderColor: 'var(--muted)' }}>
          <span className="ms" style={{ fontSize: '20px', color: 'var(--danger)' }}>
            {isBlocked ? 'do_not_disturb_on' : 'block'}
          </span>
          {isBlocked ? '이웃 차단 해제' : '이웃 차단하기'}
        </MenuItem>
        <MenuItem onClick={() => { setIsMenuOpen(false); handleLeaveRoom(); }} style={{ borderColor: 'var(--muted)' }}>
          <span className="ms" style={{ fontSize: '20px', color: 'var(--text)' }}>logout</span> 대화방 나가기
        </MenuItem>
        <button 
          className="btn btn-main" 
          style={{ marginTop: '8px', height: '46px', width: '100%', borderRadius: '12px', background: 'var(--main)', color: 'var(--point)', fontWeight: 700 }} 
          onClick={() => setIsMenuOpen(false)}
        >
          닫기
        </button>
      </BottomSheet>
    </Container>
  );
};
