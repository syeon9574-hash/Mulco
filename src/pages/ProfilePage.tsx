import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { BottomSheet } from '../components/common/BottomSheet';
import { formatPrice } from '../utils/format';
import { User } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.bg};
  padding-bottom: 40px;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 24px 24px;
  gap: 10px;
  border-bottom: 1.5px solid ${props => props.theme.colors.muted};
`;

const ProfileAvatar = styled.div<{ bg?: string }>`
  width: 76px;
  height: 76px;
  border-radius: ${props => props.theme.borderRadius.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme.colors.point};
  background: ${props => props.bg || 'var(--main)'};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const ProfileName = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const ProfileRegion = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProfileMemo = styled.p`
  font-size: 0.88rem;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  line-height: 1.5;
  max-width: 280px;
`;

const ProfileSection = styled.section`
  padding: 16px 20px;
  border-bottom: 1.5px solid ${props => props.theme.colors.muted};
`;

const SectionTitle = styled.h3`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
`;

const BadgeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 9999px;
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.pointDark};
  font-size: 0.78rem;
  font-weight: 600;
  border: 1.5px solid transparent;
  user-select: none;
`;

const BadgeCount = styled.span`
  font-weight: 700;
  opacity: 0.8;
  font-size: 0.72rem;
`;

const HistoryItem = styled.div<{ completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 10px;
  box-shadow: ${props => props.theme.shadows.sm};
  opacity: ${props => (props.completed ? 0.75 : 1)};
`;

const HistoryEmoji = styled.div`
  font-size: 2.2rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HistoryBody = styled.div`
  flex: 1;
`;

const HistoryTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 3px;
`;

const HistoryMeta = styled.div<{ completed?: boolean }>`
  font-size: 0.76rem;
  font-weight: 500;
  color: ${props => (props.completed ? props.theme.colors.textLight : props.theme.colors.point)};
`;

const CompleteBtn = styled.button`
  padding: 4px 10px;
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    background-color: ${props => props.theme.colors.pointDark};
  }
`;

const ChatCtaBtn = styled.button`
  margin: 16px 20px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 700;
  box-shadow: ${props => props.theme.shadows.md};

  &:hover {
    background-color: ${props => props.theme.colors.pointDark};
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

const ReportLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.86rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  margin-bottom: 8px;
`;

const ModalTextarea = styled.textarea`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 14px;
  font-size: 0.88rem;
  resize: none;
  width: 100%;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
`;

const KeywordChip = styled.div<{ selected: boolean }>`
  padding: 10px 14px;
  border: 1.5px solid ${props => (props.selected ? props.theme.colors.point : props.theme.colors.muted)};
  border-radius: 9999px;
  font-size: 0.84rem;
  font-weight: 600;
  background-color: ${props => (props.selected ? props.theme.colors.sub : props.theme.colors.white)};
  color: ${props => (props.selected ? '#2e6a4f' : props.theme.colors.text)};
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 8px 0 18px;
`;

const AvatarOption = styled.div<{ selected: boolean; bg: string }>`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3.5px solid ${props => (props.selected ? props.theme.colors.point : 'transparent')};
  transition: ${props => props.theme.transitions.default};
  box-shadow: 0 4px 10px rgba(255,142,158,0.06);
  overflow: hidden;
`;

const AvatarImageOption = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  width: 100%;
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
  width: 100%;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
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

