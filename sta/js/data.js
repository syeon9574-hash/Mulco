// ============================================
// 물꼬 (Mulco) - Mock Data
// ============================================

const MockData = {
  // ─── 현재 로그인 유저 ───
  currentUser: {
    user_id: 'u001',
    nickname: '물꼬지기',
    phone_number: '010-****-1234',
    region: '강남구 역삼동',
    profile_memo: '구피 덕후 3년차 🐟 치어 나눔 좋아합니다!',
    created_at: '2025-12-01',
    avatar_letter: '물',
    avatar: 'images/avatar-girl.png',
  },

  // ─── 다른 유저들 ───
  users: {
    u002: {
      user_id: 'u002',
      nickname: '구피덕후',
      region: '강남구 역삼동',
      profile_memo: '고정구피 전문 사육 중 🐠 분양 항상 환영해요',
      avatar_letter: '구',
      avatar: 'images/avatar-boy.png',
      reviews: {
        '#생물이건강해요': 14,
        '#포장이꼼꼼해요': 12,
        '#친절해요': 8,
        '#시간약속을잘지켜요': 6,
        '#물생활꿀팁을공유해줘요': 4,
      }
    },
    u003: {
      user_id: 'u003',
      nickname: '수초러버',
      region: '강남구 역삼동',
      profile_memo: '수초 레이아웃 7년째 🌿 트리밍 수초 나눔합니다',
      avatar_letter: '수',
      avatar: 'images/avatar-woman.png',
      reviews: {
        '#물생활꿀팁을공유해줘요': 21,
        '#친절해요': 15,
        '#포장이꼼꼼해요': 9,
        '#생물이건강해요': 7,
        '#시간약속을잘지켜요': 3,
      }
    },
    u004: {
      user_id: 'u004',
      nickname: '30큐브초보',
      region: '강남구 역삼동',
      profile_memo: '자취방에 어항 하나 놓은 초보 물집사 🔰',
      avatar_letter: '초',
      avatar: 'images/avatar-child.png',
      reviews: {
        '#친절해요': 3,
        '#시간약속을잘지켜요': 2,
      }
    },
    u005: {
      user_id: 'u005',
      nickname: '베란다어항',
      region: '강남구 논현동',
      profile_memo: '베란다 축양장 운영 중 🏠 용품 적극 나눔!',
      avatar_letter: '베',
      avatar: 'images/avatar-man.png',
      reviews: {
        '#포장이꼼꼼해요': 18,
        '#물생활꿀팁을공유해줘요': 11,
        '#친절해요': 10,
        '#생물이건강해요': 6,
        '#시간약속을잘지켜요': 5,
      }
    }
  },

  // ─── 채팅방 ───
  chatRooms: {
    room001: {
      room_id: 'room001',
      region_code: '역삼동',
      name: '역삼동 물생활 단톡방',
      user_count: 247,
    }
  },

  // ─── 전체 채팅 메시지 ───
  chatMessages: [
    {
      message_id: 'm001',
      user_id: 'u003',
      type: 'other',
      content: '안녕하세요 여러분~ 오늘 수초 트리밍 했는데 모스 가져갈 분 계세요? 🌿',
      time: '오전 10:12',
    },
    {
      message_id: 'm002',
      user_id: 'u004',
      type: 'other',
      content: '오 저요! 모스 써보고 싶었는데 ㅎㅎ 얼마나 나오나요?',
      time: '오전 10:14',
    },
    {
      message_id: 'm003',
      user_id: 'u003',
      type: 'other',
      content: '주먹만큼요 ㅋㅋ 그냥 나눔이에요! 개인챗 주세요',
      time: '오전 10:15',
    },
    {
      message_id: 'm004',
      user_id: 'u001',
      type: 'mine',
      content: '혹시 구피 키우시는 분들 물온도 어떻게 맞추세요? 요즘 날이 더워서 걱정이에요 🌡️',
      time: '오전 10:18',
    },
    {
      message_id: 'm005',
      user_id: 'u002',
      type: 'other',
      content: '저는 26도 맞추는데 여름엔 히터 끄고 팬 하나 틀어주세요. 수온이 28 넘어가면 위험하더라구요',
      time: '오전 10:21',
    },
    {
      message_id: 'm006',
      user_id: 'u005',
      type: 'other',
      content: '맞아요! 팬 쿨러 추천해요. 저는 이게 여름엔 필수템이에요 🌀',
      time: '오전 10:23',
    },
    {
      message_id: 'm007',
      user_id: 'u001',
      type: 'mine',
      content: '감사합니다!! 팬 알아봐야겠어요 😊',
      time: '오전 10:24',
    },
    {
      message_id: 'm008',
      user_id: 'u004',
      type: 'other',
      content: '혹시 역삼동 근처 좋은 수족관 아시는 분? 30큐브 물잡이 끝나서 이제 생물 넣으려고요!',
      time: '오전 10:30',
    },
    {
      message_id: 'm009',
      user_id: 'u002',
      type: 'other',
      content: '저한테 구피 치어 받아가세요 ㅋㅋㅋ 폭번 때문에 나눔 중이에요 😂 [생물 분양] 탭 확인해봐요!',
      time: '오전 10:32',
    },
    {
      message_id: 'm010',
      user_id: 'u003',
      type: 'other',
      content: '초보분들한텐 구피가 정말 좋죠! 번식도 잘 되고 관리도 쉬워서 👍',
      time: '오전 10:33',
    },
  ],

  // ─── 생물 분양 목록 ───
  biologyItems: [
    {
      item_id: 'bi001',
      user_id: 'u002',
      category: 'BIOLOGY',
      trade_type: 'GIVE',
      title: '고정구피 치어 10마리',
      price: 2000,
      emoji: '🐠',
      description: '6개월 이상 키운 고정구피에서 태어난 건강한 치어예요. 색상 발현 중이라 커가면서 어떻게 될지 기대됩니다! 밥 잘 먹고 건강해요.',
      status: 'AVAILABLE',
      created_at: '2026-07-05',
    },
    {
      item_id: 'bi002',
      user_id: 'u003',
      category: 'BIOLOGY',
      trade_type: 'GIVE',
      title: '블루그라스 구피 성어 한 쌍',
      price: 0,
      emoji: '💙',
      description: '블루그라스 수컷 1 암컷 1 한 쌍 나눔해요. 물이 맞으면 바로 번식할 거예요!',
      status: 'AVAILABLE',
      created_at: '2026-07-04',
    },
    {
      item_id: 'bi003',
      user_id: 'u005',
      category: 'BIOLOGY',
      trade_type: 'TAKE',
      title: '안시 플레코 찾아요',
      price: 10000,
      emoji: '🔍',
      description: '안시 플레코 구해요. 5cm 이상 성어 선호합니다. 역삼동 직거래 가능하신 분 연락주세요!',
      status: 'AVAILABLE',
      created_at: '2026-07-04',
    },
    {
      item_id: 'bi004',
      user_id: 'u002',
      category: 'BIOLOGY',
      trade_type: 'GIVE',
      title: '미키마우스 플래티 치어',
      price: 1000,
      emoji: '🐟',
      description: '미키마우스 플래티 치어 15마리 분양해요. 아주 건강하고 먹이 반응 좋아요!',
      status: 'COMPLETED',
      created_at: '2026-07-03',
    },
  ],

  // ─── 용품/수초 목록 ───
  goodsItems: [
    {
      item_id: 'go001',
      user_id: 'u003',
      category: 'GOODS',
      trade_type: 'GIVE',
      title: '자바모스 주먹 크기 나눔',
      price: 0,
      emoji: '🌿',
      description: '트리밍한 자바모스예요. 아주 건강하고 이끼 없어요. 그냥 나눔이에요!',
      status: 'AVAILABLE',
      created_at: '2026-07-05',
    },
    {
      item_id: 'go002',
      user_id: 'u005',
      category: 'GOODS',
      trade_type: 'GIVE',
      title: 'EHEIM 여과기 2213',
      price: 30000,
      emoji: '⚙️',
      description: '에하임 2213 외부여과기 사용 안 한지 1년 됐어요. 청소 완료 상태입니다.',
      status: 'AVAILABLE',
      created_at: '2026-07-04',
    },
    {
      item_id: 'go003',
      user_id: 'u003',
      category: 'GOODS',
      trade_type: 'GIVE',
      title: '리시아 트리밍분 나눔',
      price: 0,
      emoji: '💚',
      description: '리시아 트리밍 나눔해요. 줄기 뜨는 타입이라 그물망이나 돌에 묶어쓰면 됩니다.',
      status: 'AVAILABLE',
      created_at: '2026-07-03',
    },
    {
      item_id: 'go004',
      user_id: 'u005',
      category: 'GOODS',
      trade_type: 'GIVE',
      title: '고급 침목 유목 3개',
      price: 5000,
      emoji: '🪵',
      description: '레이아웃 바꾸면서 쓰던 침목 유목 정리해요. 사이즈 15~20cm 정도입니다.',
      status: 'AVAILABLE',
      created_at: '2026-07-02',
    },
  ],

  // ─── 선택형 후기 키워드 ───
  reviewKeywords: [
    '🐟 생물이건강해요',
    '📦 포장이꼼꼼해요',
    '💡 물생활꿀팁을공유해줘요',
    '⏰ 시간약속을잘지켜요',
    '😊 친절해요',
  ],

  // ─── 1:1 DM 메시지 (u002와의 대화) ───
  dmMessages: {
    u002: [
      {
        message_id: 'dm001',
        user_id: 'u002',
        type: 'other',
        content: '안녕하세요! 구피 치어 분양 글 보고 연락드려요 😊',
        time: '오전 11:05',
      },
      {
        message_id: 'dm002',
        user_id: 'u001',
        type: 'mine',
        content: '아 안녕하세요! 네 아직 분양 가능해요. 몇 마리나 데려가실 건가요?',
        time: '오전 11:07',
      },
      {
        message_id: 'dm003',
        user_id: 'u002',
        type: 'other',
        content: '5마리 정도 괜찮을까요? 저 30큐브라 너무 많으면 ㅎㅎ',
        time: '오전 11:08',
      },
      {
        message_id: 'dm004',
        user_id: 'u001',
        type: 'mine',
        content: '네 5마리 가능해요! 책임비는 마리당 200원이에요. 언제 직거래 가능하세요?',
        time: '오전 11:09',
      },
    ]
  }
};
