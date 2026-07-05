import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/common/Icons';

const PageWrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background-color: ${props => props.theme.colors.bg};
`;

const HeroSection = styled.div`
  background: linear-gradient(160deg, #D1E6E8 0%, #E2EFE7 100%);
  padding: 60px 24px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-sm);
`;

const HeroIcon = styled.div`
  margin-bottom: 20px;
  animation: fadeIn 0.8s ease;
`;

const LogoWordmark = styled.img`
  width: 96px;
  margin-bottom: 12px;
`;

const Tagline = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme.colors.point};
  line-height: 1.5;
  opacity: 0.9;
  font-weight: 500;
`;

const FormSection = styled.div`
  flex: 1;
  padding: 32px 24px 40px;
  display: flex;
  flex-direction: column;
`;

const FormTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: ${props => props.theme.colors.text};
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  opacity: 0.55;
  margin-bottom: 8px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const InputField = styled.input`
  flex: 1;
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 14px 16px;
  font-size: 0.95rem;
  transition: ${props => props.theme.transitions.default};

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const Btn = styled.button`
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.92rem;
  transition: ${props => props.theme.transitions.default};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainBtn = styled(Btn)`
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.point};
  padding: 14px 16px;
  width: auto;
  white-space: nowrap;

  &:active {
    opacity: 0.95;
  }
`;

const PrimaryBtn = styled(Btn)`
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  padding: 15px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(58, 96, 115, 0.15);

  &:active {
    transform: scale(0.99);
  }
`;

const OtpContainer = styled.div`
  margin-top: 8px;
  animation: slideUp 0.3s ease;
`;

const OtpRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
`;

const OtpInput = styled.input`
  width: 48px;
  height: 52px;
  background-color: ${props => props.theme.colors.white};
  border: 1.8px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  transition: ${props => props.theme.transitions.default};

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const FooterText = styled.p`
  margin-top: auto;
  padding-top: 24px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.5;
  text-align: center;
`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, setCurrentUser, currentUser } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If user already logged in, redirect to main
  useEffect(() => {
    if (currentUser) {
      navigate('/main');
    }
  }, [currentUser, navigate]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    setPhoneNumber(value);
  };

  const handleSendCode = () => {
    const rawNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (rawNumber.length < 10) {
      showToast('올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsOtpSent(true);
      showToast('인증번호: 123456 (데모)');
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 50);
    }, 1200);
  };

  const handleOtpChange = (index: number, val: string) => {
    const numericVal = val.replace(/[^0-9]/g, '');
    if (!numericVal && val !== '') return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = numericVal.slice(-1);
    setOtpValues(newOtpValues);

    if (numericVal && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (otp === '123456') {
        setIsVerified(true);
        showToast('인증이 완료되었습니다! 🎉');
        setTimeout(() => {
          // Initialize temp structure
          setCurrentUser({
            user_id: 'u001',
            nickname: '물꼬지기',
            phone_number: phoneNumber,
            region: '강남구 역삼동',
            profile_memo: '구피 덕후 3년차 🐟 치어 나눔 좋아합니다!',
            avatar: 'images/avatar-girl.png',
            created_at: new Date().toISOString().split('T')[0]
          });
          navigate('/setup');
        }, 600);
      } else {
        showToast('인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
        setOtpValues(Array(6).fill(''));
        otpRefs.current[0]?.focus();
      }
    }, 1000);
  };

  const isOtpComplete = otpValues.every(val => val.length === 1);

  return (
    <PageWrapper>
      <HeroSection>
        <HeroIcon id="hero-illustration">
          {Icons.heroFish}
        </HeroIcon>
        <LogoWordmark src="/images/logo-wordmark.png" alt="물꼬 Mulco" />
        <Tagline>
          우리 동네 이웃 물집사들과<br />
          생물·용품·수초를 나눔하세요
        </Tagline>
      </HeroSection>

      <FormSection>
        <FormTitle>전화번호로 시작하기</FormTitle>

        <InputGroup>
          <InputLabel htmlFor="phone-input">휴대폰 번호</InputLabel>
          <InputRow>
            <InputField
              id="phone-input"
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="010-0000-0000"
              autoComplete="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={isOtpSent || isSending}
            />
            <MainBtn 
              id="send-code-btn" 
              onClick={handleSendCode} 
              disabled={isSending || isOtpSent}
            >
              {isSending ? '발송 중...' : isOtpSent ? '재발송' : '인증번호 받기'}
            </MainBtn>
          </InputRow>
        </InputGroup>

        {isOtpSent && (
          <OtpContainer id="otp-section">
            <InputGroup>
              <InputLabel>인증번호 6자리</InputLabel>
              <OtpRow>
                {Array(6).fill(0).map((_, i) => (
                  <OtpInput
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    maxLength={1}
                    inputMode="numeric"
                    type="text"
                    value={otpValues[i]}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    disabled={isVerifying || isVerified}
                  />
                ))}
              </OtpRow>
            </InputGroup>

            <PrimaryBtn
              id="verify-btn"
              disabled={!isOtpComplete || isVerifying || isVerified}
              onClick={handleVerify}
              style={{
                backgroundColor: isVerified ? '#4caf7a' : undefined,
                opacity: isOtpComplete ? 1 : 0.5
              }}
            >
              {isVerified ? '✓ 인증 완료' : isVerifying ? '확인 중...' : '인증하고 시작하기'}
            </PrimaryBtn>
          </OtpContainer>
        )}

        <FooterText>
          가입 시 <span className="text-point" style={{ fontWeight: 600 }}>이용약관</span> 및{' '}
          <span className="text-point" style={{ fontWeight: 600 }}>개인정보 처리방침</span>에 동의합니다.
        </FooterText>
      </FormSection>
    </PageWrapper>
  );
};