const avatarList = [
  { path: 'images/avatar-girl.png', title: '2030 여성', bg: '#FFE5EC' },
  { path: 'images/avatar-boy.png', title: '2030 남성', bg: '#E5F7FF' },
  { path: 'images/avatar-woman.png', title: '4050 여성', bg: '#E5FAF0' },
  { path: 'images/avatar-man.png', title: '4050 남성', bg: '#FFF5D1' },
  { path: 'images/avatar-child.png', title: '어린이', bg: '#FFEAF0' }
];

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentUser, 
    setCurrentUser,
    users, 
    setUsers, 
    biologyItems, 
    setBiologyItems, 
    goodsItems, 
    setGoodsItems, 
    blockedUsers, 
    toggleBlockUser,
    logout,
    showToast 
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [reportReason, setReportReason] = useState('업자/상업적 판매');
  const [reportDetail, setReportDetail] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Profile Edit states
  const [editNickname, setEditNickname] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [reportCount, setReportCount] = useState<number>(0);

  const targetUser = userId === currentUser?.user_id ? currentUser : users[userId || ''];

  useEffect(() => {
    if (!targetUser) {
      navigate('/main');
    }
  }, [targetUser, navigate]);

  // Fetch report history count from Firestore
  useEffect(() => {
    if (!targetUser) return;
    const q = query(
      collection(db, 'reports'),
      where('reported_user_id', '==', targetUser.user_id)
    );
    getDocs(q).then(snapshot => {
      const reporters = new Set();
      snapshot.forEach(doc => {
        reporters.add(doc.data().reporter_id);
      });
      setReportCount(reporters.size);
    }).catch(err => {
      console.warn("Failed to fetch reports count: ", err);
    });
  }, [targetUser]);

  // Sync profile edit states when targetUser changes or edit BottomSheet opens
  useEffect(() => {
    if (targetUser && isEditOpen) {
      setEditNickname(targetUser.nickname);
      setEditMemo(targetUser.profile_memo || '');
      setEditAvatar(targetUser.avatar);
    }
  }, [targetUser, isEditOpen]);

  // Open review modal if query param review=true is set
  useEffect(() => {
    if (searchParams.get('review') === 'true' && targetUser && targetUser.user_id !== currentUser?.user_id) {
      setIsReviewOpen(true);
    }
  }, [searchParams, targetUser, currentUser]);

  if (!targetUser) return null;

  const isMe = targetUser.user_id === currentUser?.user_id;

  const getAvatarBg = () => {
    if (!targetUser.avatar) return 'var(--main)';
    const avatarBgMap: Record<string, string> = {
      'images/avatar-girl.png': '#FFE5EC',
      'images/avatar-boy.png': '#E5F7FF',
      'images/avatar-woman.png': '#E5FAF0',
      'images/avatar-man.png': '#FFF5D1',
      'images/avatar-child.png': '#FFEAF0'
    };
    return avatarBgMap[targetUser.avatar] || 'var(--main)';
  };

  const handleCompleteItem = (itemId: string, category: 'BIOLOGY' | 'GOODS') => {
    const setter = category === 'BIOLOGY' ? setBiologyItems : setGoodsItems;
    setter(prev => prev.map(item => {
      if (item.item_id === itemId) {
        return { ...item, status: 'COMPLETED' };
      }
      return item;
    }));
    showToast('거래가 완료되었습니다.');
  };

  const handleReportSubmit = async () => {
    if (reportReason === '기타' && !reportDetail.trim()) {
      showToast('⚠️ 기타 상세 신고 사유를 입력해 주세요.');
      return;
    }

    if (!currentUser) return;

    const reportData = {
      reporter_id: currentUser.user_id,
      reported_user_id: targetUser.user_id,
      reason: reportReason,
      detail: reportDetail.trim(),
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, 'reports'), reportData);

      // Check unique reports
      const q = query(
        collection(db, 'reports'),
        where('reported_user_id', '==', targetUser.user_id)
      );
      const snapshot = await getDocs(q);
      const reporters = new Set();
      snapshot.forEach(doc => {
        reporters.add(doc.data().reporter_id);
      });

      const totalReviews = Object.values(targetUser.reviews || {}).reduce((sum: number, count: number) => sum + count, 0);
      const deductedAmount = Math.floor(totalReviews / 3);
      const activeReportCount = Math.max(0, reporters.size - deductedAmount);

      if (activeReportCount >= 5) {
        const userRef = doc(db, 'users', targetUser.user_id);
        await updateDoc(userRef, { status: 'BANNED' });
        showToast("⚠️ 해당 사용자가 신고 누적(매너 상쇄 후 5회 이상)으로 인해 자동 차단되었습니다.");
      } else {
        showToast(`🚨 ${targetUser.nickname}님에 대한 신고가 접수되었습니다.`);
      }
      setIsReportOpen(false);
      setReportDetail('');
    } catch (err) {
      console.error("Failed to submit report: ", err);
      showToast("❌ 신고 처리에 실패했습니다.");
    }
  };

  const handleAdminBanUser = async (userId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: 'BANNED' });
      showToast("🚫 운영자 권한으로 해당 사용자를 차단했습니다.");
    } catch (err) {
      console.error("Failed to ban user: ", err);
      showToast("❌ 차단 처리에 실패했습니다.");
    }
  };

  const handleReviewToggle = (keyword: string) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      }
      return [...prev, keyword];
    });
  };

  const handleReviewSubmit = () => {
    if (selectedKeywords.length === 0) {
      showToast('최소 1개 이상 선택해주세요');
      return;
    }

    setUsers(prev => {
      const target = prev[targetUser.user_id];
      if (!target) return prev;

      const currentReviews = target.reviews || {};
      const newReviews = { ...currentReviews };

      selectedKeywords.forEach(kw => {
        let matchedKey = '';
        for (const k of Object.keys(newReviews)) {
          if (kw.includes(k.replace('#', '')) || k.includes(kw.replace(/[\u{1F300}-\u{1FFFF}]|\s/gu, ''))) {
            matchedKey = k;
            break;
          }
        }

        if (matchedKey) {
          newReviews[matchedKey] = (newReviews[matchedKey] || 0) + 1;
        } else {
          const cleanKw = kw.replace(/[\u{1F300}-\u{1FFFF}]|\s/gu, '').trim();
          newReviews['#' + cleanKw] = 1;
        }
      });

      return {
        ...prev,
        [targetUser.user_id]: { ...target, reviews: newReviews }
      };
    });

    setIsReviewOpen(false);
    setSelectedKeywords([]);
    showToast('✅ 후기가 등록되었습니다!');
  };

  const handleEditSubmit = () => {
    if (editNickname.trim().length < 2) {
      showToast('닉네임은 2자 이상 입력해 주세요.');
      return;
    }

    const updatedUser: User = {
      ...targetUser,
      nickname: editNickname.trim(),
      profile_memo: editMemo.trim(),
      avatar: editAvatar
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('mulco_user', JSON.stringify(updatedUser));

    // Update global users mapping so it updates in chat list too
    setUsers(prev => ({
      ...prev,
      [updatedUser.user_id]: updatedUser
    }));

    setIsEditOpen(false);
    showToast('✅ 프로필 정보가 정상 수정되었습니다.');
  };

  const sortedReviews = Object.entries(targetUser.reviews || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const items = [
    ...biologyItems.filter(i => i.user_id === targetUser.user_id),
    ...goodsItems.filter(i => i.user_id === targetUser.user_id)
  ].slice(0, 3);

  const isBlocked = blockedUsers.includes(targetUser.user_id);

  // Offset reports by positive manner reviews (3 reviews offset 1 report)
  const totalReviews = Object.values(targetUser.reviews || {}).reduce((sum, count) => sum + count, 0);
  const deductedAmount = Math.floor(totalReviews / 3);
  const activeReportCount = Math.max(0, reportCount - deductedAmount);

  return (
    <Container>
      <Header 
        title="프로필" 
        onBack={() => navigate('/main')}
        onMenu={() => setIsMenuOpen(true)}
      />

      <ProfileHeader>
        <ProfileAvatar bg={getAvatarBg()}>
          {targetUser.avatar ? (
            <AvatarImage src={`/${targetUser.avatar}`} alt={targetUser.nickname} />
          ) : (
            targetUser.avatar_letter || targetUser.nickname.charAt(0)
          )}
        </ProfileAvatar>
        <ProfileName>
          {targetUser.nickname}
          {targetUser.status === 'BANNED' && (
            <span style={{ fontSize: '0.74rem', color: 'var(--white)', backgroundColor: 'var(--danger)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: '700' }}>
              영구 차단됨
            </span>
          )}
        </ProfileName>
        
        {/* Case 1: My Profile - Private Warning for 1+ active reports */}
        {isMe && activeReportCount > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#FFF8E6',
            color: '#D48806',
            fontSize: '0.74rem',
            fontWeight: '600',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            marginTop: '6px',
            border: '1px solid #FFE58F',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            <span className="ms" style={{ fontSize: '14px', color: '#D48806' }}>warning</span>
            이웃에게 {activeReportCount}회의 신고를 받았습니다. 매너 후기를 모아 상쇄할 수 있습니다.
          </div>
        )}

        {/* Case 2: Other's Profile - Public Warning Badge only for 3+ active reports */}
        {!isMe && activeReportCount >= 3 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#FFEAEA',
            color: '#FF4D4D',
            fontSize: '0.74rem',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '9999px',
            marginTop: '2px',
            border: '1.5px solid #FFAAAA'
          }}>
            <span className="ms" style={{ fontSize: '14px', color: '#FF4D4D' }}>warning</span>
            신고 이력 있음 (누적 {activeReportCount}회)
          </div>
        )}
        <ProfileRegion>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {targetUser.region}
        </ProfileRegion>
        <ProfileMemo>{targetUser.profile_memo}</ProfileMemo>
      </ProfileHeader>

      <ProfileSection>
        <SectionTitle>받은 후기</SectionTitle>
        <BadgeGrid>
          {sortedReviews.length === 0 ? (
            <p className="text-sm text-muted">아직 후기가 없어요.</p>
          ) : (
            sortedReviews.map(([keyword, count]) => (
              <Badge key={keyword}>
                {keyword}
                <BadgeCount>{count}</BadgeCount>
              </Badge>
            ))
          )}
        </BadgeGrid>
      </ProfileSection>

      <ProfileSection style={{ marginBottom: '40px' }}>
        <SectionTitle>분양 이력</SectionTitle>
        {items.length === 0 ? (
          <p className="text-sm text-muted">분양/거래 이력이 없어요.</p>
        ) : (
          <div>
            {items.map(item => {
              const isCompleted = item.status === 'COMPLETED';
              const statusText = isCompleted ? '거래완료' : '분양중';
              return (
                <HistoryItem key={item.item_id} completed={isCompleted}>
                  <HistoryEmoji>{item.emoji}</HistoryEmoji>
                  <HistoryBody>
                    <HistoryTitle>{item.title}</HistoryTitle>
                    <HistoryMeta completed={isCompleted}>
                      {statusText} · {formatPrice(item.price)}
                    </HistoryMeta>
                  </HistoryBody>
                  {isMe && !isCompleted && (
                    <CompleteBtn onClick={() => handleCompleteItem(item.item_id, item.category)}>
                      ✓ 완료
                    </CompleteBtn>
                  )}
                </HistoryItem>
              );
            })}
          </div>
        )}
      </ProfileSection>

      {!isMe && (
        <>
          <ChatCtaBtn onClick={() => navigate(`/dm/${targetUser.user_id}`)}>
            <span className="ms">chat</span>
            1:1 개인 채팅하기
          </ChatCtaBtn>

          <div style={{ padding: '0 20px 32px' }}>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%', border: '1.5px solid var(--muted)', padding: '14px', borderRadius: '12px', fontWeight: 700, backgroundColor: 'var(--white)' }}
              onClick={() => setIsReviewOpen(true)}
            >
              후기 남기기
            </button>
          </div>
        </>
      )}

      {/* Menu bottom sheet */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="프로필 메뉴">
        {isMe ? (
          <>
            <MenuItem onClick={() => { setIsMenuOpen(false); setIsEditOpen(true); }}>
              <span className="ms" style={{ fontSize: '20px' }}>edit</span> 프로필 정보 수정
            </MenuItem>
            <MenuItem onClick={() => { setIsMenuOpen(false); logout(); navigate('/'); }} style={{ borderColor: 'var(--muted)' }}>
              <span className="ms" style={{ fontSize: '20px', color: 'var(--danger)' }}>logout</span> 로그아웃
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => { setIsMenuOpen(false); toggleBlockUser(targetUser.user_id); }} style={{ borderColor: 'var(--muted)' }}>
              <span className="ms" style={{ fontSize: '20px', color: 'var(--danger)' }}>
                {isBlocked ? 'do_not_disturb_on' : 'block'}
              </span>
              {isBlocked ? '이웃 차단 해제' : '이웃 차단하기'}
            </MenuItem>
            <MenuItem onClick={() => { setIsMenuOpen(false); setIsReportOpen(true); }} style={{ borderColor: 'var(--muted)' }}>
              <span className="ms" style={{ fontSize: '20px', color: 'var(--danger)' }}>report</span> 이웃 신고하기
            </MenuItem>
            {currentUser?.role === 'admin' && (
              <MenuItem onClick={() => { setIsMenuOpen(false); handleAdminBanUser(targetUser.user_id); }} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <span className="ms" style={{ fontSize: '20px', color: 'var(--danger)' }}>gavel</span> [관리자] 즉시 영구 차단
              </MenuItem>
            )}
          </>
        )}
        <button 
          className="btn btn-main" 
          style={{ marginTop: '8px', height: '46px', width: '100%', borderRadius: '12px', background: 'var(--main)', color: 'var(--point)', fontWeight: 700 }} 
          onClick={() => setIsMenuOpen(false)}
        >
          닫기
        </button>
      </BottomSheet>

      {/* Profile Edit BottomSheet */}
      <BottomSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="프로필 정보 수정">
        <InputGroup>
          <Label>프로필 캐릭터 선택</Label>
          <AvatarContainer>
            {avatarList.map(avatar => (
              <AvatarOption
                key={avatar.path}
                selected={editAvatar === avatar.path}
                bg={avatar.bg}
                title={avatar.title}
                onClick={() => setEditAvatar(avatar.path)}
              >
                <AvatarImageOption src={`/${avatar.path}`} alt={avatar.title} />
              </AvatarOption>
            ))}
          </AvatarContainer>
        </InputGroup>

        <InputGroup>
          <Label>닉네임</Label>
          <ModalInput 
            type="text"
            maxLength={10}
            placeholder="예: 구피덕후, 역삼수초러버"
            value={editNickname}
            onChange={e => setEditNickname(e.target.value)}
          />
        </InputGroup>

        <InputGroup style={{ marginBottom: '20px' }}>
          <Label>소개말 / 한 줄 상태메시지</Label>
          <ModalTextarea 
            rows={3} 
            placeholder="동네 이웃에게 나를 소개해 보세요." 
            value={editMemo}
            onChange={e => setEditMemo(e.target.value)}
          />
        </InputGroup>

        <PrimaryBtn onClick={handleEditSubmit}>
          수정 완료
        </PrimaryBtn>
      </BottomSheet>

      {/* Report bottom sheet */}
      <BottomSheet isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="🚨 이웃 신고하기">
        <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
          신고는 즉시 접수되며 물꼬 운영진이 빠르게 검토하겠습니다. 허위 신고 시 조치가 취해질 수 있습니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px' }}>
          {['업자/상업적 판매', '동물 학대/유기 의심', '비매너/거래 약속 파기', '전문 분양업 성격', '기타'].map(reason => (
            <ReportLabel key={reason}>
              <input 
                type="radio" 
                name="report-reason" 
                checked={reportReason === reason}
                onChange={() => setReportReason(reason)}
              />
              <span>{reason}</span>
            </ReportLabel>
          ))}
        </div>

        {reportReason === '기타' && (
          <InputGroup>
            <Label>상세 신고 사유</Label>
            <ModalTextarea 
              rows={3} 
              placeholder="상세 내용을 적어주세요..." 
              value={reportDetail}
              onChange={e => setReportDetail(e.target.value)}
            />
          </InputGroup>
        )}

        <PrimaryBtn onClick={handleReportSubmit}>
          신고 접수
        </PrimaryBtn>
      </BottomSheet>

      {/* Review bottom sheet */}
      <BottomSheet isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="후기 남기기">
        <p className="text-sm text-muted" style={{ marginBottom: '14px', textAlign: 'center' }}>
          이웃과의 거래는 어떠셨나요? 칭찬 후기를 키워드로 남겨보세요.
        </p>

        <ChipContainer>
          {['🐟 생물이건강해요', '📦 포장이꼼꼼해요', '💡 물생활꿀팁을공유해줘요', '⏰ 시간약속을잘지켜요', '😊 친절해요'].map(keyword => {
            const isSelected = selectedKeywords.includes(keyword);
            return (
              <KeywordChip 
                key={keyword} 
                selected={isSelected}
                onClick={() => handleReviewToggle(keyword)}
              >
                {keyword}
              </KeywordChip>
            );
          })}
        </ChipContainer>

        <PrimaryBtn onClick={handleReviewSubmit}>
          후기 등록
        </PrimaryBtn>
      </BottomSheet>
    </Container>
  );
};
