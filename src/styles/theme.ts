export const theme = {
  colors: {
    bg: '#F9F9F7',         // 전체 배경 (오프 화이트)
    main: '#D1E6E8',       // 탭 활성, 로그인 버튼 등 (아쿠아 파스텔 블루)
    sub: '#E2EFE7',        // 소차 태그, 후기 배지 배경 (소프트 세이지 그린)
    point: '#3A6073',      // CTA 단추, 강조 텍스트 (딥 오션 블루)
    text: '#2C2C2C',       // 기본 차콜 그레이
    muted: '#E0E0DB',      // 연한 회색 구분선 및 안내 텍스트
    white: '#FFFFFF',
    danger: '#FF4D62',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '24px',
    circle: '50%',
  },
  transitions: {
    default: 'all 0.25s ease',
  },
  font: "'Noto Sans KR', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.05)',
    md: '0 4px 16px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
  }
};

export type ThemeType = typeof theme;
