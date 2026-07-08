import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const PageWrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background-color: ${props => props.theme.colors.bg};
  overflow: hidden;
`;

const HeroSection = styled.div`
  background: linear-gradient(160deg, ${props => props.theme.colors.main} 0%, ${props => props.theme.colors.sub} 60%, ${props => props.theme.colors.bg} 100%);
  padding: 80px 32px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -20px;
    right: -20px;
    height: 60px;
    background: ${props => props.theme.colors.bg};
    border-radius: 50%;
  }
`;

const LogoWordmark = styled.img`
  max-width: 280px;
  width: 100%;
  object-fit: contain;
  display: block;
  mix-blend-mode: multiply;
  filter: contrast(1.06) brightness(1.02);
  animation: float 3.5s ease-in-out infinite;
`;

const Tagline = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.point};
  opacity: 0.8;
  text-align: center;
  line-height: 1.5;
  font-weight: 500;
`;

const FormSection = styled.div`
  flex: 1;
  padding: 60px 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
`;

const FormTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px 24px;
  transition: ${props => props.theme.transitions.default};
  letter-spacing: -0.01em;
  box-sizing: border-box;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GoogleBtn = styled(Btn)`
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  border: 1.5px solid ${props => props.theme.colors.muted};
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  max-width: 320px;

  &:hover {
    background: #f8f9fa;
    border-color: #c3c3c3;
    transform: translateY(-1.5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
`;

const FooterText = styled.p`
  margin-top: auto;
  padding-top: 40px;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  max-width: 280px;
  line-height: 1.4;
`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, setCurrentUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mulco_user');
    if (saved) {
      navigate('/main');
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        user_id: user.uid,
        nickname: user.displayName || '물집사',
        email: user.email || '',
        region: '서울특별시', // 광역 매핑 기본값
        profile_memo: '안녕하세요! 반갑습니다. 🐟',
        avatar: user.photoURL || 'images/avatar-girl.png',
        created_at: new Date().toISOString().split('T')[0]
      };

      localStorage.setItem('mulco_user', JSON.stringify(userData));
      setCurrentUser(userData);

      showToast('구글 로그인에 성공했습니다! 🐠');
      navigate('/setup');
    } catch (error: any) {
      console.error(error);
      showToast('❌ 구글 로그인에 실패했습니다. 파이어베이스 설정을 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <HeroSection>
        <LogoWordmark src="/images/logo-wordmark.png" alt="물꼬 Mulco" />
        <Tagline>
          우리 동네 이웃 물집사들과<br />
          생물·용품·수초를 나눔하세요
        </Tagline>
      </HeroSection>

      <FormSection>
        <FormTitle>반갑습니다!</FormTitle>

        {/* Google Login Button */}
        <GoogleBtn type="button" onClick={handleGoogleLogin} disabled={isLoading}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.86 2.22c1.67-1.54 2.63-3.8 2.63-6.55z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.86-2.22c-.79.53-1.8.85-3.1.85-2.39 0-4.41-1.61-5.14-3.78H.95v2.3C2.43 15.89 5.5 18 9 18z"/>
            <path fill="#FBBC05" d="M3.86 10.67c-.18-.53-.29-1.1-.29-1.67s.11-1.14.29-1.67V5.03H.95C.35 6.22 0 7.57 0 9s.35 2.78.95 3.97l2.91-2.3z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.05C13.46.6 11.43 0 9 0 5.5 0 2.43 2.11.95 5.03l2.91 2.3c.73-2.17 2.75-3.78 5.14-3.78z"/>
          </svg>
          {isLoading ? '연결 중...' : 'Google 계정으로 계속하기'}
        </GoogleBtn>

        <FooterText>
          가입 시 <span className="text-point" style={{ fontWeight: 600 }}>이용약관</span> 및{' '}
          <span className="text-point" style={{ fontWeight: 600 }}>개인정보 처리방침</span>에 동의합니다.
        </FooterText>
      </FormSection>
    </PageWrapper>
  );
};
