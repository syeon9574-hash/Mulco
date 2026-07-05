import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { mockRegions } from '../data/mockData';

const PageWrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.bg};
`;

const GradientHeader = styled.div`
  background: linear-gradient(160deg, #D1E6E8 0%, #E2EFE7 100%);
  padding: 60px 24px 80px;
  text-align: center;
`;

const HeaderIcon = styled.div`
  color: ${props => props.theme.colors.point};
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  opacity: 0.65;
`;

const HeaderTitle = styled.h2`
  color: ${props => props.theme.colors.point};
  font-size: 1.3rem;
  font-weight: 700;
`;

const HeaderSubtitle = styled.p`
  color: ${props => props.theme.colors.point};
  opacity: 0.75;
  font-size: 0.85rem;
  margin-top: 8px;
`;

const SetupSheet = styled.div`
  flex: 1;
  background-color: ${props => props.theme.colors.bg};
  border-radius: ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg} 0 0;
  margin-top: -32px;
  padding: 28px 24px 40px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.04);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const StepDot = styled.div<{ active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => (props.active ? props.theme.colors.point : props.theme.colors.muted)};
  transition: ${props => props.theme.transitions.default};
`;

const StepTitle = styled.h3`
  margin-bottom: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.default};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutlineBtn = styled(Button)`
  border: 1.5px solid ${props => props.theme.colors.muted};
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  gap: 8px;
  margin-bottom: 14px;

  &:active {
    background-color: #f8f9fa;
  }
`;

const PrimaryBtn = styled(Button)`
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  box-shadow: 0 4px 12px rgba(58, 96, 115, 0.15);
  margin-top: 8px;

  &:active {
    transform: scale(0.99);
  }
`;

const OrText = styled.p`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.4;
  text-align: center;
  margin-bottom: 12px;
`;

const RegionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
`;

const RegionItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => (props.selected ? props.theme.colors.point : props.theme.colors.muted)};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: ${props => props.theme.transitions.default};
  box-shadow: ${props => props.theme.shadows.sm};

  &:active {
    background-color: #f9f9fb;
  }
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
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const InputField = styled.input`
  width: 100%;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 14px 16px;
  padding-right: 50px;
  font-size: 0.95rem;
  transition: ${props => props.theme.transitions.default};

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const CharCounter = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.72rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.4;
`;

const InfoText = styled.p`
  font-size: 0.78rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.5;
  margin-bottom: 14px;
