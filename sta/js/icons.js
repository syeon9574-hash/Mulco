// ============================================
// 물꼬 (Mulco) - SVG Icon Library (귀엽고 여성스러운 파스텔 톤 에디션)
// ============================================

const Icons = {

  // ─── Navigation ───
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,

  moreHorizontal: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/></svg>`,

  send: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>`,

  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,

  check: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,

  // ─── Location ───
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg>`,

  locate: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3" fill="currentColor"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/></svg>`,

  // ─── Social / Communication ───
  messageCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,

  star: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,

  // ─── Category / Card Cute Illustrations (귀여운 캐릭터풍 비주얼) ───
  fish: `<svg viewBox="0 0 100 100" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 동글동글한 분홍 물고기 -->
    <path d="M20 50 Q30 25 65 30 Q85 35 90 50 Q85 65 65 70 Q30 75 20 50Z" fill="#FFAEC9" opacity="0.9"/>
    <path d="M20 50 L5 38 L10 50 L5 62Z" fill="#FFAEC9" opacity="0.8"/>
    <!-- 귀여운 둥근 지느러미 -->
    <path d="M50 32 Q60 15 70 30" fill="#FFC90E" opacity="0.85"/>
    <path d="M48 68 Q58 85 68 70" fill="#FFC90E" opacity="0.85"/>
    <!-- 왕눈이 -->
    <circle cx="75" cy="46" r="7.5" fill="white"/>
    <circle cx="77.5" cy="46" r="4" fill="#3C3535"/>
    <circle cx="79.5" cy="44" r="1.5" fill="white"/>
    <!-- 통통 볼터치 -->
    <circle cx="68" cy="56" r="4.5" fill="#FF7F27" opacity="0.5"/>
  </svg>`,

  leaf: `<svg viewBox="0 0 100 100" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 둥글고 귀여운 파스텔 나뭇잎 -->
    <path d="M50 15 C25 25 20 55 50 85 C80 55 75 25 50 15 Z" fill="#B5E61D" opacity="0.8"/>
    <path d="M50 85 L50 15" stroke="#22B14C" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 65 Q65 55 72 45" stroke="#22B14C" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M50 50 Q35 40 28 30" stroke="#22B14C" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M50 35 Q65 25 70 15" stroke="#22B14C" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  settings: `<svg viewBox="0 0 100 100" width="45" height="45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 동글동글 어항용 온도계/여과기 대용 귀여운 톱니/도구 모양 -->
    <circle cx="50" cy="50" r="28" fill="#99D9EA" opacity="0.8"/>
    <circle cx="50" cy="50" r="14" fill="#FDF9F7"/>
    <path d="M50 10 L50 22M50 78 L50 90M10 50 L22 50M78 50 L90 50" stroke="#00A2E8" stroke-width="6" stroke-linecap="round"/>
    <path d="M22 22 L30 30M70 70 L78 78M22 70 L30 60M70 30 L78 22" stroke="#00A2E8" stroke-width="6" stroke-linecap="round"/>
  </svg>`,

  search: `<svg viewBox="0 0 100 100" width="45" height="45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 귀여운 돋보기 디자인 -->
    <circle cx="42" cy="42" r="22" stroke="#A349A4" stroke-width="6.5"/>
    <path d="M58 58 L85 85" stroke="#A349A4" stroke-width="8" stroke-linecap="round"/>
    <circle cx="34" cy="34" r="5" fill="white" opacity="0.6"/>
  </svg>`,

  // ─── 로그인 화면 히어로 (둥실둥실 아쿠아 귀여운 파스텔 일러스트) ───
  heroFish: `<svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:160px;height:auto">
    <!-- 연분홍 물방울 퐁퐁 -->
    <circle cx="150" cy="40" r="8" fill="#FFC90E" opacity="0.4"/>
    <circle cx="168" cy="24" r="5" fill="#FF8E9E" opacity="0.5"/>
    <circle cx="140" cy="18" r="3" fill="#B5E61D" opacity="0.4"/>
    
    <!-- 귀여운 수초 -->
    <path d="M25 150 Q35 110 20 80 Q35 50 30 30" stroke="#B5E61D" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M175 160 Q160 120 180 90 Q165 60 170 40" stroke="#EAF6EC" stroke-width="5" stroke-linecap="round" fill="none"/>

    <!-- 동글동글 메인 핑크 구피 -->
    <path d="M50 90 Q75 45 130 55 Q175 60 185 90 Q175 120 130 125 Q75 135 50 90Z" fill="#FF8E9E" />
    
    <!-- 풍성한 주황색 꼬리 -->
    <path d="M60 90 C25 60 15 30 5 60 C-5 90 5 120 15 120 C25 120 40 100 60 90Z" fill="#FFAEC9" opacity="0.95" />
    
    <!-- 눈동자 -->
    <circle cx="150" cy="82" r="10" fill="white"/>
    <circle cx="153" cy="82" r="5.5" fill="#3C3535"/>
    <circle cx="156" cy="79" r="2.2" fill="white"/>

    <!-- 발그레 볼터치 -->
    <circle cx="132" cy="100" r="7" fill="#FF7F27" opacity="0.5"/>

    <!-- 귀여운 작은 입구멍 -->
    <path d="M183 93 Q178 96 183 99" stroke="#3C3535" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,
};

// ─── 카드 아이템 이미지/이모지 + 배경 색상 ───
// images 폴더에 마련된 예쁜 전용 이미지 아이콘 적용
function getItemIconSvg(item) {
  // 사용자가 직접 등록한 이미지가 있으면 최우선 반환
  if (item.image) {
    return { isImage: true, src: item.image, bg: '#F9FAFB' };
  }

  if (item.trade_type === 'TAKE') {
    return { isImage: true, src: 'images/찾아요.png', bg: 'linear-gradient(145deg, #EDE5FF, #DDD5F7)' };
  }
  if (item.category === 'BIOLOGY') {
    return { isImage: true, src: 'images/물고기.png', bg: 'linear-gradient(145deg, #FFE5EC, #FFCCD8)' };
  }
  
  // 수초 키워드 매칭
  if (item.title.includes('수초') || item.title.includes('모스') || item.title.includes('나나') || item.title.includes('부초')) {
    return { isImage: true, src: 'images/수초.png', bg: 'linear-gradient(145deg, #E5FAF0, #C8EFD8)' };
  }
  
  // 그 외에는 용품 이미지로 처리
  return { isImage: true, src: 'images/용품.png', bg: 'linear-gradient(145deg, #E5EEFF, #CDD8F7)' };
}

