import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

interface Report {
  report_id: string;
  reporter_id: string;
  reporter_nickname?: string;
  reported_user_id: string;
  reported_nickname?: string;
  message_id: string;
  message_content: string;
  region: string;
  reason: string;
  timestamp: number;
}

interface Suggestion {
  suggestion_id: string;
  user_id: string;
  user_nickname: string;
  content: string;
  timestamp: number;
}

const PageWrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.bg};
  padding: 0;
  box-sizing: border-box;
`;

const AdminHeader = styled.header`
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackBtn = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const HeaderTitle = styled.h1`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DashboardContent = styled.main`
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`;

const SummaryBar = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px;
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  justify-content: space-around;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.04);
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryVal = styled.span<{ $red?: boolean; $blue?: boolean }>`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${props => {
    if (props.$red) return '#e74c3c';
    if (props.$blue) return '#3498db';
    return props.theme.colors.point;
  }};
`;

const SummaryLabel = styled.span`
  font-size: 0.72rem;
  color: ${props => props.theme.colors.textLight};
`;

const TabBar = styled.div`
  display: flex;
  background: white;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 4px;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid rgba(0,0,0,0.03);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  border: none;
  background: ${props => props.$active ? props.theme.colors.point : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.textLight};
  font-weight: 700;
  font-size: 0.85rem;
  padding: 12px;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.point : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1.5px dashed ${props => props.theme.colors.muted};
  color: ${props => props.theme.colors.textLight};
`;

const ReportListTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 10px 0 2px;
`;

const ReportCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: #e74c3c;
  }
`;

const SuggestionCard = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: #3498db;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
`;

const RegionBadge = styled.span`
  background: #f1f2f6;
  color: #2f3542;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
`;

const SuggestionBadge = styled.span`
  background: #e8f4fd;
  color: #3498db;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
`;

const TimeLabel = styled.span`
  color: ${props => props.theme.colors.textLight};
`;

const ReportedContent = styled.div`
  background: #f8f9fa;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 12px;
  border-left: 3px solid ${props => props.theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.45;
  color: ${props => props.theme.colors.text};
  word-break: break-all;
`;

const SuggestionContent = styled.div`
  background: #fcfcfc;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 14px;
  border: 1px solid rgba(52, 152, 219, 0.15);
  font-size: 0.88rem;
  line-height: 1.5;
  color: ${props => props.theme.colors.text};
  word-break: break-all;
  white-space: pre-wrap;
`;

const ReportMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 6px;
  color: ${props => props.theme.colors.text};
`;

const MetaLabel = styled.span`
  color: ${props => props.theme.colors.textLight};
  font-weight: 500;
  width: 70px;
  flex-shrink: 0;
`;

const MetaVal = styled.span`
  font-weight: 600;