`;

const avatarList = [
  { path: 'images/avatar-girl.png', title: '2030 여성', bg: '#FFE5EC' },
  { path: 'images/avatar-boy.png', title: '2030 남성', bg: '#E5F7FF' },
  { path: 'images/avatar-woman.png', title: '4050 여성', bg: '#E5FAF0' },
  { path: 'images/avatar-man.png', title: '4050 남성', bg: '#FFF5D1' },
  { path: 'images/avatar-child.png', title: '어린이', bg: '#FFEAF0' }
];

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, setCurrentUser, currentUser } = useApp();
  const [step, setStep] = useState(1);
  const [regions, setRegions] = useState(mockRegions);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('images/avatar-girl.png');
  const [gpsStatus, setGpsStatus] = useState<string>('현재 위치로 자동 감지');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  const handleGpsLookup = () => {
    if (!navigator.geolocation) {
      showToast('이 브라우저는 GPS 위치 정보를 지원하지 않아요.');
      return;
    }

    setGpsLoading(true);
    setGpsStatus('📡 GPS 신호 탐색 중...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setGpsStatus('🔍 동네 주소 변환 중...');
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=ko`
          );
          
          if (!response.ok) throw new Error('API failed');
          const data = await response.json();
          
          const addr = data.address;
          const borough = addr.borough || addr.suburb || addr.district || '';
          const dong = addr.neighbourhood || addr.village || addr.quarter || addr.suburb || '';
          
          let regionName = '';
          if (borough && dong) {
            regionName = `${borough} ${dong}`;
          } else if (dong) {
            regionName = dong;
          } else if (data.display_name) {
            const parts = data.display_name.split(',').map((p: string) => p.trim());
            regionName = parts[2] || parts[1] || '감지된 동네';
          } else {
            regionName = '강남구 역삼동';
          }

          setGpsStatus(`✅ ${regionName} 감지됨`);
          setSelectedRegion(regionName);

          // Add detected region to regions list if it doesn't exist
          if (!regions.includes(regionName)) {
            setRegions(prev => [regionName, ...prev]);
          }

          showToast(`내 동네가 '${regionName}'(으)로 설정되었어요!`);
        } catch (error) {
          console.error(error);
          setGpsStatus('❌ 주소 변환 실패');
          showToast('주소 변환에 실패했습니다. (역삼동으로 임시 설정)');
          setSelectedRegion('강남구 역삼동');
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setGpsStatus('❌ 위치 검색 실패');
        showToast('위치 탐색을 실패했습니다. (역삼동으로 임시 설정)');
        setSelectedRegion('강남구 역삼동');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleNextStep = () => {
    if (!selectedRegion) return;
    setStep(2);
  };

  const handleStartApp = () => {
    if (nickname.trim().length < 2) return;
    setStartLoading(true);

    const updatedUser = {
      ...currentUser,
      user_id: currentUser?.user_id || 'u001',
      nickname: nickname.trim(),
      region: selectedRegion || '강남구 역삼동',
      avatar: selectedAvatar,
      profile_memo: currentUser?.profile_memo || '구피 덕후 3년차 🐟 치어 나눔 좋아합니다!',
      created_at: currentUser?.created_at || new Date().toISOString().split('T')[0]
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('mulco_user', JSON.stringify(updatedUser));

    setTimeout(() => {
      setStartLoading(false);
      navigate('/main');
    }, 700);
  };

  return (
    <PageWrapper>
      <GradientHeader>
        <HeaderIcon>
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
            <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 18h32" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 26h4M24 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 32h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </HeaderIcon>
        <HeaderTitle>우리 동네를 알려주세요</HeaderTitle>
        <HeaderSubtitle>동네 이웃들과 물생활을 나눌 수 있어요</HeaderSubtitle>
      </GradientHeader>

      <SetupSheet>
        <StepIndicator>
          <StepDot active={step === 1} />
          <StepDot active={step === 2} />
        </StepIndicator>

        {step === 1 ? (
          <div>
            <StepTitle>내 동네 선택</StepTitle>
            <OutlineBtn onClick={handleGpsLookup} disabled={gpsLoading}>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="10" r="2.5" fill="currentColor" opacity="0.5" />
                <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="10" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {gpsStatus}
            </OutlineBtn>

            <OrText>또는 직접 선택</OrText>

            <RegionList>
              {regions.map(r => (
                <RegionItem 
                  key={r} 
                  selected={selectedRegion === r} 
                  onClick={() => setSelectedRegion(r)}
                >
                  <span>📍</span>
                  <span>{r}</span>
                </RegionItem>
              ))}
            </RegionList>

            <PrimaryBtn onClick={handleNextStep} disabled={!selectedRegion}>
              다음
            </PrimaryBtn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <StepTitle>프로필 캐릭터 & 닉네임</StepTitle>
            <InfoText>앱에서 사용할 귀여운 캐릭터와 이름을 선택해 주세요</InfoText>

            <AvatarContainer>
              {avatarList.map(avatar => (
                <AvatarOption
                  key={avatar.path}
                  selected={selectedAvatar === avatar.path}
                  bg={avatar.bg}
                  title={avatar.title}
                  onClick={() => setSelectedAvatar(avatar.path)}
                >
                  <AvatarImage src={`/${avatar.path}`} alt={avatar.title} />
                </AvatarOption>
              ))}
            </AvatarContainer>

            <InputGroup>
              <InputField
                type="text"
                maxLength={10}
                placeholder="예: 구피덕후, 역삼수초러버"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
              <CharCounter>{nickname.length} / 10</CharCounter>
            </InputGroup>

            <PrimaryBtn onClick={handleStartApp} disabled={nickname.trim().length < 2 || startLoading}>
              {startLoading ? '물꼬를 틉니다...' : '물꼬 시작하기'}
            </PrimaryBtn>
          </div>
        )}
      </SetupSheet>
    </PageWrapper>
  );
};
