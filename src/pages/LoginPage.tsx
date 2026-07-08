import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
  padding: 60px 32px 48px;
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
  max-width: 260px;
  width: 100%;
  object-fit: contain;
  display: block;
  mix-blend-mode: multiply;
  filter: contrast(1.06) brightness(1.02);
  animation: float 3.5s ease-in-out infinite;
`;

const Tagline = styled.p`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.point};
  opacity: 0.75;
  text-align: center;
  line-height: 1.5;
  font-weight: 500;
`;

const FormSection = styled.div`
  flex: 1;
  padding: 24px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FormTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const InputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textLight};
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const InputField = styled.input`
  width: 100%;
  padding: 14px 16px;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  transition: ${props => props.theme.transitions.default};
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.theme.colors.point};
    box-shadow: 0 0 0 3px rgba(255, 142, 158, 0.18);
  }
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 14px 20px;
  transition: ${props => props.theme.transitions.default};
  letter-spacing: -0.01em;
  box-sizing: border-box;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled(Btn)`
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  width: 100%;
  margin-top: 6px;

  &:hover {
    background: ${props => props.theme.colors.pointDark || '#264252'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const GoogleBtn = styled(Btn)`
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  border: 1.5px solid ${props => props.theme.colors.muted};
  width: 100%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 20px;

  &:hover {
    background: #f8f9fa;
    border-color: #c3c3c3;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: ${props => props.theme.colors.textLight};
  font-size: 0.8rem;
  margin: 10px 0 20px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1.5px solid ${props => props.theme.colors.muted};
  }

  &:not(:empty)::before {
    margin-right: .75em;
  }

  &:not(:empty)::after {
    margin-left: .75em;
  }
`;

const ToggleText = styled.p`
  margin-top: 14px;
  font-size: 0.85rem;
  text-align: center;
  color: ${props => props.theme.colors.textLight};
  
  span {
    color: ${props => props.theme.colors.point};
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 6px;
  }
`;

const FooterText = styled.p`
  margin-top: auto;
  padding-top: 24px;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

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
        region: '강남구 역삼동',
        profile_memo: '안녕하세요! 구글 계정으로 로그인했습니다. 🐟',
        avatar: user.photoURL || 'images/avatar-girl.png',
        created_at: new Date().toISOString().split('T')[0]
      };

      localStorage.setItem('mulco_user', JSON.stringify(userData));
      setCurrentUser(userData);

      showToast('구글 로그인에 성공했습니다! 🐠');
      
      // 회원가입 단계(프로필 완성 및 동네 설정)로 이동
      navigate('/setup');
    } catch (error: any) {
      console.error(error);
      showToast('❌ 구글 로그인에 실패했습니다. 파이어베이스 콘솔에서 Google 인증 제공업체를 켰는지 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        showToast('회원가입이 완료되었습니다! 🎉');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast('로그인에 성공했습니다! 🐠');
      }

      const user = userCredential.user;
      
      const userData = {
        user_id: user.uid,
        nickname: '물꼬지기',
        email: email,
        region: '강남구 역삼동',
        profile_memo: '안녕하세요! 반갑습니다. 🐟',
        avatar: 'images/avatar-girl.png',
        created_at: new Date().toISOString().split('T')[0]
      };

      localStorage.setItem('mulco_user', JSON.stringify(userData));
      setCurrentUser(userData);

      if (isSignUp) {
        navigate('/setup');
      } else {
        navigate('/main');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('❌ 이미 가입된 이메일 주소입니다.');
      } else if (error.code === 'auth/invalid-email') {
        showToast('❌ 올바르지 않은 이메일 형식입니다.');
      } else if (error.code === 'auth/weak-password') {
        showToast('❌ 비밀번호는 최소 6자리 이상이어야 합니다.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        showToast('❌ 이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        showToast('❌ 로그인 중 오류가 발생했습니다.');
      }
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
        <FormTitle>시작하기</FormTitle>

        {/* Google Login Button */}
        <GoogleBtn type="button" onClick={handleGoogleLogin} disabled={isLoading}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.86 2.22c1.67-1.54 2.63-3.8 2.63-6.55z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.86-2.22c-.79.53-1.8.85-3.1.85-2.39 0-4.41-1.61-5.14-3.78H.95v2.3C2.43 15.89 5.5 18 9 18z"/>
            <path fill="#FBBC05" d="M3.86 10.67c-.18-.53-.29-1.1-.29-1.67s.11-1.14.29-1.67V5.03H.95C.35 6.22 0 7.57 0 9s.35 2.78.95 3.97l2.91-2.3z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.05C13.46.6 11.43 0 9 0 5.5 0 2.43 2.11.95 5.03l2.91 2.3c.73-2.17 2.75-3.78 5.14-3.78z"/>
          </svg>
          Google 계정으로 계속하기
        </GoogleBtn>

        {/* Divider */}
        <Divider>또는 이메일로 이용하기</Divider>

        {/* Toggle Email Form Button */}
        {!showEmailForm ? (
          <PrimaryBtn type="button" onClick={() => setShowEmailForm(true)} disabled={isLoading}>
            이메일로 계속하기
          </PrimaryBtn>
        ) : (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <InputGroup>
              <InputLabel htmlFor="email-input">이메일 주소</InputLabel>
              <InputField
                id="email-input"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </InputGroup>

            <InputGroup>
              <InputLabel htmlFor="password-input">비밀번호</InputLabel>
              <InputField
                id="password-input"
                type="password"
                placeholder="비밀번호 입력 (6자리 이상)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </InputGroup>

            <PrimaryBtn type="submit" disabled={isLoading}>
              {isLoading ? '처리 중...' : isSignUp ? '가입하고 시작하기' : '로그인하고 시작하기'}
            </PrimaryBtn>

            <ToggleText>
              {isSignUp ? '이미 계정이 있으신가요?' : '처음이신가요?'}
              <span onClick={() => { setIsSignUp(!isSignUp); setPassword(''); }}>
                {isSignUp ? '로그인하기' : '회원가입하기'}
              </span>
            </ToggleText>
          </form>
        )}

        <FooterText>
          가입 시 <span className="text-point" style={{ fontWeight: 600 }}>이용약관</span> 및{' '}
          <span className="text-point" style={{ fontWeight: 600 }}>개인정보 처리방침</span>에 동의합니다.
        </FooterText>
      </FormSection>
    </PageWrapper>
  );
};
