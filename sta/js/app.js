// ============================================
// 물꼬 (Mulco) - App Router & State Manager
// ============================================

const AppState = {
  currentUser: null,
  currentRoom: MockData.chatRooms['room001'],
  currentTab: 'all-chat',
  selectedRegion: null,
  tempMessages: [...MockData.chatMessages],
  tempDmMessages: { ...MockData.dmMessages },
  dmTarget: null,
  profileTarget: null,
  blockedUsers: ['u004'], // 차단된 유저 ID 목록 (u004 이웃 임시 차단 세팅)
};

// ─── 페이지 전환 ───
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'flex';
    requestAnimationFrame(() => {
      page.classList.add('active');
    });
  }
}

// ─── 탭 전환 ───
function switchTab(tabName) {
  AppState.currentTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = content.dataset.tab === tabName ? 'flex' : 'none';
  });
}

// ─── 유틸리티 ───
function getUserById(userId) {
  if (userId === AppState.currentUser?.user_id) return AppState.currentUser;
  return MockData.users[userId] || null;
}

function formatPrice(price) {
  if (price === 0) return '나눔';
  return price.toLocaleString('ko-KR') + '원';
}

// ─── 모달 열기/닫기 ───
function openModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ─── 메인 메뉴 바텀 시트 액션 ───
window.viewMyProfile = function() {
  closeModal('menu-modal-overlay');
  if (AppState.currentUser) {
    // profile.js에 내장된 전역 프로필 이동 함수 호출
    showProfile(AppState.currentUser.user_id);
  } else {
    showToast('로그인 정보가 없어요.');
  }
};

window.logoutUser = function() {
  closeModal('menu-modal-overlay');
  
  // 자동 로그인 정보 삭제
  localStorage.removeItem('mulco_user');
  AppState.currentUser = null;
  
  // 로그아웃 피드백 토스트
  showToast('로그아웃되었습니다. 첫 화면으로 이동합니다. 👋');
  
  // 로그인 페이지로 라우팅
  showPage('login-page');
  
  // 로그인 컴포넌트 재초기화
  initLoginPage();
};

// ─── 앱 초기화 (자동 로그인 처리 추가) ───
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('mulco_user');
  
  if (savedUser) {
    try {
      // 저장된 사용자 정보 복원
      AppState.currentUser = JSON.parse(savedUser);
      
      // 메인 페이지로 즉시 진입 및 메인 페이지 초기화
      showPage('main-page');
      initMainPage();
      showToast(`${AppState.currentUser.nickname}님, 다시 만나서 반가워요! 🐠`);
    } catch (e) {
      console.error('로그인 정보 복원 실패:', e);
      localStorage.removeItem('mulco_user');
      showPage('login-page');
      initLoginPage();
    }
  } else {
    // 저장된 계정이 없는 경우 첫 로그인 화면 노출
    showPage('login-page');
    initLoginPage();
  }
});
