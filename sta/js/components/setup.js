// ============================================
// 물꼬 (Mulco) - Setup Page Component
// ============================================

const SAMPLE_REGIONS = [
  { code: 'yeoksam', name: '강남구 역삼동', emoji: '📍' },
  { code: 'nonhyeon', name: '강남구 논현동', emoji: '📍' },
  { code: 'seocho', name: '서초구 서초동', emoji: '📍' },
  { code: 'banpo', name: '서초구 반포동', emoji: '📍' },
];

function initSetupPage() {
  let step = 1;
  let selectedRegion = null;

  const regionList = document.getElementById('region-list');
  const nicknameSection = document.getElementById('nickname-section');
  const regionSection = document.getElementById('region-section');
  const nicknameInput = document.getElementById('nickname-input');
  const charCounter = document.getElementById('nickname-char-counter');
  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('region-next-btn');
  const dots = document.querySelectorAll('.step-dot');
  const gpsBtn = document.getElementById('gps-btn');

  // GPS 실제 탐색 및 한글 주소 변환 기능
  gpsBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('이 브라우저는 GPS 위치 정보를 지원하지 않아요.');
      return;
    }

    gpsBtn.textContent = '📡 GPS 신호 탐색 중...';
    gpsBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          gpsBtn.textContent = '🔍 동네 주소 변환 중...';
          // OpenStreetMap Nominatim API를 통해 경도/위도 좌표를 주소로 변환
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=ko`);
          
          if (!response.ok) throw new Error('API 응답 실패');
          
          const data = await response.json();
          
          // 동네 주소 파싱 (구 단위 + 동 단위 추출)
          const addr = data.address;
          const city = addr.city || addr.town || addr.province || ''; // 시/도
          const borough = addr.borough || addr.suburb || addr.district || ''; // 구
          const dong = addr.neighbourhood || addr.village || addr.quarter || addr.suburb || ''; // 동/리
          
          let regionName = '';
          if (borough && dong) {
            regionName = `${borough} ${dong}`;
          } else if (dong) {
            regionName = dong;
          } else if (data.display_name) {
            // 한글 주소 문자열에서 필요한 동/구 명칭 일부 파싱
            const parts = data.display_name.split(',').map(p => p.trim());
            // 뒷부분이나 적절한 동 명칭 결합
            regionName = parts[2] || parts[1] || '감지된 동네';
          } else {
            regionName = '강남구 역삼동'; // 실패 시 기본 백업
          }

          gpsBtn.textContent = `✅ ${regionName} 감지됨`;
          
          // 샘플 리스트에 실시간 탐색된 동네 추가 및 선택 처리
          const newCode = 'gps-detected';
          const existingGpsIndex = SAMPLE_REGIONS.findIndex(r => r.code === newCode);
          if (existingGpsIndex !== -1) {
            SAMPLE_REGIONS[existingGpsIndex].name = regionName;
          } else {
            SAMPLE_REGIONS.unshift({ code: newCode, name: regionName, emoji: '✨' });
          }

          // 목록 다시 그리기
          regionList.innerHTML = SAMPLE_REGIONS.map(r => `
            <div class="region-item ${r.code === newCode ? 'selected' : ''}" data-code="${r.code}" onclick="selectRegion('${r.code}', '${r.name}')">
              <span>${r.emoji}</span>
              <span>${r.name}</span>
            </div>
          `).join('');

          selectRegion(newCode, regionName);
          showToast(`내 동네가 '${regionName}'(으)로 설정되었어요!`);
        } catch (error) {
          console.error(error);
          gpsBtn.textContent = '❌ 주소 변환 실패';
          showToast('GPS 좌표는 획득했으나 주소 변환에 실패했습니다. (역삼동으로 임시 설정)');
          autoSelectRegion('yeoksam');
        } finally {
          gpsBtn.disabled = false;
        }
      },
      (error) => {
        console.error(error);
        let errorMsg = '위치 탐색을 할 수 없습니다.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = '위치 권한 동의가 필요합니다.';
        }
        gpsBtn.textContent = '❌ 위치 검색 실패';
        showToast(errorMsg + ' (역삼동으로 임시 설정)');
        autoSelectRegion('yeoksam');
        gpsBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  // 동네 목록 렌더링
  regionList.innerHTML = SAMPLE_REGIONS.map(r => `
    <div class="region-item" data-code="${r.code}" onclick="selectRegion('${r.code}', '${r.name}')">
      <span>${r.emoji}</span>
      <span>${r.name}</span>
    </div>
  `).join('');

  function autoSelectRegion(code) {
    const region = SAMPLE_REGIONS.find(r => r.code === code);
    if (region) selectRegion(code, region.name);
  }

  window.selectRegion = function(code, name) {
    selectedRegion = { code, name };
    document.querySelectorAll('.region-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.code === code);
    });
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
  };

  // 선택된 아바타 이미지 상태 추적 (기본값: 2030 여성 아바타)
  let selectedAvatar = 'images/avatar-girl.png';
  
  // 아바타 선택 리스너 바인딩
  const avatarOptions = document.querySelectorAll('.avatar-option');
  avatarOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      avatarOptions.forEach(el => {
        el.classList.remove('selected');
        el.style.borderColor = 'transparent';
      });
      opt.classList.add('selected');
      opt.style.borderColor = 'var(--point)';
      selectedAvatar = opt.dataset.avatar;
    });
  });

  // 다음 단계: 닉네임 입력으로
  nextBtn.addEventListener('click', () => {
    if (!selectedRegion) return;
    step = 2;
    regionSection.style.display = 'none';
    nicknameSection.style.display = 'flex';
    nicknameSection.style.flexDirection = 'column';
    dots.forEach((dot, i) => dot.classList.toggle('active', i === 1));
    nicknameInput.focus();
  });

  // 닉네임 글자 수 카운터
  nicknameInput.addEventListener('input', () => {
    const len = nicknameInput.value.length;
    charCounter.textContent = `${len} / 10`;
    startBtn.disabled = len < 2;
    startBtn.style.opacity = len >= 2 ? '1' : '0.5';
  });

  // 시작하기 (로컬 세션 저장 추가)
  startBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (nickname.length < 2) return;

    AppState.currentUser = {
      ...AppState.currentUser,
      nickname,
      region: selectedRegion?.name || '강남구 역삼동',
      avatar: selectedAvatar // 선택한 아바타 이미지 저장
    };

    // 자동 로그인을 위해 사용자 상태를 localStorage에 로컬 저장
    localStorage.setItem('mulco_user', JSON.stringify(AppState.currentUser));

    startBtn.textContent = '🌊 물꼬를 틉니다...';
    startBtn.disabled = true;

    setTimeout(() => {
      showPage('main-page');
      initMainPage();
    }, 700);
  });
}
