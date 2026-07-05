// ============================================
// 물꼬 (Mulco) - Main Chat Page Component
// ============================================

function initMainPage() {
  // 동네 이름 업데이트
  document.getElementById('room-name').textContent =
    AppState.currentUser?.region + ' 물생활 단톡방';

  // 탭 초기화
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  switchTab('all-chat');

  // 각 탭 콘텐츠 렌더링
  renderChatTab();
  renderBiologyTab();
  renderGoodsTab();

  // FAB 버튼 이벤트
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    const activeTab = AppState.currentTab;
    if (activeTab === 'biology') openPostModal('biology');
    else if (activeTab === 'goods') openPostModal('goods');
    else openPostModal('biology');
  });
}

// ─── [전체채팅] 탭 렌더링 ───
function renderChatTab() {
  const container = document.getElementById('all-chat-messages');
  container.innerHTML = '';

  // 날짜 구분선
  const divider = document.createElement('div');
  divider.className = 'chat-date-divider';
  divider.textContent = '2026년 7월 5일';
  container.appendChild(divider);

  AppState.tempMessages.forEach(msg => {
    container.appendChild(createChatBubble(msg));
  });

  // 스크롤 최하단
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);

  // 채팅 전송
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  function sendMessage() {
    const content = input.value.trim();
    if (!content) return;

    const newMsg = {
      message_id: 'new_' + Date.now(),
      user_id: AppState.currentUser.user_id,
      type: 'mine',
      content,
      time: getCurrentTime(),
    };

    AppState.tempMessages.push(newMsg);
    container.appendChild(createChatBubble(newMsg));
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // 랜덤 자동응답 (데모)
    setTimeout(() => simulateReply(container), 1500 + Math.random() * 2000);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function createChatBubble(msg) {
  const isMe = msg.type === 'mine';
  const user = isMe ? AppState.currentUser : getUserById(msg.user_id);
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${isMe ? 'mine' : 'other'}`;

  // 프로필 아바타 렌더링 마크업 (이미지 vs 첫글자 분기)
  let avatarMarkup = '';
  if (user?.avatar) {
    avatarMarkup = `<img src="${user.avatar}" class="chat-avatar-image" style="width:100%; height:100%; object-fit:contain; border-radius:50%; mix-blend-mode:multiply; filter:contrast(1.05);" />`;
  } else {
    avatarMarkup = user?.avatar_letter || user?.nickname?.charAt(0) || '?';
  }

  if (!isMe) {
    wrapper.innerHTML = `
      <div class="chat-avatar" onclick="showProfile('${msg.user_id}')" style="cursor:pointer; display:flex; align-items:center; justify-content:center; overflow:hidden;">
        ${avatarMarkup}
      </div>
      <div class="chat-bubble-wrap">
        <div class="chat-sender">${user?.nickname || '알 수 없음'}</div>
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

// 자동응답 시뮬레이션
const autoReplies = [
  { user_id: 'u002', content: '저도 궁금했던 내용이에요 😊' },
  { user_id: 'u003', content: '오 정보 감사해요! 도움 됩니다 🌿' },
  { user_id: 'u005', content: '맞아요 저도 그렇게 하고 있어요 👍' },
  { user_id: 'u004', content: '알려주셔서 감사해요! 초보라 모르는 게 많아요 😅' },
];

function simulateReply(container) {
  const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
  const msg = {
    ...reply,
    message_id: 'auto_' + Date.now(),
    type: 'other',
    time: getCurrentTime(),
  };
  container.appendChild(createChatBubble(msg));
  container.scrollTop = container.scrollHeight;
}

// ─── [생물분양] 탭 렌더링 ───
function renderBiologyTab() {
  const grid = document.getElementById('biology-grid');
  grid.innerHTML = '';

  if (MockData.biologyItems.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🐟</div>
        <div class="empty-state-text">아직 분양 글이 없어요.<br>첫 번째로 올려보세요!</div>
      </div>
    `;
    return;
  }

  MockData.biologyItems.forEach(item => {
    grid.appendChild(createMarketCard(item));
  });
}

// ─── [용품/수초] 탭 렌더링 ───
function renderGoodsTab() {
  const grid = document.getElementById('goods-grid');
  grid.innerHTML = '';

  MockData.goodsItems.forEach(item => {
    grid.appendChild(createMarketCard(item));
  });
}

function createMarketCard(item) {
  const card = document.createElement('div');
  card.className = 'market-card';

  const isCompleted = item.status === 'COMPLETED';
  const isMyItem = item.user_id === AppState.currentUser?.user_id;
  const tagClass = isCompleted ? 'tag-complete' : (item.trade_type === 'GIVE' ? 'tag-give' : 'tag-take');
  const tagText = isCompleted ? '거래완료' : (item.trade_type === 'GIVE' ? '보내요' : '받아요');
  const priceClass = item.price === 0 ? 'free' : '';
  const seller = getUserById(item.user_id);

  // 귀여운 파스텔 일러스트 SVG 아이콘 정보 획득
  const iconInfo = getItemIconSvg(item);

  // 내 카드 + 분양중 상태일 때만 거래완료 버튼 표시
  const completeBtnHtml = (isMyItem && !isCompleted) ? `
    <button
      class="complete-btn"
      onclick="event.stopPropagation(); completeItem('${item.item_id}', '${item.category}')"
      title="거래완료로 변경"
    >완료</button>
  ` : '';

  // 위치핀 미니멀 SVG
  const mapPinSvg = `<svg viewBox="0 0 14 14" width="11" height="11" fill="none" style="vertical-align:middle;margin-right:2px"><path d="M7 1a4.5 4.5 0 0 0-4.5 4.5C2.5 8.5 7 13 7 13s4.5-4.5 4.5-7.5A4.5 4.5 0 0 0 7 1z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="5.5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>`;

  // 아이콘 표시용 마크업 생성 (이미지 vs 이모지 분기)
  const iconHtml = iconInfo.isImage 
    ? `<img src="${iconInfo.src}" alt="${item.title}" class="market-card-thumb-img" />`
    : `<span class="card-emoji">${iconInfo.emoji}</span>`;

  card.innerHTML = `
    <div class="market-card-img" style="background:${iconInfo.bg}">
      ${iconHtml}
    </div>
    <div class="market-card-body">
      <span class="market-card-tag ${tagClass}">${tagText}</span>
      <div class="market-card-title">${escapeHtml(item.title)}</div>
      <div class="market-card-price ${priceClass}">${formatPrice(item.price)}</div>
      <div class="market-card-user">${mapPinSvg}${seller?.nickname || '알 수 없음'}</div>
    </div>
    ${completeBtnHtml}
    ${isCompleted ? '<div style="position:absolute;inset:0;background:rgba(253,249,247,0.5);border-radius:var(--radius-lg)"></div>' : ''}
  `;

  // 클릭 시 바로 프로필로 이동 (상세 모달 생략)
  if (!isCompleted) {
    card.addEventListener('click', () => showProfile(item.user_id));
  }
  return card;
}

// ─── 거래완료 처리 ───
window.completeItem = function(itemId, category) {
  const list = category === 'BIOLOGY' ? MockData.biologyItems : MockData.goodsItems;
  const item = list.find(i => i.item_id === itemId);
  if (!item) return;

  item.status = 'COMPLETED';

  // 탭 재렌더링
  if (category === 'BIOLOGY') renderBiologyTab();
  else renderGoodsTab();

  // 상대방 userId 추출 (데모: 가장 최근 DM 상대 또는 랜덤 이웃)
  const otherUserIds = Object.keys(MockData.users);
  const targetUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];

  // 후기 팝업 자동 트리거 (약간의 딜레이로 탭 전환 후 자연스럽게)
  setTimeout(() => {
    openReviewPopup(targetUserId);
  }, 400);
};

// ─── 게시글 작성 모달 ───
function openPostModal(category) {
  const modal = document.getElementById('post-modal-overlay');
  const content = document.getElementById('post-modal-content');
  const catLabel = category === 'biology' ? '생물 분양' : '용품·수초';

  // 업로드된 이미지 상태 초기화
  window._uploadedPostImage = null;

  content.innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-title">✍️ ${catLabel} 등록하기</div>

    <div class="input-group">
      <label class="input-label">분양 형태</label>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline" style="flex:1;padding:10px" id="type-give" onclick="selectTradeType('give')">📤 보내요</button>
        <button class="btn btn-outline" style="flex:1;padding:10px" id="type-take" onclick="selectTradeType('take')">📥 받아요</button>
      </div>
    </div>

    <div class="input-group">
      <label class="input-label">${category === 'biology' ? '어종 / 생물명' : '품목 이름'}</label>
      <input class="input-field" id="post-title" placeholder="${category === 'biology' ? '예: 구피 치어, 안시 플레코...' : '예: 외부여과기, 자바모스...'}">
    </div>

    <div class="input-group">
      <label class="input-label">책임비 / 가격 (0원 = 나눔)</label>
      <input class="input-field" id="post-price" type="number" placeholder="0" min="0">
    </div>

    <div class="input-group">
      <label class="input-label">설명</label>
      <textarea class="input-field" id="post-desc" rows="3" placeholder="간단한 설명을 적어주세요..." style="resize:none"></textarea>
    </div>

    <div class="input-group">
      <label class="input-label">사진 등록 (선택)</label>
      <!-- 숨겨진 갤러리 피커 파일 인풋 -->
      <input type="file" id="post-image-file-gallery" accept="image/*" style="display:none;" />
      <!-- 숨겨진 카메라 촬영 파일 인풋 (capture 속성 부여) -->
      <input type="file" id="post-image-file-camera" accept="image/*" capture="camera" style="display:none;" />
      
      <!-- 클릭 가능한 디자인 첨부 박스 -->
      <div id="post-image-trigger" style="width:100%; aspect-ratio:3/2; background:#f8f9fa; border-radius:var(--radius-md); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; font-size:0.82rem; color:var(--text-light); border:1.8px dashed var(--muted-dark); overflow:hidden; transition:var(--transition);">
        <span id="post-image-placeholder-icon" style="font-size:2rem; margin-bottom:4px;">📷</span>
        <span id="post-image-placeholder-text">터치해서 사진 올리기</span>
        <img id="post-image-preview" style="display:none; width:100%; height:100%; object-fit:cover;" />
      </div>
    </div>

    <button class="btn btn-primary" onclick="submitPost('${category}')" style="margin-top:12px;">등록하기</button>
  `;

  openModal('post-modal-overlay');
  window._selectedTradeType = null;
  window.selectTradeType('give'); // 기본 분양형태 선택

  // 사진 박스 클릭 시 선택 팝업 열기
  const trigger = document.getElementById('post-image-trigger');
  if (trigger) {
    trigger.addEventListener('click', () => {
      openModal('post-image-select-overlay');
    });
  }

  // 공용 이미지 리더 처리기
  const prevImg = document.getElementById('post-image-preview');
  const icon = document.getElementById('post-image-placeholder-icon');
  const text = document.getElementById('post-image-placeholder-text');

  // 공용 이미지 리사이징 및 압축 처리기
  function handleFileLoad(file) {
    if (!file) return;

    resizeAndCompressImage(file, 600, 600, 0.7, (compressedBase64) => {
      window._uploadedPostImage = compressedBase64; // 압축된 초경량 base64 저장

      // 미리보기 화면 갱신
      prevImg.src = compressedBase64;
      prevImg.style.display = 'block';
      icon.style.display = 'none';
      text.style.display = 'none';
      if (trigger) {
        trigger.style.borderStyle = 'solid';
        trigger.style.borderColor = 'var(--point)';
      }
    });
  }

  // 전역 이미지 소스 트리거 함수 노출
  window.triggerPostImageSource = function(source) {
    if (source === 'gallery') {
      const inputGal = document.getElementById('post-image-file-gallery');
      if (inputGal) {
        inputGal.onchange = (e) => handleFileLoad(e.target.files[0]);
        inputGal.click();
      }
    } else if (source === 'camera') {
      const inputCam = document.getElementById('post-image-file-camera');
      if (inputCam) {
        inputCam.onchange = (e) => handleFileLoad(e.target.files[0]);
        inputCam.click();
      }
    }
  };
}

window.selectTradeType = function(type) {
  window._selectedTradeType = type;
  document.getElementById('type-give').className = 'btn ' + (type === 'give' ? 'btn-primary' : 'btn-outline');
  document.getElementById('type-give').style.flex = '1';
  document.getElementById('type-give').style.padding = '10px';
  document.getElementById('type-take').className = 'btn ' + (type === 'take' ? 'btn-primary' : 'btn-outline');
  document.getElementById('type-take').style.flex = '1';
  document.getElementById('type-take').style.padding = '10px';
};

window.submitPost = function(category) {
  const title = document.getElementById('post-title').value.trim();
  const price = parseInt(document.getElementById('post-price').value) || 0;
  const desc = document.getElementById('post-desc').value.trim();
  const tradeType = window._selectedTradeType || 'GIVE';

  if (!title) {
    showToast('제목을 입력해주세요');
    return;
  }

  const emojiMap = { 'GIVE': '🐠', 'TAKE': '🔍', 'give': '🐠', 'take': '🔍' };
  const newItem = {
    item_id: 'new_' + Date.now(),
    user_id: AppState.currentUser.user_id,
    category: category.toUpperCase(),
    trade_type: (tradeType || 'give').toUpperCase(),
    title,
    price,
    emoji: emojiMap[tradeType] || '🐠',
    description: desc,
    status: 'AVAILABLE',
    created_at: new Date().toISOString().split('T')[0],
    image: window._uploadedPostImage || null // 직접 올린 base64 이미지 저장
  };

  if (category === 'biology') {
    MockData.biologyItems.unshift(newItem);
    renderBiologyTab();
  } else {
    MockData.goodsItems.unshift(newItem);
    renderGoodsTab();
  }

  closeModal('post-modal-overlay');
  showToast('✅ 등록되었습니다!');
};

// ─── 유틸 ───
function getCurrentTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${m}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── 이미지 리사이즈 & JPEG 압축 헬퍼 ───
function resizeAndCompressImage(file, maxWidth, maxHeight, quality, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // 비례 축소 계산
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // 가상 캔버스 생성 및 드로잉
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // JPEG 포맷 및 화질(Quality: 0.7 = 70%) 압축 적용
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(compressedDataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
