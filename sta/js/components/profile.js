// ============================================
// 물꼬 (Mulco) - Profile & DM Component
// ============================================

// ─── 프로필 페이지 열기 ───
window.showProfile = function(userId) {
  closeModal('detail-modal-overlay');

  const user = getUserById(userId);
  if (!user) return;

  AppState.profileTarget = user;

  const page = document.getElementById('profile-page');

  // 아바타
  const avatarEl = document.getElementById('profile-avatar');
  avatarEl.innerHTML = '';
  avatarEl.style.display = 'flex';
  avatarEl.style.alignItems = 'center';
  avatarEl.style.justifyContent = 'center';
  avatarEl.style.overflow = 'hidden';
  
  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" class="profile-avatar-img" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply; filter:contrast(1.05);" />`;
    // 아바타 테마에 어울리는 파스텔 배경 강제 주입
    const avatarBgMap = { 'images/물고기.png': '#FFE5EC', 'images/수초.png': '#E5FAF0', 'images/용품.png': '#E5EEFF', 'images/찾아요.png': '#EDE5FF' };
    avatarEl.style.background = avatarBgMap[user.avatar] || 'var(--main)';
  } else {
    avatarEl.textContent = user.avatar_letter || user.nickname?.charAt(0) || '?';
    avatarEl.style.background = 'var(--main)';
  }

  const mapPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  // 닉네임, 동네, 한 줄 소개
  document.getElementById('profile-nickname').textContent = user.nickname;
  document.getElementById('profile-region').innerHTML = mapPinSvg + (user.region || '역삼동');
  document.getElementById('profile-memo').textContent = user.profile_memo || '';

  // 후기 배지 렌더링
  const badgeContainer = document.getElementById('profile-badges');
  const reviews = user.reviews || {};
  const sortedReviews = Object.entries(reviews).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (sortedReviews.length === 0) {
    badgeContainer.innerHTML = '<p class="text-sm text-muted">아직 후기가 없어요.</p>';
  } else {
    badgeContainer.innerHTML = sortedReviews.map(([keyword, count]) => `
      <div class="badge">
        ${keyword}
        <span class="badge-count">${count}</span>
      </div>
    `).join('');
  }

  // 해당 유저의 분양 이력
  const userItems = [
    ...MockData.biologyItems.filter(i => i.user_id === userId),
    ...MockData.goodsItems.filter(i => i.user_id === userId),
  ].slice(0, 3);

  const itemsContainer = document.getElementById('profile-items');
  const isMyProfile = userId === AppState.currentUser?.user_id;

  if (userItems.length === 0) {
    itemsContainer.innerHTML = '<p class="text-sm text-muted">분양/거래 이력이 없어요.</p>';
  } else {
    itemsContainer.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        ${userItems.map(item => {
          const isCompleted = item.status === 'COMPLETED';
          const statusText = isCompleted ? '거래완료' : '분양중';
          const statusColor = isCompleted ? 'var(--text-light)' : 'var(--point)';
          // 내 프로필 + 분양중 상태일 때만 거래완료 버튼 표시
          const completeBtn = (isMyProfile && !isCompleted)
            ? `<button onclick="completeItem('${item.item_id}', '${item.category}')" style="padding:4px 10px;background:var(--point);color:white;border:none;border-radius:9999px;font-size:0.68rem;font-weight:700;cursor:pointer;white-space:nowrap;font-family:var(--font);">✓ 완료</button>`
            : '';
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--white);border-radius:var(--radius-md);border:1px solid var(--muted);opacity:${isCompleted ? '0.6' : '1'}">
              <span style="font-size:1.4rem">${item.emoji}</span>
              <div style="flex:1">
                <div style="font-size:0.85rem;font-weight:600;color:var(--text)">${escapeHtml(item.title)}</div>
                <div style="font-size:0.72rem;color:${statusColor};font-weight:600">${statusText} · ${formatPrice(item.price)}</div>
              </div>
              ${completeBtn}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 내 프로필이면 채팅 버튼 숨김
  const ctaBtn = document.getElementById('chat-cta-btn');
  if (userId === AppState.currentUser?.user_id) {
    ctaBtn.style.display = 'none';
  } else {
    ctaBtn.style.display = 'flex';
    ctaBtn.onclick = () => openDM(userId);
  }

  showPage('profile-page');
};

// ─── 프로필 페이지 전용 바텀 메뉴 ───
window.openProfileMenu = function() {
  const targetUser = AppState.profileTarget;
  if (!targetUser) return;

  const isMyProfile = targetUser.user_id === AppState.currentUser?.user_id;
  const menuTitleEl = document.getElementById('profile-menu-title');
  const menuListEl = document.getElementById('profile-menu-list');

  if (isMyProfile) {
    // 1) 내가 내 프로필을 조회할 때의 전용 메뉴
    menuTitleEl.textContent = '내 프로필 메뉴';
    menuListEl.innerHTML = `
      <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px;" onclick="closeModal('profile-menu-modal-overlay'); showToast('프로필 편집 기능은 준비 중이에요!');">
        <span class="ms" style="margin-right:8px; font-size:20px;">edit</span> 프로필 정보 수정
      </button>
      <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px; border-color:var(--muted);" onclick="closeModal('profile-menu-modal-overlay'); logoutUser();">
        <span class="ms" style="margin-right:8px; font-size:20px; color:var(--danger);">logout</span> 로그아웃 (자동 로그인 해제)
      </button>
      <button class="btn btn-main" style="margin-top:8px; height:46px;" onclick="closeModal('profile-menu-modal-overlay')">
        닫기
      </button>
    `;
  } else {
    // 2) 다른 이웃의 프로필을 조회할 때의 전용 메뉴
    const isBlocked = AppState.blockedUsers.includes(targetUser.user_id);
    const blockBtnText = isBlocked ? '이웃 차단 해제' : '이웃 차단하기';
    const blockIcon = isBlocked ? 'do_not_disturb_on' : 'block';

    menuTitleEl.textContent = `${targetUser.nickname}님 설정`;
    menuListEl.innerHTML = `
      <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px; border-color:var(--muted);" onclick="closeModal('profile-menu-modal-overlay'); toggleBlockUser('${targetUser.user_id}');">
        <span class="ms" style="margin-right:8px; font-size:20px; color:var(--danger);">${blockIcon}</span> ${blockBtnText}
      </button>
      <button class="btn-icon" style="display:none;"></button> <!-- 빈 정렬용 버튼 -->
      <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px; border-color:var(--muted);" onclick="closeModal('profile-menu-modal-overlay'); openReportModal('${targetUser.user_id}');">
        <span class="ms" style="margin-right:8px; font-size:20px; color:var(--danger);">report</span> 이웃 신고하기
      </button>
      <button class="btn btn-main" style="margin-top:8px; height:46px;" onclick="closeModal('profile-menu-modal-overlay')">
        닫기
      </button>
    `;
  }

  openModal('profile-menu-modal-overlay');
};

// ─── 이웃 차단 / 해제 토글 처리 ───
window.toggleBlockUser = function(userId) {
  const user = getUserById(userId);
  if (!user) return;

  const index = AppState.blockedUsers.indexOf(userId);
  if (index !== -1) {
    // 이미 차단된 경우 -> 차단 해제
    AppState.blockedUsers.splice(index, 1);
    showToast(`✅ ${user.nickname}님의 차단을 해제했습니다.`);
  } else {
    // 차단되지 않은 경우 -> 차단 등록
    AppState.blockedUsers.push(userId);
    showToast(`🚫 ${user.nickname}님을 차단했습니다. 이제 이웃의 글과 메시지가 보이지 않습니다.`);
  }
};

// ─── 이웃 신고 팝업 오픈 ───
window.openReportModal = function(userId) {
  const user = getUserById(userId);
  if (!user) return;

  // 신고 대상 유저 전역 임시 타겟팅
  window._reportTargetUserId = userId;

  // 제목 및 폼 초기화
  document.getElementById('report-title').textContent = `${user.nickname}님 신고하기`;
  document.getElementById('report-subtitle').textContent = `'${user.nickname}'님을 신고하시는 사유를 알려주세요.`;
  
  // 첫 번째 항목 기본 선택 처리 및 기타 텍스트 지우기
  const firstRadio = document.querySelector('input[name="report-reason"]');
  if (firstRadio) firstRadio.checked = true;
  document.getElementById('report-detail').value = '';

  openModal('report-modal-overlay');
};

// ─── 신고 최종 접수 및 처리 ───
window.submitReport = function() {
  const userId = window._reportTargetUserId;
  const user = getUserById(userId);
  if (!user) return;

  // 선택된 사유 값 가져오기
  const selectedRadio = document.querySelector('input[name="report-reason"]:checked');
  const reasonVal = selectedRadio ? selectedRadio.value : '기타';
  const detailVal = document.getElementById('report-detail').value.trim();

  // 기타 선택 시 상세사유 검증
  if (reasonVal === '기타' && !detailVal) {
    showToast('⚠️ 기타 상세 신고 사유를 입력해 주세요.');
    return;
  }

  // 데모: 콘솔 로그 출력 (실제 서버가 있다면 여기로 전송)
  console.log(`[신고 접수] 대상: ${user.nickname}(${userId}), 사유: ${reasonVal}, 상세내용: ${detailVal}`);

  // 모달 닫기
  closeModal('report-modal-overlay');

  // 접수 완료 피드백 토스트 알림
  showToast(`🚨 ${user.nickname}님에 대한 신고가 접수되었습니다. 신속하게 검토하겠습니다!`);
};

// ─── 뒤로가기 ───
window.goBack = function() {
  showPage('main-page');
};

window.goBackFromDM = function() {
  showPage('profile-page');
};

// ─── 1:1 DM 대화방 설정 메뉴 ───
window.openDMMenu = function() {
  const targetUser = AppState.dmTarget;
  if (!targetUser) return;

  const menuTitleEl = document.getElementById('dm-menu-title');
  const menuListEl = document.getElementById('dm-menu-list');

  // 차단 상태 체크
  const isBlocked = AppState.blockedUsers.includes(targetUser.user_id);
  const blockBtnText = isBlocked ? '이웃 차단 해제' : '이웃 차단하기';
  const blockIcon = isBlocked ? 'do_not_disturb_on' : 'block';

  menuTitleEl.textContent = `${targetUser.nickname}님과의 대화`;
  menuListEl.innerHTML = `
    <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px;" onclick="closeModal('dm-menu-modal-overlay'); showProfile('${targetUser.user_id}');">
      <span class="ms" style="margin-right:8px; font-size:20px;">person</span> 상대방 프로필 보기
    </button>
    <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px; border-color:var(--muted);" onclick="closeModal('dm-menu-modal-overlay'); toggleBlockFromDM('${targetUser.user_id}');">
      <span class="ms" style="margin-right:8px; font-size:20px; color:var(--danger);">${blockIcon}</span> ${blockBtnText}
    </button>
    <button class="btn btn-outline" style="justify-content:flex-start; height:50px; text-align:left; padding-left:16px; border-color:var(--muted);" onclick="closeModal('dm-menu-modal-overlay'); leaveChatRoom('${targetUser.user_id}');">
      <span class="ms" style="margin-right:8px; font-size:20px; color:var(--text-light);">logout</span> 대화방 나가기
    </button>
    <button class="btn btn-main" style="margin-top:8px; height:46px;" onclick="closeModal('dm-menu-modal-overlay')">
      닫기
    </button>
  `;

  openModal('dm-menu-modal-overlay');
};

// ─── DM 방 내부에서의 차단 처리 우회 연동 ───
window.toggleBlockFromDM = function(userId) {
  // 기존 차단 기능 재활용
  toggleBlockUser(userId);
};

// ─── 대화방 나가기 ───
window.leaveChatRoom = function(userId) {
  const user = getUserById(userId);
  const nickname = user ? user.nickname : '이웃';
  
  // 대화 내역 초기화 (데모)
  if (AppState.tempDmMessages[userId]) {
    delete AppState.tempDmMessages[userId];
  }
  
  showToast(`🚪 ${nickname}님과의 대화방을 나갔습니다.`);
  
  // 메인 단톡방 페이지로 라우팅
  showPage('main-page');
};

// ─── 1:1 DM 열기 ───
window.openDM = function(userId) {
  const user = getUserById(userId);
  if (!user) return;

  AppState.dmTarget = user;

  const mapPinSmSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  document.getElementById('dm-user-name').textContent = user.nickname;
  document.getElementById('dm-user-region').innerHTML = mapPinSmSvg + (user.region || '역삼동');
  const dmAvatarEl = document.getElementById('dm-avatar');
  dmAvatarEl.innerHTML = '';
  dmAvatarEl.style.display = 'flex';
  dmAvatarEl.style.alignItems = 'center';
  dmAvatarEl.style.justifyContent = 'center';
  dmAvatarEl.style.overflow = 'hidden';

  if (user.avatar) {
    dmAvatarEl.innerHTML = `<img src="${user.avatar}" class="dm-avatar-img" style="width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply; filter:contrast(1.05);" />`;
    const avatarBgMap = { 'images/물고기.png': '#FFE5EC', 'images/수초.png': '#E5FAF0', 'images/용품.png': '#E5EEFF', 'images/찾아요.png': '#EDE5FF' };
    dmAvatarEl.style.background = avatarBgMap[user.avatar] || 'var(--main)';
  } else {
    dmAvatarEl.textContent = user.avatar_letter || user.nickname?.charAt(0) || '?';
    dmAvatarEl.style.background = 'var(--main)';
  }

  const container = document.getElementById('dm-messages');
  container.innerHTML = '';

  // 기존 DM 내역
  const history = AppState.tempDmMessages[userId] || [];

  if (history.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `
      <div class="empty-state-icon">💬</div>
      <div class="empty-state-text">${user.nickname}님과의 첫 대화를 시작해보세요!</div>
    `;
    container.appendChild(emptyDiv);
  } else {
    history.forEach(msg => container.appendChild(createDMBubble(msg)));
  }

  setTimeout(() => container.scrollTop = container.scrollHeight, 50);

  // DM 전송
  const input = document.getElementById('dm-input');
  const sendBtn = document.getElementById('dm-send-btn');

  sendBtn.onclick = null;
  input.onkeydown = null;

  function sendDM() {
    const content = input.value.trim();
    if (!content) return;

    if (!AppState.tempDmMessages[userId]) AppState.tempDmMessages[userId] = [];

    const newMsg = {
      message_id: 'dm_new_' + Date.now(),
      user_id: AppState.currentUser.user_id,
      type: 'mine',
      content,
      time: getCurrentTime(),
    };

    AppState.tempDmMessages[userId].push(newMsg);
    container.appendChild(createDMBubble(newMsg));
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // 간단 자동응답
    setTimeout(() => {
      const reply = {
        message_id: 'dm_auto_' + Date.now(),
        user_id: userId,
        type: 'other',
        content: getAutoReply(),
        time: getCurrentTime(),
      };
      AppState.tempDmMessages[userId].push(reply);
      container.appendChild(createDMBubble(reply));
      container.scrollTop = container.scrollHeight;
    }, 1000 + Math.random() * 1500);
  }

  sendBtn.addEventListener('click', sendDM);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDM(); }
  });

  showPage('dm-page');
};

function createDMBubble(msg) {
  const isMe = msg.type === 'mine';
  const user = isMe ? AppState.currentUser : AppState.dmTarget;
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${isMe ? 'mine' : 'other'}`;

  if (!isMe) {
    let avatarMarkup = '';
    if (user?.avatar) {
      avatarMarkup = `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:contain; border-radius:50%; mix-blend-mode:multiply; filter:contrast(1.05);" />`;
    } else {
      avatarMarkup = user?.avatar_letter || user?.nickname?.charAt(0) || '?';
    }

    wrapper.innerHTML = `
      <div class="chat-avatar" style="display:flex; align-items:center; justify-content:center; overflow:hidden;">${avatarMarkup}</div>
      <div class="chat-bubble-wrap">
        <div class="chat-sender">${user?.nickname || ''}</div>
        <div class="chat-bubble">${escapeHtml(msg.content)}</div>
        <div class="chat-time">${msg.time}</div>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="chat-bubble-wrap">
        <div class="chat-bubble">${escapeHtml(msg.content)}</div>
        <div class="chat-time">${msg.time}</div>
      </div>
    `;
  }
  return wrapper;
}

