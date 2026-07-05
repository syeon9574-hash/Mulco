// ============================================
// 물꼬 (Mulco) - Login Page Component
// ============================================

function initLoginPage() {
  const page = document.getElementById('login-page');

  // 전화번호 입력 → 인증번호 전송
  const phoneInput = document.getElementById('phone-input');
  const sendCodeBtn = document.getElementById('send-code-btn');
  const otpSection = document.getElementById('otp-section');
  const otpInputs = document.querySelectorAll('.otp-input');
  const verifyBtn = document.getElementById('verify-btn');

  let codeSent = false;

  sendCodeBtn.addEventListener('click', () => {
    const phone = phoneInput.value.replace(/[^0-9]/g, '');
    if (phone.length < 10) {
      phoneInput.style.borderColor = 'var(--danger)';
      setTimeout(() => phoneInput.style.borderColor = '', 1200);
      return;
    }

    // 인증번호 발송 애니메이션
    sendCodeBtn.textContent = '발송 중...';
    sendCodeBtn.disabled = true;

    setTimeout(() => {
      sendCodeBtn.textContent = '재발송';
      sendCodeBtn.disabled = false;
      otpSection.style.display = 'block';
      otpSection.style.animation = 'slideUp 0.3s ease';
      otpInputs[0].focus();
      codeSent = true;

      // 인증번호 힌트 (데모용)
      showToast('인증번호: 123456 (데모)');
    }, 1200);
  });

  // OTP 자동 포커스
  otpInputs.forEach((input, i) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
      checkOtpComplete();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
  });

  function checkOtpComplete() {
    const otp = Array.from(otpInputs).map(i => i.value).join('');
    if (otp.length === 6) {
      verifyBtn.style.opacity = '1';
      verifyBtn.disabled = false;
    }
  }

  // 인증 완료 → 동네 설정 페이지로
  verifyBtn.addEventListener('click', () => {
    const otp = Array.from(otpInputs).map(i => i.value).join('');
    if (otp === '123456' || otp.length === 6) {
      verifyBtn.textContent = '✓ 인증 완료';
      verifyBtn.style.background = '#4caf7a';
      setTimeout(() => {
        AppState.currentUser = { ...MockData.currentUser };
        showPage('setup-page');
        initSetupPage();
      }, 600);
    } else {
      otpInputs.forEach(inp => {
        inp.style.borderColor = 'var(--danger)';
        setTimeout(() => inp.style.borderColor = '', 1200);
      });
    }
  });

  // 전화번호 자동 포매팅
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    e.target.value = value;
  });
}

// ─── Toast 메시지 ───
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(44,44,44,0.88);
    color: white;
    padding: 10px 20px;
    border-radius: 9999px;
    font-size: 0.82rem;
    font-family: var(--font);
    z-index: 9999;
    animation: slideUp 0.25s ease;
    white-space: nowrap;
    backdrop-filter: blur(8px);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}
