import React from 'react';

export const Icons = {
  arrowLeft: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  moreHorizontal: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),
  send: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13"/>
      <path d="m22 2-7 20-4-9-9-4Z"/>
    </svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"/>
      <path d="M5 12h14"/>
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  mapPin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="currentColor"/>
    </svg>
  ),
  locate: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <line x1="12" x2="12" y1="2" y2="5"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
      <line x1="2" x2="5" y1="12" y2="12"/>
      <line x1="19" x2="22" y1="12" y2="12"/>
    </svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  heroFish: (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '160px', height: 'auto' }}>
      <circle cx="150" cy="40" r="8" fill="#FFC90E" opacity="0.4"/>
      <circle cx="168" cy="24" r="5" fill="#FF8E9E" opacity="0.5"/>
      <circle cx="140" cy="18" r="3" fill="#B5E61D" opacity="0.4"/>
      
      <path d="M25 150 Q35 110 20 80 Q35 50 30 30" stroke="#B5E61D" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M175 160 Q160 120 180 90 Q165 60 170 40" stroke="#EAF6EC" strokeWidth="5" strokeLinecap="round" fill="none"/>

      <path d="M50 90 Q75 45 130 55 Q175 60 185 90 Q175 120 130 125 Q75 135 50 90Z" fill="#FF8E9E" />
      
      <path d="M60 90 C25 60 15 30 5 60 C-5 90 5 120 15 120 C25 120 40 100 60 90Z" fill="#FFAEC9" opacity="0.95" />
      
      <circle cx="150" cy="82" r="10" fill="white"/>
      <circle cx="153" cy="82" r="5.5" fill="#3C3535"/>
      <circle cx="156" cy="79" r="2.2" fill="white"/>

      <circle cx="132" cy="100" r="7" fill="#FF7F27" opacity="0.5"/>

      <path d="M183 93 Q178 96 183 99" stroke="#3C3535" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
};

export interface IconInfo {
  isImage: boolean;
  src: string;
  emoji: string;
  bg: string;
}

export function getItemIconInfo(item: { trade_type: string; category: string; title: string; image?: string | null }): IconInfo {
  // 사용자가 직접 등록한 이미지가 있으면 최우선 반환
  if (item.image) {
    return { isImage: true, src: item.image, emoji: '', bg: '#F9FAFB' };
  }

  if (item.trade_type === 'TAKE') {
    return { isImage: true, src: '/images/찾아요.png', emoji: '', bg: 'linear-gradient(145deg, #EDE5FF, #DDD5F7)' };
  }
  if (item.category === 'BIOLOGY') {
    return { isImage: true, src: '/images/물고기.png', emoji: '', bg: 'linear-gradient(145deg, #FFE5EC, #FFCCD8)' };
  }
  
  // 수초 키워드 매칭
  if (item.title.includes('수초') || item.title.includes('모스') || item.title.includes('나나') || item.title.includes('부초')) {
    return { isImage: true, src: '/images/수초.png', emoji: '', bg: 'linear-gradient(145deg, #E5FAF0, #C8EFD8)' };
  }
  
  // 그 외에는 용품 이미지로 처리
  return { isImage: true, src: '/images/용품.png', emoji: '', bg: 'linear-gradient(145deg, #E5EEFF, #CDD8F7)' };
}