const dmAutoReplies = [
  '네 가능해요! 언제 편하세요?',
  '알겠어요 😊 오후 시간대 어떠세요?',
  '좋아요! 위치는 역삼역 근처로 할까요?',
  '네 확인했어요. 조금 이따 연락드릴게요!',
  '감사해요! 건강한 생물 보내드릴게요 🐟',
];

function getAutoReply() {
  return dmAutoReplies[Math.floor(Math.random() * dmAutoReplies.length)];
}

// ─── 후기 팝업 ───
window.openReviewPopup = function(userId) {
  const user = getUserById(userId);
  const modal = document.getElementById('review-modal-overlay');
  const content = document.getElementById('review-modal-content');
  let selected = new Set();

  content.innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-title">
      ⭐ ${user?.nickname || '상대'}님 후기 남기기
    </div>
    <p class="text-sm text-muted text-center" style="margin-bottom:16px">어떤 점이 좋으셨나요? (복수 선택 가능)</p>
    <div class="review-keywords">
      ${MockData.reviewKeywords.map((kw, i) => `
        <div class="keyword-chip" data-index="${i}" onclick="toggleKeyword(this, '${kw}')">
          ${kw}
        </div>
      `).join('')}
    </div>
    <button class="btn btn-primary" style="margin-top:16px" onclick="submitReview('${userId}')">
      후기 남기기
    </button>
    <button class="btn btn-ghost" style="margin-top:8px" onclick="closeModal('review-modal-overlay')">
      건너뛰기
    </button>
  `;

  openModal('review-modal-overlay');
};

window.toggleKeyword = function(el, keyword) {
  el.classList.toggle('selected');
};

window.submitReview = function(userId) {
  const selected = Array.from(document.querySelectorAll('.keyword-chip.selected'))
    .map(el => el.textContent.trim());

  if (selected.length === 0) {
    showToast('최소 1개 이상 선택해주세요');
    return;
  }

  // 프로필에 반영
  const user = MockData.users[userId];
  if (user) {
    selected.forEach(kw => {
      // 이모지 제거 후 키 매칭
      const key = '#' + kw.replace(/[^\uAC00-\uD7A3가-힣a-zA-Z]/g, '').replace(/^/, '');
      // 간단히 텍스트에서 한글+영어만
      const cleanKw = kw.replace(/[\u{1F300}-\u{1FFFF}]|\s/gu, '').trim();
      const fullKey = '#' + cleanKw;

      // 기존 키 중 포함되는 거 찾아서 +1
      let matched = false;
      for (const k of Object.keys(user.reviews)) {
        if (kw.includes(k.replace('#', '')) || k.includes(cleanKw)) {
          user.reviews[k] = (user.reviews[k] || 0) + 1;
          matched = true;
          break;
        }
      }
      if (!matched) user.reviews[fullKey] = 1;
    });
  }

  closeModal('review-modal-overlay');
  showToast('✅ 후기가 등록되었습니다!');

  // 프로필이 열려있으면 갱신
  if (AppState.profileTarget?.user_id === userId) {
    showProfile(userId);
  }
};
