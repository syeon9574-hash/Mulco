import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { BottomSheet } from '../components/common/BottomSheet';
import { formatPrice } from '../utils/format';
import { reviewKeywords } from '../data/mockData';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.bg};
  padding-bottom: 90px;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  text-align: center;
`;

const ProfileAvatar = styled.div<{ bg: string }>`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.circle};
  background: ${props => props.bg};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  filter: contrast(1.05);
`;

const ProfileName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 6px;
`;

const ProfileRegion = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 14px;
`;

const ProfileMemo = styled.p`
  font-size: 0.86rem;
  line-height: 1.45;
  color: ${props => props.theme.colors.text};
  opacity: 0.9;
  max-width: 85%;
`;

const ProfileSection = styled.div`
  padding: 24px 20px 0;
`;

const SectionTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  opacity: 0.65;
  margin-bottom: 12px;
`;

const BadgeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Badge = styled.div`
  background-color: ${props => props.theme.colors.sub};
  color: #2e6a4f;
  padding: 8px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const BadgeCount = styled.span`
  opacity: 0.7;
`;

const HistoryItem = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.muted};
  opacity: ${props => (props.completed ? 0.6 : 1)};
  margin-bottom: 8px;
`;

const HistoryEmoji = styled.span`
  font-size: 1.5rem;
`;

const HistoryBody = styled.div`
  flex: 1;
`;

const HistoryTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const HistoryMeta = styled.div<{ completed: boolean }>`
  font-size: 0.72rem;
  color: ${props => (props.completed ? props.theme.colors.text + '88' : props.theme.colors.point)};
  font-weight: 600;
  margin-top: 2px;
`;

const CompleteBtn = styled.button`
  padding: 4px 10px;
  background-color: ${props => props.theme.colors.point};
  color: white;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
`;

const ChatCtaBtn = styled.button`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 390px;
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  padding: 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 90;
  
  &:active {
    transform: translateX(-50%) scale(0.99);
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

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentUser, 
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

  // Form states
  const [reportReason, setReportReason] = useState('업자/상업적 판매');
  const [reportDetail, setReportDetail] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const targetUser = userId === currentUser?.user_id ? currentUser : users[userId || ''];

  useEffect(() => {
    if (!targetUser) {
      navigate('/main');
    }
  }, [targetUser, navigate]);

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

  const handleReportSubmit = () => {
    if (reportReason === '기타' && !reportDetail.trim()) {
      showToast('⚠️ 기타 상세 신고 사유를 입력해 주세요.');
      return;
    }

    console.log(`[신고] 대상: ${targetUser.nickname}, 사유: ${reportReason}, 내용: ${reportDetail}`);
    setIsReportOpen(false);
    showToast(`🚨 ${targetUser.nickname}님에 대한 신고가 접수되었습니다.`);
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

    // Apply reviews to users
    setUsers(prev => {
      const target = prev[targetUser.user_id];
      if (!target) return prev;

      const currentReviews = target.reviews || {};
      const newReviews = { ...currentReviews };

      selectedKeywords.forEach(kw => {
        // Find match in reviews keys
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

  const sortedReviews = Object.entries(targetUser.reviews || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const items = [
    ...biologyItems.filter(i => i.user_id === targetUser.user_id),
    ...goodsItems.filter(i => i.user_id === targetUser.user_id)
  ].slice(0, 3);

  const isBlocked = blockedUsers.includes(targetUser.user_id);

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
        <ProfileName>{targetUser.nickname}</ProfileName>
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
              const statusColor = isCompleted ? 'var(--text-light)' : 'var(--point)';
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
            <MenuItem onClick={() => { setIsMenuOpen(false); showToast('프로필 편집 기능은 준비 중이에요!'); }}>
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

      {/* Report bottom sheet */}
      <BottomSheet isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="이웃 신고하기">
        <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>신고하시는 사유를 선택해 주세요.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            '전문 업자의 상업적 판매글이에요',
            '비속어 / 욕설 / 비매너 대화를 해요',
            '아프거나 부적절한 생물을 분양해요',
            '약속 불이행 / 예약 파기 / 사기가 의심돼요',
            '기타 사유 (직접 입력)'
          ].map((reason) => {
            const val = reason.includes('기타') ? '기타' : reason.split(' ')[0];
            return (
              <ReportLabel key={reason}>
                <input 
                  type="radio" 
                  name="report-reason" 
                  checked={reportReason === val} 
                  onChange={() => setReportReason(val)} 
                  style={{ accentColor: 'var(--point)' }}
                />
                {reason}
              </ReportLabel>
            );
          })}

          <ModalTextarea
            rows={3}
            placeholder="기타 사유 선택 시 상세 내용을 입력해 주세요..."
            value={reportDetail}
            onChange={e => setReportDetail(e.target.value)}
            style={{ marginTop: '4px' }}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1.5px solid var(--muted)', fontWeight: 700 }}
              onClick={() => setIsReportOpen(false)}
            >
              취소
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1.5, padding: '14px', borderRadius: '12px', background: 'var(--danger)', color: 'white', fontWeight: 700 }}
              onClick={handleReportSubmit}
            >
              신고 접수
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Review bottom sheet */}
      <BottomSheet isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title={`⭐ ${targetUser.nickname}님 후기 남기기`}>
        <p className="text-sm text-muted text-center" style={{ marginBottom: '16px' }}>어떤 점이 좋으셨나요? (복수 선택 가능)</p>
        <ChipContainer>
          {reviewKeywords.map((kw) => (
            <KeywordChip 
              key={kw} 
              selected={selectedKeywords.includes(kw)} 
              onClick={() => handleReviewToggle(kw)}
            >
              {kw}
            </KeywordChip>
          ))}
        </ChipContainer>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', background: 'var(--point)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 700 }}
          onClick={handleReviewSubmit}
        >
          후기 남기기
        </button>
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', padding: '12px', color: 'var(--text)', opacity: 0.5, fontWeight: 700, marginTop: '4px' }}
          onClick={() => setIsReviewOpen(false)}
        >
          건너뛰기
        </button>
      </BottomSheet>
    </Container>
  );
};
