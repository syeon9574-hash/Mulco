export const theme = {
  colors: {
    bg: '#FDF9F7',               // 매우 부드러운 아이보리 핑크빛 배경
    main: '#FFE5E5',             // 귀여운 베이비 파스텔 핑크
    sub: '#EAF6EC',              // 파스텔 민트그린 (수초/용품 나눔용)
    point: '#FF8E9E',            // 사랑스럽고 부드러운 코랄 핑크 (핵심 포인트)
    pointDark: '#E57385',        // 호버용 진한 코랄 핑크
    text: '#3C3535',             // 다크 초콜릿 브라운
    textLight: '#8A7E7E',        // 부드러운 브라운 그레이
    muted: '#F3EAEA',            // 옅은 베이지 핑크 톤 테두리/선
    mutedDark: '#DBC5C5',        // 포커스용 어두운 테두리
    white: '#FFFFFF',
    danger: '#FF8383',
  },
  borderRadius: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    circle: '50%',
  },
  transitions: {
    default: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  font: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  shadows: {
    sm: '0 4px 10px rgba(255,142,158,0.06)',
    md: '0 6px 20px rgba(255,142,158,0.12)',
    lg: '0 10px 30px rgba(255,142,158,0.16)',
  }
};

export type ThemeType = typeof theme;
