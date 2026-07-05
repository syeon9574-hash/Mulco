import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';

const PageWrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.bg};
`;

const GradientHeader = styled.div`
  background: linear-gradient(160deg, ${props => props.theme.colors.main} 0%, ${props => props.theme.colors.sub} 100%);
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
  margin-bottom: 18px;

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

const SearchInputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
`;

const SearchInput = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 12px 16px;
  font-size: 0.9rem;
  outline: none;
  transition: ${props => props.theme.transitions.default};

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const SearchBtn = styled.button`
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.point};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.88rem;
  white-space: nowrap;
  transition: ${props => props.theme.transitions.default};

  &:active {
    background-color: #FFCDD9;
  }
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
  box-shadow: 0 4px 10px rgba(255,142,158,0.06);
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

const PlaceholderText = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textLight};
  padding: 40px 20px;
  line-height: 1.6;
  opacity: 0.8;
  border: 1.5px dashed ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.white};
  margin-bottom: 24px;
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
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('images/avatar-girl.png');
  const [gpsStatus, setGpsStatus] = useState<string>('현재 위치로 자동 감지');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast('동네 이름을 입력해 주세요.');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&accept-language=ko&addressdetails=1&countrycodes=kr`
      );
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();

      if (data.length === 0) {
        showToast('검색 결과가 없어요. 다른 동네 이름으로 검색해 보세요.');
        setRegions([]);
        return;
      }

      const formattedList = data.map((item: any) => {
        const addr = item.address;
        const city = addr.city || addr.town || addr.province || addr.state || '';
        const county = addr.county || addr.borough || addr.district || '';
        const neighbourhood = addr.neighbourhood || addr.suburb || addr.village || '';
        
        const cleanCity = city.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').trim();
        const cleanCounty = county.trim();
        const cleanNeighbourhood = neighbourhood.trim();

        const parts = [cleanCity, cleanCounty, cleanNeighbourhood].filter((v, i, a) => v && a.indexOf(v) === i);
        return parts.join(' ') || item.display_name.split(',')[0];
      });

      const uniqueList = formattedList.filter((v: string, i: number, a: string[]) => v && a.indexOf(v) === i);
      setRegions(uniqueList);
    } catch (err) {
      console.error(err);
      showToast('검색에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSearchLoading(false);
    }
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
            <path d="M16 32h12" stroke="currentColor" stroke-width="1.5" strokeLinecap="round" />
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
                <line x1="16" y1="10" x2="19" y2="10" stroke="currentColor" stroke-width="1.5" strokeLinecap="round" />
              </svg>
              {gpsStatus}
            </OutlineBtn>

            <SearchInputRow>
              <SearchInput 
                type="text" 
                placeholder="동네 이름으로 검색 (예: 괴정동, 역삼동)" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <SearchBtn onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? '검색 중...' : '검색'}
              </SearchBtn>
            </SearchInputRow>

            {regions.length === 0 ? (
              <PlaceholderText>
                📍 동네 이름(예: 괴정동, 역삼동)을 위 검색창에 검색하시거나, 상단의 GPS 감지 버튼을 눌러주세요.
              </PlaceholderText>
            ) : (
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
            )}

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