`;

const ReasonTag = styled.span`
  color: #d35400;
  font-weight: 700;
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 8px;
  margin-top: 6px;

  @media (max-width: 375px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const SuggestionActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const ActionBtn = styled.button<{ $type: 'dismiss' | 'delete' | 'ban' | 'resolve' }>`
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 10px 4px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;

  background-color: ${props => {
    if (props.$type === 'dismiss') return '#f1f2f6';
    if (props.$type === 'delete') return '#ffe9eb';
    if (props.$type === 'resolve') return '#e8f4fd';
    return '#2c3e50';
  }};

  color: ${props => {
    if (props.$type === 'dismiss') return '#57606f';
    if (props.$type === 'delete') return '#e74c3c';
    if (props.$type === 'resolve') return '#3498db';
    return 'white';
  }};

  &:hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, showToast, users } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'suggestions'>('reports');
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('❌ 접근 권한이 없습니다.');
      navigate('/main');
    }
  }, [currentUser, navigate, showToast]);

  // Real-time reports query
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Report[] = [];
      snapshot.forEach((doc) => {
        items.push({ report_id: doc.id, ...doc.data() } as Report);
      });
      setReports(items);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // Real-time suggestions query
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const q = query(collection(db, 'suggestions'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Suggestion[] = [];
      snapshot.forEach((doc) => {
        items.push({ suggestion_id: doc.id, ...doc.data() } as Suggestion);
      });
      setSuggestions(items);
    }, (err) => {
      console.error('Suggestions fetch error:', err);
    });

    return () => unsub();
  }, [currentUser]);

  // Dismiss report (delete only the report doc)
  const handleDismiss = async (reportId: string) => {
    if (window.confirm('🚨 이 신고를 반려(기각)하시겠습니까? 신고 목록에서만 삭제됩니다.')) {
      try {
        await deleteDoc(doc(db, 'reports', reportId));
        showToast('✅ 신고를 기각했습니다.');
      } catch (err) {
        console.error(err);
        showToast('❌ 처리 도중 오류가 발생했습니다.');
      }
    }
  };

  // Delete message
  const handleDeleteMsg = async (reportId: string, messageId: string) => {
    if (window.confirm('💬 해당 메시지를 영구 삭제하시겠습니까? (상대방 채팅창에서도 즉시 삭제됩니다.)')) {
      try {
        // Delete message
        await deleteDoc(doc(db, 'chatMessages', messageId));
        // Delete report
        await deleteDoc(doc(db, 'reports', reportId));
        showToast('🗑️ 대화 내용을 성공적으로 삭제했습니다.');
      } catch (err) {
        console.error(err);
        showToast('❌ 메시지 삭제에 실패했습니다.');
      }
    }
  };

  // Ban user
  const handleBanUser = async (reportId: string, reportedUserId: string, messageId: string) => {
    if (window.confirm('⚠️ 이 유저를 영구정지(BAN)시키겠습니까?\n이후 해당 기기 및 계정으로의 접속/활동이 모두 차단되며, 원인 메시지 및 신고글도 자동 삭제됩니다.')) {
      try {
        // Ban user in users collection
        await updateDoc(doc(db, 'users', reportedUserId), {
          status: 'BANNED'
        });
        
        // Delete offending message
        await deleteDoc(doc(db, 'chatMessages', messageId));
        
        // Delete report
        await deleteDoc(doc(db, 'reports', reportId));
        showToast('🚫 해당 사용자가 영구 정지되었습니다.');
      } catch (err) {
        console.error(err);
        showToast('❌ 사용자 정지 처리에 실패했습니다.');
      }
    }
  };

  // Clear suggestion
  const handleResolveSuggestion = async (suggestionId: string) => {
    if (window.confirm('💡 이 건의사항을 확인 완료 처리하고 목록에서 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'suggestions', suggestionId));
        showToast('✅ 건의사항 확인을 완료했습니다.');
      } catch (err) {
        console.error(err);
        showToast('❌ 처리에 실패했습니다.');
      }
    }
  };

  const getFormatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <PageWrapper>
      <AdminHeader>
        <BackBtn onClick={() => navigate('/main')} title="동네방 로비로 이동">
          <span className="ms" style={{ fontSize: '24px' }}>arrow_back</span>
        </BackBtn>
        <HeaderTitle>
          <span className="ms" style={{ color: '#e74c3c' }}>gavel</span>
          물꼬 신고 관리 센터 (Admin Control)
        </HeaderTitle>
      </AdminHeader>

      <DashboardContent>
        <SummaryBar>
          <SummaryItem>
            <SummaryVal $red={reports.length > 0}>{reports.length}</SummaryVal>
            <SummaryLabel>접수된 신고</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryVal $blue={suggestions.length > 0} $red={false}>{suggestions.length}</SummaryVal>
            <SummaryLabel>새 건의사항</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryVal>{Object.values(users).length}</SummaryVal>
            <SummaryLabel>가입 집사 수</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryVal>{Object.values(users).filter(u => u.status === 'BANNED').length}</SummaryVal>
            <SummaryLabel>정지 회원 수</SummaryLabel>
          </SummaryItem>
        </SummaryBar>

        <TabBar>
          <TabButton $active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
            <span className="ms" style={{ fontSize: '16px' }}>gavel</span>
            신고 내역 ({reports.length})
          </TabButton>
          <TabButton $active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')}>
            <span className="ms" style={{ fontSize: '16px' }}>lightbulb</span>
            건의사항 ({suggestions.length})
          </TabButton>
        </TabBar>

        {activeTab === 'reports' ? (
          /* ================== 신고 관리 탭 ================== */
          <>
            <ReportListTitle>실시간 신고 내역</ReportListTitle>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                신고 목록을 가져오는 중입니다...
              </div>
            ) : reports.length === 0 ? (
              <EmptyState>
                <span className="ms" style={{ fontSize: '48px', color: 'var(--muted)' }}>check_circle</span>
                <p style={{ margin: 0, fontWeight: 600 }}>접수된 대기 신고가 없습니다.</p>
                <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.8 }}>동네 물집사 커뮤니티가 평화롭습니다! 🌿</p>
              </EmptyState>
            ) : (
              reports.map((report) => (
                <ReportCard key={report.report_id}>
                  <CardHeader>
                    <RegionBadge>{report.region}</RegionBadge>
                    <TimeLabel>{getFormatDate(report.timestamp)}</TimeLabel>
                  </CardHeader>

                  <ReportedContent>
                    {report.message_content}
                  </ReportedContent>

                  <ReportMeta>
                    <MetaRow>
                      <MetaLabel>신고 사유</MetaLabel>
                      <MetaVal><ReasonTag>{report.reason}</ReasonTag></MetaVal>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>대상자</MetaLabel>
                      <MetaVal>
                        {report.reported_nickname || users[report.reported_user_id]?.nickname || '알 수 없음'} 
                        <span style={{ fontSize: '0.7rem', color: '#8c8c8c', marginLeft: '6px', fontWeight: 400 }}>
                          (ID: {report.reported_user_id.slice(0, 8)})
                        </span>
                      </MetaVal>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>신고자</MetaLabel>
                      <MetaVal>
                        {report.reporter_nickname || users[report.reporter_id]?.nickname || '알 수 없음'}
                      </MetaVal>
                    </MetaRow>
                  </ReportMeta>

                  <ActionRow>
                    <ActionBtn $type="dismiss" onClick={() => handleDismiss(report.report_id)}>
                      <span className="ms" style={{ fontSize: '15px' }}>cancel</span>
                      반려
                    </ActionBtn>
                    <ActionBtn $type="delete" onClick={() => handleDeleteMsg(report.report_id, report.message_id)}>
                      <span className="ms" style={{ fontSize: '15px' }}>delete_forever</span>
                      메시지 삭제
                    </ActionBtn>
                    <ActionBtn $type="ban" onClick={() => handleBanUser(report.report_id, report.reported_user_id, report.message_id)}>
                      <span className="ms" style={{ fontSize: '15px' }}>block</span>
                      가해자 정지
                    </ActionBtn>
                  </ActionRow>
                </ReportCard>
              ))
            )}
          </>
        ) : (
          /* ================== 건의사항 관리 탭 ================== */
          <>
            <ReportListTitle>유저 개선 제안 및 피드백</ReportListTitle>
            {suggestions.length === 0 ? (
              <EmptyState>
                <span className="ms" style={{ fontSize: '48px', color: 'var(--muted)' }}>sentiment_satisfied</span>
                <p style={{ margin: 0, fontWeight: 600 }}>새로 등록된 건의사항이 없습니다.</p>
                <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.8 }}>유저들이 현재 서비스에 만족하고 있습니다! 🐠</p>
              </EmptyState>
            ) : (
              suggestions.map((sug) => (
                <SuggestionCard key={sug.suggestion_id}>
                  <CardHeader>
                    <SuggestionBadge>💡 피드백</SuggestionBadge>
                    <TimeLabel>{getFormatDate(sug.timestamp)}</TimeLabel>
                  </CardHeader>

                  <SuggestionContent>
                    {sug.content}
                  </SuggestionContent>

                  <ReportMeta>
                    <MetaRow>
                      <MetaLabel>제보자</MetaLabel>
                      <MetaVal>
                        {sug.user_nickname || users[sug.user_id]?.nickname || '익명 집사'}
                        <span style={{ fontSize: '0.7rem', color: '#8c8c8c', marginLeft: '6px', fontWeight: 400 }}>
                          (ID: {sug.user_id.slice(0, 8)})
                        </span>
                      </MetaVal>
                    </MetaRow>
                  </ReportMeta>

                  <SuggestionActionRow>
                    <ActionBtn $type="resolve" onClick={() => handleResolveSuggestion(sug.suggestion_id)} style={{ width: '120px' }}>
                      <span className="ms" style={{ fontSize: '15px' }}>check_circle</span>
                      확인 완료
                    </ActionBtn>
                  </SuggestionActionRow>
                </SuggestionCard>
              ))
            )}
          </>
        )}
      </DashboardContent>
    </PageWrapper>
  );
};
