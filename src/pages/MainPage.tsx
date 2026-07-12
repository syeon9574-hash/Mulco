import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { BottomSheet } from '../components/common/BottomSheet';
import { ChatBubble } from '../components/chat/ChatMessage';
import { MarketCard } from '../components/chat/MarketCard';
import { MarketItem, ChatMessage, User } from '../types';
import { getCurrentTime, resizeAndCompressImage, normalizeRegionToRoom } from '../utils/format';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { AdBanner } from '../components/common/AdBanner';
import { mockChatMessages, mockBiologyItems, mockGoodsItems } from '../data/mockData';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  position: relative;
  overflow: hidden;
`;

const TabBar = styled.nav`
  height: 48px;
  background-color: ${props => props.theme.colors.bg};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  display: flex;
  position: sticky;
  top: 56px;
  z-index: 99;
`;

const TabBtn = styled.button<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${props => (props.active ? props.theme.colors.text : props.theme.colors.text + '80')};
  border-bottom: 2.5px solid ${props => (props.active ? props.theme.colors.point : 'transparent')};
  transition: ${props => props.theme.transitions.default};
`;

const TabWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const TabContent = styled.div<{ active: boolean }>`
  display: ${props => (props.active ? 'flex' : 'none')};
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
  background-color: ${props => props.theme.colors.bg};
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 0.72rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.4;
  margin: 12px 0 20px;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 25%;
    height: 1px;
    background-color: ${props => props.theme.colors.muted};
  }
  &::before { left: 8px; }
  &::after { right: 8px; }
`;

// Styled Ad components removed, using imported AdBanner

const ChatInputBar = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-top: 1px solid ${props => props.theme.colors.muted};
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 99;
`;

const ChatInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  background-color: ${props => props.theme.colors.bg};
  border: 1px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 16px;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const SendBtn = styled.button`
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MarketGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 80px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background-color: ${props => props.theme.colors.bg};
  align-content: start;
`;

const Fab = styled.button`
  position: absolute;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.circle};
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  box-shadow: 0 4px 16px rgba(58, 96, 115, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 98;
  transition: ${props => props.theme.transitions.default};

  &:active {
    transform: scale(0.95);
  }
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  background: transparent;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;

  span {
    color: ${props => props.theme.colors.point};
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ImageUploadTrigger = styled.div`
  width: 100%;
  aspect-ratio: 3/2;
  background: #f8f9fa;
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${props => props.theme.colors.text + 'AA'};
  border: 1.8px dashed ${props => props.theme.colors.muted};
  overflow: hidden;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0.6;
`;

const ModalInput = styled.input`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 14px;
  font-size: 0.88rem;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const ModalTextarea = styled.textarea`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 11px 14px;
  font-size: 0.88rem;
  resize: none;

  &:focus {
    border-color: ${props => props.theme.colors.point};
  }
`;

const ModalBtn = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.86rem;
  border: 1.5px solid ${props => (props.selected ? props.theme.colors.point : props.theme.colors.muted)};
  background-color: ${props => (props.selected ? props.theme.colors.point : props.theme.colors.white)};
  color: ${props => (props.selected ? props.theme.colors.white : props.theme.colors.text)};
  transition: ${props => props.theme.transitions.default};
`;

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.default};
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  box-shadow: 0 4px 12px rgba(58, 96, 115, 0.15);
  margin-top: 8px;

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GpsHintText = styled.p`
  font-size: 0.76rem;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
  margin-top: -2px;
  margin-bottom: 18px;
  line-height: 1.45;
  padding: 0 4px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const RefreshSpinner = styled.div<{ active: boolean; pullY: number }>`
  position: absolute;
  top: ${props => props.pullY - 44}px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.white};
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  opacity: ${props => (props.pullY > 15 ? 1 : 0)};
  transform: translateX(-50%) scale(${props => Math.min(props.pullY / 40, 1)});
  transition: ${props => (props.pullY === 0 || props.active ? 'top 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s, transform 0.2s' : 'none')};

  span {
    font-size: 20px;
    color: ${props => props.theme.colors.point};
    animation: ${props => (props.active ? spin : 'none')} 0.8s linear infinite;
    transform: rotate(${props => props.pullY * 3.5}deg);
  }
`;

const LobbyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background-color: ${props => props.theme.colors.bg};
`;

const LobbyHeader = styled.header`
  height: 56px;
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1.5px solid ${props => props.theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LobbyHeaderTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.point};
`;

const LobbyLogoutBtn = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LobbyHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LobbyHeaderBtn = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:active {
    opacity: 0.7;
  }
`;

const ResponsiveText = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const LobbyContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LobbySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LobbySectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LobbySectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const LobbyAddBtn = styled.button`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${props => props.theme.colors.point};
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RoomCard = styled.div<{ registered?: boolean }>`
  background-color: ${props => props.theme.colors.white};
  border: 1.5px solid ${props => props.registered ? props.theme.colors.main : props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);

  &:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: ${props => props.theme.colors.point};
  }
`;

const RoomDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RoomIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.sub};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const RoomText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RoomName = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const RoomMembers = styled.span`
  font-size: 0.76rem;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
`;

const EnterArrow = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.colors.point};
  opacity: 0.7;
`;

const LockCard = styled(RoomCard)`
  border: 1.5px dashed ${props => props.theme.colors.muted};
  background-color: rgba(240, 240, 240, 0.3);
  cursor: not-allowed;

  &:hover {
    transform: none;
    box-shadow: none;
    border-color: ${props => props.theme.colors.muted};
  }
`;

const LockDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.6;
`;

const LockText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LockTitle = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const LockBadge = styled.span`
  font-size: 0.68rem;
  background-color: #ffd700;
  color: #5d4d00;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 4px;
  width: fit-content;
`;

const AddRegionModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const AddRegionModalContent = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 360px;
  padding: 24px;
  box-sizing: border-box;
  animation: slideUp 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
`;

const ModalTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
`;

const SearchBtn = styled.button`
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.point};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 12px 16px;
  font-weight: 700;
  font-size: 0.88rem;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

  &:active {
    background-color: #FFCDD9;
  }
`;

const autoReplies = [
  { user_id: 'u002', content: '저도 궁금했던 내용이에요 😊' },
  { user_id: 'u003', content: '오 정보 감사해요! 도움 됩니다 🌿' },
  { user_id: 'u005', content: '맞아요 저도 그렇게 하고 있어요 👍' },
  { user_id: 'u004', content: '알려주셔서 감사해요! 초보라 모르는 게 많아요 😅' },
];

const popularRooms = [
  { name: '서울특별시', count: 184, emoji: '🏙️' },
  { name: '경기도 성남시', count: 96, emoji: '🌿' },
  { name: '경기도 수원시', count: 72, emoji: '🏰' },
  { name: '인천광역시', count: 54, emoji: '⚓' },
  { name: '대구광역시', count: 48, emoji: '🍎' },
  { name: '부산광역시', count: 82, emoji: '🌊' }
];

const ALL_ADMIN_ROOMS = [
  { name: '서울특별시', emoji: '🏙️' },
  { name: '경기도 성남시', emoji: '💻' },
  { name: '경기도 수원시', emoji: '🏰' },
  { name: '경기도 고양시', emoji: '🌷' },
  { name: '경기도 용인시', emoji: '🎢' },
  { name: '인천광역시', emoji: '⚓' },
  { name: '대전광역시', emoji: '🌻' },
  { name: '대구광역시', emoji: '🍎' },
  { name: '울산광역시', emoji: '🏭' },
  { name: '광주광역시', emoji: '🌸' },
  { name: '부산광역시', emoji: '🌊' },
  { name: '세종특별자치시', emoji: '🏛️' },
  { name: '경기도', emoji: '🚗' },
  { name: '강원도', emoji: '🏔️' },
  { name: '충청북도', emoji: '🌰' },
  { name: '충청남도', emoji: '🍓' },
  { name: '전라북도', emoji: '🍚' },
  { name: '전라남도', emoji: '🌅' },
  { name: '경상북도', emoji: '🏯' },
  { name: '경상남도', emoji: '🚢' },
  { name: '제주특별자치도', emoji: '🍊' }
];

// 지역명으로 대표 이모지 반환 (시 단위 개별 매핑)
const getRegionEmoji = (regionName: string): string => {
  const n = regionName;

  // === 특별시 / 광역시 / 특별자치시 ===
  if (n.includes('서울')) return '🏙️';
  if (n.includes('부산')) return '🌊';
  if (n.includes('대구')) return '🍎';
  if (n.includes('인천')) return '⚓';
  if (n.includes('광주')) return '🌸';
  if (n.includes('대전')) return '🌻';
  if (n.includes('울산')) return '🏭';
  if (n.includes('세종')) return '🏛️';
  if (n.includes('제주')) return '🍊';

  // === 경기도 ===
  if (n.includes('수원')) return '🏰';      // 수원화성
  if (n.includes('성남')) return '💻';      // 판교 테크밸리
  if (n.includes('고양')) return '🌷';      // 고양 꽃박람회
  if (n.includes('용인')) return '🎢';      // 에버랜드
  if (n.includes('부천')) return '📚';      // 부천 만화박물관
  if (n.includes('안산')) return '🌊';      // 바다·시화호
  if (n.includes('안양')) return '🏞️';     // 안양천
  if (n.includes('남양주')) return '🍵';   // 다산 정약용·차
  if (n.includes('화성')) return '🚀';     // 나로우주센터·삼성반도체
  if (n.includes('평택')) return '🛳️';    // 평택항
  if (n.includes('의정부')) return '🍖';   // 의정부부대찌개
  if (n.includes('시흥')) return '🦆';     // 갯골생태공원
  if (n.includes('파주')) return '📖';     // 파주출판단지
  if (n.includes('광명')) return '🕯️';    // 광명동굴
  if (n.includes('하남')) return '🛍️';    // 스타필드
  if (n.includes('김포')) return '✈️';    // 김포공항
  if (n.includes('오산')) return '🎯';     // 오산
  if (n.includes('이천')) return '🍚';     // 이천 쌀
  if (n.includes('안성')) return '🎪';     // 안성 바우덕이
  if (n.includes('포천')) return '🌲';     // 국립수목원
  if (n.includes('여주')) return '🏺';     // 여주 도자기
  if (n.includes('동두천')) return '🪖';   // 미군기지
  if (n.includes('양주')) return '🌹';     // 나리공원
  if (n.includes('구리')) return '🌉';     // 구리
  if (n.includes('의왕')) return '🚂';     // 철도박물관
  if (n.includes('과천')) return '🦁';     // 서울대공원
  if (n.includes('광주') && n.includes('경기')) return '🍑';

  // === 강원도 ===
  if (n.includes('춘천')) return '🍗';     // 춘천닭갈비
  if (n.includes('원주')) return '🎿';     // 스키
  if (n.includes('강릉')) return '☕';     // 강릉커피거리
  if (n.includes('동해')) return '🏖️';    // 동해바다
  if (n.includes('태백')) return '⛏️';    // 탄광·태백산
  if (n.includes('속초')) return '🦞';     // 대게·오징어
  if (n.includes('삼척')) return '🏔️';    // 덕항산·환선굴
  if (n.includes('홍천')) return '🌲';
  if (n.includes('횡성')) return '🥩';     // 횡성 한우
  if (n.includes('영월')) return '🪨';     // 고생대화석
  if (n.includes('평창')) return '🎿';     // 올림픽
  if (n.includes('정선')) return '🎰';     // 강원랜드
  if (n.includes('철원')) return '🦢';     // 두루미
  if (n.includes('화천')) return '🐟';     // 화천 산천어축제
  if (n.includes('양구')) return '🎖️';
  if (n.includes('인제')) return '🌊';     // 내린천 래프팅
  if (n.includes('고성') && n.includes('강원')) return '🦌';
  if (n.includes('양양')) return '🏄';     // 서핑

  // === 충청북도 ===
  if (n.includes('청주')) return '📜';     // 직지심체요절
  if (n.includes('충주')) return '🍎';     // 충주사과
  if (n.includes('제천')) return '🌿';     // 제천한방약초
  if (n.includes('보은')) return '🌰';     // 보은대추
  if (n.includes('옥천')) return '🍇';     // 옥천포도
  if (n.includes('영동')) return '🍷';     // 영동와인
  if (n.includes('증평')) return '🌾';
  if (n.includes('진천')) return '🔔';     // 진천 농다리
  if (n.includes('괴산')) return '🌶️';    // 괴산고추
  if (n.includes('음성')) return '🍑';     // 음성 복숭아
  if (n.includes('단양')) return '🏞️';    // 단양 8경

  // === 충청남도 ===
  if (n.includes('천안')) return '🍡';     // 천안호두과자
  if (n.includes('공주')) return '👑';     // 백제역사
  if (n.includes('보령')) return '🌊';     // 머드축제
  if (n.includes('아산')) return '🌺';     // 장미꽃밭
  if (n.includes('서산')) return '🦀';     // 서산 꽃게
  if (n.includes('논산')) return '🍓';     // 논산딸기
  if (n.includes('계룡')) return '⚔️';    // 군사도시
  if (n.includes('당진')) return '🏗️';    // 당진철강
  if (n.includes('금산')) return '🌿';     // 금산인삼
  if (n.includes('부여')) return '🏛️';    // 백제역사
  if (n.includes('서천')) return '🐦';     // 철새도래지
  if (n.includes('청양')) return '🌶️';    // 청양고추
  if (n.includes('홍성')) return '🐄';     // 홍성한우
  if (n.includes('예산')) return '🍎';     // 예산사과
  if (n.includes('태안')) return '🌻';     // 태안 꽃지
  if (n.includes('당진')) return '⚓';

  // === 전라북도 ===
  if (n.includes('전주')) return '🍚';     // 전주비빔밥
  if (n.includes('군산')) return '⚓';     // 군산항·근대문화
  if (n.includes('익산')) return '💎';     // 보석박물관
  if (n.includes('정읍')) return '🌻';     // 황토현
  if (n.includes('남원')) return '💑';     // 춘향전
  if (n.includes('김제')) return '🌾';     // 지평선 들녘
  if (n.includes('완주')) return '🍇';
  if (n.includes('진안')) return '🌿';     // 고원
  if (n.includes('무주')) return '🎿';     // 무주리조트
  if (n.includes('장수')) return '🍎';
  if (n.includes('임실')) return '🧀';     // 임실치즈
  if (n.includes('순창')) return '🌶️';    // 순창고추장
  if (n.includes('고창')) return '🫐';     // 고창복분자
  if (n.includes('부안')) return '🌊';     // 변산반도

  // === 전라남도 ===
  if (n.includes('목포')) return '🐙';     // 낙지
  if (n.includes('여수')) return '🌅';     // 여수밤바다
  if (n.includes('순천')) return '🌿';     // 순천만갈대밭
  if (n.includes('나주')) return '🍐';     // 나주배
  if (n.includes('광양')) return '🌸';     // 광양매화
  if (n.includes('담양')) return '🎋';     // 담양대나무
  if (n.includes('곡성')) return '🚂';     // 기차마을
  if (n.includes('구례')) return '🌸';     // 산수유
  if (n.includes('고흥')) return '🚀';     // 나로우주센터
  if (n.includes('보성')) return '🍵';     // 보성녹차
  if (n.includes('화순')) return '🪨';     // 화순 고인돌
  if (n.includes('장흥')) return '🦑';     // 장흥키조개
  if (n.includes('강진')) return '🏺';     // 청자
  if (n.includes('해남')) return '🐢';     // 땅끝마을
  if (n.includes('영암')) return '🎸';     // 영암 왕인문화
  if (n.includes('무안')) return '✈️';    // 무안공항
  if (n.includes('함평')) return '🦋';     // 함평나비축제
  if (n.includes('영광')) return '🐟';     // 영광굴비
  if (n.includes('장성')) return '🌲';     // 축령산 편백
  if (n.includes('완도')) return '🦀';     // 완도전복
  if (n.includes('진도')) return '🐕';     // 진도개
  if (n.includes('신안')) return '🌊';     // 다도해

  // === 경상북도 ===
  if (n.includes('포항')) return '🏗️';    // 포스코철강
  if (n.includes('경주')) return '🏯';     // 신라고도
  if (n.includes('김천')) return '🍑';     // 김천자두
  if (n.includes('안동')) return '🎭';     // 하회탈·안동찜닭
  if (n.includes('구미')) return '📱';     // 전자산업
  if (n.includes('영주')) return '🎋';     // 소수서원·부석사
  if (n.includes('영천')) return '🍷';     // 영천와인
  if (n.includes('상주')) return '🚲';     // 자전거도시
  if (n.includes('문경')) return '🏔️';    // 문경새재
  if (n.includes('경산')) return '🍇';     // 경산대추·포도
  if (n.includes('군위')) return '🌾';
  if (n.includes('의성')) return '🧅';     // 의성마늘
  if (n.includes('청송')) return '🍎';     // 청송사과
  if (n.includes('영양')) return '🌶️';    // 영양고추
  if (n.includes('영덕')) return '🦞';     // 영덕대게
  if (n.includes('청도')) return '🍷';     // 청도와인
  if (n.includes('고령')) return '🏛️';    // 가야고분
  if (n.includes('성주')) return '🍈';     // 성주참외
  if (n.includes('칠곡')) return '⚙️';
  if (n.includes('예천')) return '🎣';     // 예천곤충
  if (n.includes('봉화')) return '🌲';     // 봉화 청량산
  if (n.includes('울진')) return '🦞';     // 울진대게
  if (n.includes('울릉')) return '🌊';     // 울릉도

  // === 경상남도 ===
  if (n.includes('창원')) return '⚙️';    // 기계산업
  if (n.includes('진주')) return '💎';     // 남강유등축제
  if (n.includes('통영')) return '⛵';     // 통영바다·이순신
  if (n.includes('사천')) return '✈️';    // 사천항공
  if (n.includes('김해')) return '🏛️';    // 가야역사
  if (n.includes('밀양')) return '🎋';     // 밀양아리랑·얼음골
  if (n.includes('거제')) return '🚢';     // 조선소
  if (n.includes('양산')) return '🌲';     // 통도사·자연
  if (n.includes('의령')) return '🌾';     // 의령 솥뚜껑삼겹살
  if (n.includes('함안')) return '🌸';     // 함안연꽃
  if (n.includes('창녕')) return '🦩';     // 우포늪 따오기
  if (n.includes('고성') && n.includes('경남')) return '🦕'; // 공룡발자국
  if (n.includes('남해')) return '🌿';     // 남해 다랭이논
  if (n.includes('하동')) return '🍵';     // 하동녹차
  if (n.includes('산청')) return '🌿';     // 산청한방
  if (n.includes('함양')) return '🌳';     // 함양 상림공원
  if (n.includes('거창')) return '🍎';     // 거창사과
  if (n.includes('합천')) return '🏯';     // 합천해인사

  // 그 외 기본
  return '📍';
};

// 인구 50만+ 대도시 → 시 단위 독립 방, 소도시/군 → 권역 방으로 정규화
// 로컬 중복 함수 제거 완료. utils/format 파일의 공용 함수를 사용합니다.

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    setCurrentUser,
    logout, 
    messages, 
    setMessages, 
    biologyItems, 
    setBiologyItems, 
    goodsItems, 
    setGoodsItems, 
    users, 
    setUsers,
    blockedUsers,
    showToast 
  } = useApp();
  const isDeveloper = currentUser?.email === 'syeon9574@gmail.com' || currentUser?.email?.startsWith('syeon9574');

  const handleToggleDeveloperRole = () => {
    if (!currentUser) return;
    const nextRole: 'user' | 'admin' = currentUser.role === 'admin' ? 'user' : 'admin';
    const updatedUser = {
      ...currentUser,
      role: nextRole
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('mulco_user', JSON.stringify(updatedUser));
    
    setUsers(prev => ({
      ...prev,
      [updatedUser.user_id]: updatedUser
    }));

    showToast(nextRole === 'admin' ? '🛠️ 최고 관리자 모드로 전환되었습니다.' : '🐠 일반 사용자 모드로 전환되었습니다.');
  };

  const [selectedRoom, setSelectedRoom] = useState<string | null>(() => {
    return window.history.state?.room || null;
  });
  const [isAddRegionModalOpen, setIsAddRegionModalOpen] = useState(false);
  const [newRegionQuery, setNewRegionQuery] = useState('');
  const [searchRegionsResult, setSearchRegionsResult] = useState<string[]>([]);

  // Pull to refresh states
  const [touchStart, setTouchStart] = useState(0);
  const [pullDelta, setPullDelta] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    } else {
      setTouchStart(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStart;
    
    if (delta > 0) {
      setPullDelta(Math.min(delta * 0.45, 95));
      if (delta > 10) {
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing) return;
    if (pullDelta > 65) {
      setIsRefreshing(true);
      setPullDelta(70);
      setTimeout(() => {
        window.location.reload();
      }, 750);
    } else {
      setPullDelta(0);
    }
    setTouchStart(0);
  };
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState<'all-chat' | 'biology' | 'goods'>('all-chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPhotoOptionOpen, setIsPhotoOptionOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');

  // Post form states
  const [postTradeType, setPostTradeType] = useState<'GIVE' | 'TAKE'>('GIVE');
  const [postTitle, setPostTitle] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postImageBase64, setPostImageBase64] = useState<string | null>(null);
  const [postAgree, setPostAgree] = useState(false);

  const [chatText, setChatText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const [roomBiologyItems, setRoomBiologyItems] = useState<MarketItem[]>([]);
  const [roomGoodsItems, setRoomGoodsItems] = useState<MarketItem[]>([]);

  const userRegions = currentUser?.regions || (currentUser?.region ? [currentUser.region] : []);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle hardware / browser back button to exit chat room smoothly
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.room) {
        setSelectedRoom(e.state.room);
      } else {
        setSelectedRoom(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync neighbors' regions with selectedRoom to ensure correct fallback messages filtering
  useEffect(() => {
    if (selectedRoom) {
      setUsers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(uid => {
          if (uid !== currentUser?.user_id) {
            next[uid] = {
              ...next[uid],
              region: selectedRoom
            };
          }
        });
        return next;
      });
    }
  }, [selectedRoom, currentUser?.user_id, setUsers]);

  // Firestore real-time listener for selectedRoom
  useEffect(() => {
    if (!selectedRoom) return;

    // Listen to chatMessages without orderBy to avoid composite index requirement
    const qMessages = query(
      collection(db, 'chatMessages'),
      where('region', '==', selectedRoom)
    );
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const isTestUser = currentUser && currentUser.user_id.startsWith('test_');
      if (snapshot.empty) {
        // 테스트 계정: 목 대화 데이터로 폴백 (실제 유저는 빈 채팅방)
        if (isTestUser) {
          const mockMsgs = mockChatMessages.map(msg =>
            msg.user_id === 'u001' ? { ...msg, user_id: currentUser!.user_id } : msg
          );
          setRoomMessages(mockMsgs);
        } else {
          setRoomMessages([]);
        }
      } else {
        let msgs: ChatMessage[] = [];
        snapshot.forEach(doc => {
          msgs.push({ message_id: doc.id, ...doc.data() } as ChatMessage);
        });
        // Sort by timestamp asc (chronological display order)
        msgs.sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
        // Take latest 50 messages
        if (msgs.length > 50) {
          msgs = msgs.slice(-50);
        }
        setRoomMessages(msgs);
      }
    }, (err) => {
      console.warn("Firestore messages fetch failed: ", err);
      const isTestUser = currentUser && currentUser.user_id.startsWith('test_');
      if (isTestUser) {
        const mockMsgs = mockChatMessages.map(msg =>
          msg.user_id === 'u001' ? { ...msg, user_id: currentUser!.user_id } : msg
        );
        setRoomMessages(mockMsgs);
      } else {
        setRoomMessages([]);
      }
    });

    // Listen to marketItems
    const qMarket = query(collection(db, 'marketItems'), where('region', '==', selectedRoom));
    const unsubMarket = onSnapshot(qMarket, (snapshot) => {
      const isTestUser = currentUser && currentUser.user_id.startsWith('test_');
      const bios: MarketItem[] = [];
      const goods: MarketItem[] = [];
      snapshot.forEach(doc => {
        const data = { item_id: doc.id, ...doc.data() } as MarketItem;
        if (data.category === 'BIOLOGY') {
          bios.push(data);
        } else {
          goods.push(data);
        }
      });
      // Sort by created_at desc (latest first)
      bios.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      goods.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

      // 테스트 계정이고 Firestore에 아이템이 없으면 목 데이터 사용
      if (isTestUser && bios.length === 0) {
        setRoomBiologyItems(mockBiologyItems);
      } else {
        setRoomBiologyItems(bios);
      }
      if (isTestUser && goods.length === 0) {
        setRoomGoodsItems(mockGoodsItems);
      } else {
        setRoomGoodsItems(goods);
      }
    }, (err) => {
      console.warn("Firestore marketItems fetch failed: ", err);
      const isTestUser = currentUser && currentUser.user_id.startsWith('test_');
      if (isTestUser) {
        setRoomBiologyItems(mockBiologyItems);
        setRoomGoodsItems(mockGoodsItems);
      }
    });

    return () => {
      unsubMessages();
      unsubMarket();
    };
  }, [selectedRoom, currentUser?.user_id]);

  // 입장 메시지: selectedRoom 또는 로그인 유저가 바뀔 때만 실행 (재렌더링과 무관)
  useEffect(() => {
    if (!selectedRoom || !currentUser) return;
    const isRealUser = !currentUser.user_id.startsWith('test_');
    const isAdmin = currentUser.role === 'admin';
    if (!isRealUser || isAdmin) return;

    const sessionKey = `entry_${currentUser.user_id}_${selectedRoom}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    addDoc(collection(db, 'chatMessages'), {
      user_id: 'system',
      type: 'system',
      content: `${currentUser.nickname}님이 들어왔습니다.`,
      time: getCurrentTime(),
      timestamp: Date.now(),
      region: selectedRoom,
    }).catch(err => console.warn('입장 메시지 전송 실패:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, currentUser?.user_id]);

  // Scroll to bottom on messages load
  useEffect(() => {
    if (currentTab === 'all-chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [roomMessages, currentTab]);

  const handleSendMessage = () => {
    if (!chatText.trim() || !currentUser || !selectedRoom) return;
 
    const messageText = chatText.trim();

    // 🤖 자동 금지어 / 스팸 키워드 필터링 (사장님 제로 노동용)
    const SPAM_KEYWORDS = ['카지노', '바카라', '토토', '고수익알바', '조건만남', '대출', '성인광고', 'sex', '바다이야기'];
    const hasSpam = SPAM_KEYWORDS.some(keyword => messageText.toLowerCase().includes(keyword));
    
    if (hasSpam) {
      showToast('🚫 스팸 방지: 부적절한 단어가 포함되어 있어 전송할 수 없습니다.');
      return;
    }

    const newMsg = {
      user_id: currentUser.user_id,
      type: 'mine',
      content: messageText,
      time: getCurrentTime(),
      timestamp: Date.now(),
      region: selectedRoom
    };

    addDoc(collection(db, 'chatMessages'), newMsg).catch(err => {
      console.error("Failed to send message: ", err);
      showToast('❌ 메시지 전송에 실패했습니다.');
    });
    setChatText('');

    // 같은 동네방에 있고 푸시 토큰이 등록된 다른 이웃 사용자들에게 백그라운드 푸시 알림 발송
    const otherUsersInRoom = Object.values(users).filter(u => 
      u.user_id !== currentUser.user_id && 
      (u.region === selectedRoom || (u.regions && u.regions.includes(selectedRoom))) &&
      u.fcmToken
    );

    otherUsersInRoom.forEach(user => {
      if (user.fcmToken) {
        fetch('/api/send-push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: user.fcmToken,
            title: `[${selectedRoom}] ${currentUser.nickname}`,
            body: messageText,
            dataPayload: {
              region: selectedRoom
            }
          })
        }).catch(e => {
          console.warn('Failed to send push notification to user:', user.user_id, e);
        });
      }
    });

  };

  const handleDeleteMessage = (messageId: string) => {
    const isHost = currentRoomHost && currentUser?.user_id === currentRoomHost.user_id;
    const isAdmin = currentUser?.role === 'admin';
    
    if (!isAdmin && !isHost) {
      showToast('❌ 메시지 삭제 권한이 없습니다.');
      return;
    }

    const confirmLabel = isHost 
      ? '⭐️ [방장 권한] 이 메시지를 삭제하시겠습니까? (삭제하면 다른 회원들의 화면에서도 즉시 사라집니다.)' 
      : '💬 이 메시지를 삭제하시겠습니까? (다른 회원들의 화면에서도 삭제됩니다.)';

    if (window.confirm(confirmLabel)) {
      if (!messageId.startsWith('msg_')) {
        const msgRef = doc(db, 'chatMessages', messageId);
        deleteDoc(msgRef).then(() => {
          showToast('🗑️ 메시지가 삭제되었습니다.');
        }).catch(err => {
          console.error("Failed to delete message: ", err);
          showToast('❌ 메시지 삭제에 실패했습니다.');
        });
      } else {
        // Local mock message delete
        setRoomMessages(prev => prev.filter(m => m.message_id !== messageId));
        showToast('🗑️ 테스트 메시지가 삭제되었습니다.');
      }
    }
  };

  const handleSendSuggestion = () => {
    if (!suggestionText.trim() || !currentUser) return;
    
    addDoc(collection(db, 'suggestions'), {
      user_id: currentUser.user_id,
      user_nickname: currentUser.nickname,
      content: suggestionText.trim(),
      timestamp: Date.now()
    }).then(() => {
      showToast('💡 건의사항이 전송되었습니다. 소중한 의견 감사합니다!');
      setIsSuggestionOpen(false);
      setSuggestionText('');
    }).catch(err => {
      console.error(err);
      showToast('❌ 전송에 실패했습니다.');
    });
  };

  const handleReportMessage = (msg: ChatMessage) => {
    const reason = window.prompt(
      `🚨 [신고하기] "${users[msg.user_id]?.nickname || '이웃 집사'}"님의 메시지를 신고하시겠습니까?\n\n아래 신고 사유 번호를 입력해 주세요:\n1. 스팸 / 광고 홍보\n2. 비속어 / 욕설 / 도배\n3. 불법 물생물/용품 거래\n4. 기타 부적절한 대화`
    );

    if (reason === null) return; // Cancelled
    
    let reasonText = '';
    const cleanReason = reason.trim();
    if (cleanReason === '1') reasonText = '스팸 / 광고';
    else if (cleanReason === '2') reasonText = '비속어 / 욕설 / 도배';
    else if (cleanReason === '3') reasonText = '불법 생물/용품 거래';
    else if (cleanReason === '4') reasonText = '기타 부적절한 대화';
    else reasonText = cleanReason || '기타 사유';

    addDoc(collection(db, 'reports'), {
      reporter_id: currentUser?.user_id || 'anonymous',
      reporter_nickname: currentUser?.nickname || '익명 집사',
      reported_user_id: msg.user_id,
      reported_nickname: users[msg.user_id]?.nickname || '알 수 없음',
      message_id: msg.message_id,
      message_content: msg.content,
      region: selectedRoom || '로비',
      reason: reasonText,
      timestamp: Date.now()
    }).then(() => {
      // 메시지 문서 자체의 누적 신고 수(reportCount)를 Firestore 상에서 1 증가시킴
      if (!msg.message_id.startsWith('msg_')) {
        const msgRef = doc(db, 'chatMessages', msg.message_id);
        updateDoc(msgRef, {
          reportCount: increment(1)
        }).catch(err => console.warn('Failed to increment report count:', err));
      }
      showToast('🚨 신고가 접수되었습니다. 3회 이상 신고 누적 시 자동 블라인드 처리됩니다.');
    }).catch(err => {
      console.error(err);
      showToast('❌ 신고 접수에 실패했습니다.');
    });
  };

  const handleCompleteItem = (itemId: string, category: 'BIOLOGY' | 'GOODS') => {
    // If it's a Firestore item (does not start with 'item_'), update Firestore doc status
    if (!itemId.startsWith('item_')) {
      const itemRef = doc(db, 'marketItems', itemId);
      updateDoc(itemRef, { status: 'COMPLETED' }).then(() => {
        showToast('🎉 거래 완료 상태로 변경되었습니다!');
      }).catch(err => {
        console.error("Failed to update Firestore item status: ", err);
        showToast('❌ 상태 변경에 실패했습니다.');
      });
    } else {
      // Fallback for mock local items
      const setter = category === 'BIOLOGY' ? setBiologyItems : setGoodsItems;
      setter(prev => prev.map(item => {
        if (item.item_id === itemId) {
          return { ...item, status: 'COMPLETED' };
        }
        return item;
      }));
      showToast('🎉 거래 완료 상태로 변경되었습니다!');
    }
  };

  const triggerFileSelect = () => {
    setIsPhotoOptionOpen(false);
    fileInputRef.current?.click();
  };

  const triggerCameraSelect = () => {
    setIsPhotoOptionOpen(false);
    cameraInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('📸 이미지 압축 중...');
      resizeAndCompressImage(file, 800, 800, 0.7, (base64) => {
        setPostImageBase64(base64);
        showToast('📸 업로드 완료!');
      });
    } catch (err) {
      console.error(err);
      showToast('❌ 이미지 처리에 실패했어요.');
    }
  };

  const handleCreatePost = () => {
    if (!postTitle.trim() || !postDesc.trim() || !currentUser || !selectedRoom) {
      showToast('제목과 내용을 적어주세요.');
      return;
    }

    if (!postAgree) {
      showToast('⚠️ 생물 분양 준수사항에 동의해 주세요.');
      return;
    }

    const priceNum = postPrice.trim() ? parseInt(postPrice.replace(/[^0-9]/g, '')) : 0;
    const category = currentTab === 'biology' ? 'BIOLOGY' : 'GOODS';

    const newItem = {
      user_id: currentUser.user_id,
      category,
      trade_type: postTradeType,
      title: postTitle.trim(),
      price: priceNum,
      emoji: category === 'BIOLOGY' ? (postTradeType === 'GIVE' ? '🐠' : '🔍') : '⚙️',
      description: postDesc.trim(),
      image_base64: postImageBase64 || null,
      status: 'AVAILABLE',
      created_at: new Date().toISOString().split('T')[0],
      region: selectedRoom,
      timestamp: Date.now()
    };

    // Add to Firestore
    addDoc(collection(db, 'marketItems'), newItem).then(() => {
      // Reset Form & Close
      setPostTitle('');
      setPostPrice('');
      setPostDesc('');
      setPostImageBase64(null);
      setPostAgree(false);
      setIsPostModalOpen(false);
      showToast('✅ 등록되었습니다!');
    }).catch(err => {
      console.error("Failed to create post in Firestore: ", err);
      showToast('❌ 등록에 실패했습니다.');
    });
  };

  const handleEnterRoom = (roomName: string) => {
    if (!currentUser) return;
    
    setSelectedRoom(roomName);
    
    // Push 가상 history state를 넣어 뒤로가기 시 방에서만 나가도록 처리
    window.history.pushState({ room: roomName }, '');
    
    showToast(`📍 ${roomName} 방에 입장했습니다.`);
  };

  const handleAddRegion = (regionName: string) => {
    if (!currentUser) return;

    // 인구 기반 정규화: 50만+ 대도시 → 시 단위, 소도시/군 → 권역 단위
    const normalizedRegion = normalizeRegionToRoom(regionName);
    
    if (userRegions.includes(normalizedRegion)) {
      showToast('이미 등록된 동네입니다.');
      return;
    }
    
    if (userRegions.length >= 2) {
      showToast('⭐ 프리미엄 멤버십은 현재 준비 중입니다. 출시되면 알려드릴게요!');
      return;
    }
    
    const updatedUser = {
      ...currentUser,
      regions: [...userRegions, normalizedRegion]
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('mulco_user', JSON.stringify(updatedUser));

    // 정규화로 이름이 바뀐 경우 안내
    const label = normalizedRegion !== regionName
      ? `✅ '${regionName}' → '${normalizedRegion}' 방으로 등록되었습니다.`
      : `✅ '${normalizedRegion}' 동네가 추가되었습니다.`;
    showToast(label);
    setIsAddRegionModalOpen(false);
    setNewRegionQuery('');
    setSearchRegionsResult([]);
  };

  const handleSearchNewRegion = async () => {
    if (!newRegionQuery.trim()) {
      showToast('검색어를 입력해 주세요.');
      return;
    }

    setIsSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newRegionQuery.trim())}&accept-language=ko&addressdetails=1&countrycodes=kr`
      );
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();

      if (data.length === 0) {
        showToast('검색 결과가 없습니다.');
        setSearchRegionsResult([]);
        return;
      }

      const formattedList = data.map((item: any) => {
        const addr = item.address;
        const city = addr.city || addr.town || addr.province || addr.state || '';
        const county = addr.county || addr.borough || addr.district || '';
        
        const cleanCity = city.trim();
        const cleanCounty = county.trim();
        
        if (cleanCity.includes('특별시') || cleanCity.includes('광역시') || cleanCity.includes('특별자치시')) {
          return cleanCity;
        } else if (cleanCity && cleanCounty) {
          return `${cleanCity} ${cleanCounty}`;
        } else if (cleanCity) {
          return cleanCity;
        } else {
          return item.display_name.split(',')[0];
        }
      });

      // 정규화 적용 후 중복 제거
      const normalizedList = formattedList.map((r: string) => normalizeRegionToRoom(r));
      const uniqueList = normalizedList.filter((v: string, i: number, a: string[]) => v && a.indexOf(v) === i);
      setSearchRegionsResult(uniqueList);
    } catch (err) {
      console.error(err);
      showToast('검색에 실패했습니다.');
    } finally {
      setIsSearchLoading(false);
    }
  };

  // 👑 동네방 나눔 랭킹에 따른 자동 방장 위임 시스템
  const getRoomHost = (): User | null => {
    if (!selectedRoom) return null;

    // 1. 이 방(selectedRoom)에 속한 유저들 필터링 (어드민 제외)
    const candidates = Object.values(users).filter(u => 
      u.role !== 'admin' && 
      (u.region === selectedRoom || (u.regions && u.regions.includes(selectedRoom)))
    );

    if (candidates.length === 0) return null;

    // 2. 각 유저별 나눔 완료(COMPLETED) 횟수 집계 (생물 + 용품)
    const allItems = [...biologyItems, ...goodsItems];
    const userScores = candidates.map(user => {
      const completedCount = allItems.filter(item => 
        item.user_id === user.user_id && 
        item.status === 'COMPLETED'
      ).length;
      return { user, score: completedCount };
    });

    // 3. 1회 이상 나눔을 완료한 1등 유저 선출
    const activeCandidates = userScores.filter(s => s.score > 0);
    if (activeCandidates.length === 0) return null;

    // 점수 내림차순 정렬
    activeCandidates.sort((a, b) => b.score - a.score);
    return activeCandidates[0].user;
  };

  const currentRoomHost = getRoomHost();

  const getRoomMemberCount = (roomName: string): number => {
    // 1. 해당 방에 가입된 실제 유저 (본인, Mock 유저 및 어드민 제외)
    const otherUsersInRoom = Object.values(users).filter(u => 
      u.user_id &&
      u.user_id !== currentUser?.user_id && // 본인 중복 방지
      !u.user_id.startsWith('u00') &&       // mockData의 데모 유저 제외
      u.role !== 'admin' &&                 // 어드민 계정 제외
      normalizeRegionToRoom(u.region) === roomName
    );

    // 2. 기본 1명(본인 혹은 최초 1인)에서 시작하여 실제 유저 추가마다 1명씩 누적
    return otherUsersInRoom.length + 1;
  };

  const filteredMessages = roomMessages.filter(msg => {
    const isBlocked = blockedUsers.includes(msg.user_id);
    const msgUser = users[msg.user_id];
    const isBanned = msgUser?.status === 'BANNED';
    // 3회 이상 신고 누적된 메시지는 유저 화면에서 즉시 자동 블라인드(숨김) 처리
    const isBlinded = msg.reportCount && msg.reportCount >= 3;
    return !isBlocked && !isBanned && !isBlinded;
  });
  const filteredBiology = roomBiologyItems.filter(item => {
    const isBlocked = blockedUsers.includes(item.user_id);
    const itemUser = users[item.user_id];
    const isBanned = itemUser?.status === 'BANNED';
    return !isBlocked && !isBanned;
  });
  const filteredGoods = roomGoodsItems.filter(item => {
    const isBlocked = blockedUsers.includes(item.user_id);
    const itemUser = users[item.user_id];
    const isBanned = itemUser?.status === 'BANNED';
    return !isBlocked && !isBanned;
  });

  // Render Lobby if no room is selected
  if (!selectedRoom) {
    return (
      <LobbyWrapper 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ position: 'relative' }}
      >
        <RefreshSpinner active={isRefreshing} pullY={pullDelta}>
          <span className="ms">refresh</span>
        </RefreshSpinner>
        <LobbyHeader>
          <LobbyHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            물꼬 동네방 로비
            {currentUser?.role === 'admin' && (
              <span style={{ fontSize: '0.68rem', backgroundColor: '#e74c3c', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>ADMIN</span>
            )}
          </LobbyHeaderTitle>
          <LobbyHeaderActions>
            {isDeveloper && currentUser && (
              <>
                <LobbyHeaderBtn onClick={handleToggleDeveloperRole} style={{ color: 'var(--point)', fontWeight: '800' }}>
                  <span className="ms" style={{ fontSize: '18px', color: 'var(--point)' }}>
                    {currentUser.role === 'admin' ? 'person' : 'shield_person'}
                  </span>
                  <ResponsiveText>
                    {currentUser.role === 'admin' ? '일반 모드 전환' : '관리자 모드 전환'}
                  </ResponsiveText>
                </LobbyHeaderBtn>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>|</span>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <>
                <LobbyHeaderBtn onClick={() => navigate('/admin')} style={{ color: '#e74c3c', fontWeight: '800' }}>
                  <span className="ms" style={{ fontSize: '18px', color: '#e74c3c' }}>gavel</span>
                  <ResponsiveText>신고 관리 센터</ResponsiveText>
                </LobbyHeaderBtn>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>|</span>
              </>
            )}
            <LobbyHeaderBtn onClick={() => navigate(`/profile/${currentUser?.user_id}`)}>
              <span className="ms" style={{ fontSize: '18px', color: 'var(--point)' }}>account_circle</span>
              <ResponsiveText>내 프로필</ResponsiveText>
            </LobbyHeaderBtn>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>|</span>
            <LobbyLogoutBtn onClick={logout}>
              <span className="ms" style={{ fontSize: '18px' }}>logout</span>
              <ResponsiveText>로그아웃</ResponsiveText>
            </LobbyLogoutBtn>
          </LobbyHeaderActions>
        </LobbyHeader>

        <LobbyContent>
          {currentUser?.role === 'admin' ? (
            /* ================= 최고 관리자 전용 로비 (전체 동네방 리스트) ================= */
            <LobbySection>
              <LobbySectionHeader>
                <LobbySectionTitle>전체 동네방 관리</LobbySectionTitle>
              </LobbySectionHeader>

              {ALL_ADMIN_ROOMS.map((room, idx) => {
                // 어드민 상주 카운트(+1)가 포함된 접속자 수 계산
                const actualCount = getRoomMemberCount(room.name);
                return (
                  <RoomCard key={idx} registered onClick={() => handleEnterRoom(room.name)}>
                    <RoomDetails>
                      <RoomIcon>{room.emoji}</RoomIcon>
                      <RoomText>
                        <RoomName>{room.name} 방</RoomName>
                        <RoomMembers>👥 접속자 {actualCount}명</RoomMembers>
                      </RoomText>
                    </RoomDetails>
                    <EnterArrow style={{ color: '#e74c3c' }}>관리 입장 →</EnterArrow>
                  </RoomCard>
                );
              })}
            </LobbySection>
          ) : (
            /* ================= 일반 사용자 전용 로비 ================= */
            <>
              {/* 내 동네 목록 */}
              <LobbySection>
                <LobbySectionHeader>
                  <LobbySectionTitle>내 동네방</LobbySectionTitle>
                  <LobbyAddBtn onClick={() => {
                    if (userRegions.length >= 2) {
                      showToast('⭐ 프리미엄 멤버십은 현재 준비 중입니다. 출시되면 알려드릴게요!');
                    } else {
                      setIsAddRegionModalOpen(true);
                    }
                  }}>
                    <span className="ms" style={{ fontSize: '16px' }}>add</span> 동네 추가하기
                  </LobbyAddBtn>
                </LobbySectionHeader>

                {userRegions.map((regionName, idx) => {
                  // 일반 유저용 어드민 포함 카운트
                  const actualCount = getRoomMemberCount(regionName);
                  return (
                    <RoomCard key={idx} registered onClick={() => handleEnterRoom(regionName)}>
                      <RoomDetails>
                        <RoomIcon>{getRegionEmoji(regionName)}</RoomIcon>
                        <RoomText>
                          <RoomName>{regionName} 방</RoomName>
                          <RoomMembers>👥 접속자 {actualCount}명</RoomMembers>
                        </RoomText>
                      </RoomDetails>
                      <EnterArrow>입장 →</EnterArrow>
                    </RoomCard>
                  );
                })}

                <LockCard onClick={() => showToast('⭐ 프리미엄 멤버십은 현재 준비 중입니다. 출시되면 알려드릴게요!')}>
                  <LockDetails>
                    <RoomIcon style={{ backgroundColor: '#FFF9E6' }}>🔒</RoomIcon>
                    <LockText>
                      <LockTitle>3번째 동네 등록하기</LockTitle>
                      <LockBadge>PREMIUM</LockBadge>
                    </LockText>
                  </LockDetails>
                  <span className="ms" style={{ color: '#E0E0DB' }}>lock</span>
                </LockCard>
              </LobbySection>

              {/* 전체 동네방 둘러보기 */}
              <LobbySection>
                <LobbySectionTitle>인기 동네방 둘러보기</LobbySectionTitle>
                {popularRooms.map((room, idx) => {
                  const isRegistered = userRegions.includes(room.name);
                  const canEnter = isRegistered;
                  const actualCount = getRoomMemberCount(room.name);
                  return (
                    <RoomCard 
                      key={idx} 
                      onClick={() => {
                        if (canEnter) {
                          handleEnterRoom(room.name);
                        } else {
                          showToast('💡 이 방에 참여하려면 \'내 동네 추가하기\'로 먼저 등록해 주세요!');
                        }
                      }}
                      style={{ opacity: canEnter ? 1 : 0.7 }}
                    >
                      <RoomDetails>
                        <RoomIcon>{room.emoji}</RoomIcon>
                        <RoomText>
                          <RoomName>{room.name} 방</RoomName>
                          <RoomMembers>👥 접속자 {actualCount}명</RoomMembers>
                        </RoomText>
                      </RoomDetails>
                      {isRegistered ? (
                        <EnterArrow>입장 →</EnterArrow>
                      ) : (
                        <span className="ms" style={{ fontSize: '18px', color: '#E0E0DB' }}>add_circle</span>
                      )}
                    </RoomCard>
                  );
                })}
              </LobbySection>
            </>
          )}
        </LobbyContent>

        {/* 동네 추가 모달 */}
        {isAddRegionModalOpen && (
          <AddRegionModalOverlay onClick={() => setIsAddRegionModalOpen(false)}>
            <AddRegionModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>새 동네 추가 (최대 2개 무료)</ModalTitle>
                <CloseBtn onClick={() => setIsAddRegionModalOpen(false)}>×</CloseBtn>
              </ModalHeader>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <ModalInput 
                  style={{ flex: 1 }}
                  placeholder="예: 서울, 성남, 부산" 
                  value={newRegionQuery}
                  onChange={e => setNewRegionQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSearchNewRegion();
                  }}
                />
                <SearchBtn onClick={handleSearchNewRegion} disabled={isSearchLoading}>
                  {isSearchLoading ? '검색...' : '검색'}
                </SearchBtn>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchRegionsResult.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleAddRegion(res)}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid #E0E0DB'
                    }}
                  >
                    📍 {res} 추가하기
                  </div>
                ))}
                {searchRegionsResult.length === 0 && !isSearchLoading && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8c8c8c', padding: '16px 0' }}>
                    추가할 동네의 시/군 이름을 검색해 주세요.
                  </div>
                )}
              </div>
            </AddRegionModalContent>
          </AddRegionModalOverlay>
        )}
      </LobbyWrapper>
    );
  }

  return (
    <Container>
      <Header 
        title={`${selectedRoom} 방`} 
        onBack={() => {
          setSelectedRoom(null);
          // 가상 history state를 하나 뒤로 돌림 (popstate가 자동으로 selectedRoom을 null로 제어)
          window.history.back();
        }}
        onMenu={() => setIsMenuOpen(true)}
      />

      <TabBar role="tablist">
        <TabBtn 
          active={currentTab === 'all-chat'} 
          onClick={() => setCurrentTab('all-chat')}
        >
          💬 전체
        </TabBtn>
        <TabBtn 
          active={currentTab === 'biology'} 
          onClick={() => setCurrentTab('biology')}
        >
          🐟 생물 분양
        </TabBtn>
        <TabBtn 
          active={currentTab === 'goods'} 
          onClick={() => setCurrentTab('goods')}
        >
          🌿 용품·수초
        </TabBtn>
      </TabBar>

      <TabWrapper>
        {/* Tab 1: Chatting */}
        <TabContent active={currentTab === 'all-chat'}>
          <ChatContainer ref={chatContainerRef}>
            <DateDivider>2026년 7월 5일</DateDivider>
            {filteredMessages.map(msg => {
              const isMsgOwner = msg.user_id === currentUser?.user_id;
              const isRoomHost = currentRoomHost && msg.user_id === currentRoomHost.user_id;
              const isModerator = currentUser?.role === 'admin' || (currentRoomHost && currentUser?.user_id === currentRoomHost.user_id);
              return (
                <ChatBubble 
                  key={msg.message_id}
                  message={msg}
                  isMe={isMsgOwner}
                  sender={users[msg.user_id] || currentUser}
                  onAvatarClick={() => navigate(`/profile/${msg.user_id}`)}
                  onDeleteClick={isModerator ? () => handleDeleteMessage(msg.message_id) : undefined}
                  onReportClick={() => handleReportMessage(msg)}
                  isHost={isRoomHost ? true : false}
                />
              );
            })}
          </ChatContainer>

          <AdBanner 
            platform="auto"
            adSenseClient="" // PC/모바일 웹: 구글 애드센스 Client ID 입력 (예: "ca-pub-xxxxxxxxxxxxxxxx")
            adSenseSlot=""   // PC/모바일 웹: 구글 애드센스 Slot ID 입력 (예: "9876543210")
            adMobAndroidAdUnitId="ca-app-pub-5790779596646122/8477437575" // 안드로이드 앱 광고 단위 ID
            adMobIosAdUnitId="ca-app-pub-5790779596646122/5993945706"     // iOS 앱 광고 단위 ID
          />

          <ChatInputBar>
            <ChatInput 
              placeholder="메시지를 입력하세요..." 
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <SendBtn onClick={handleSendMessage} aria-label="전송">
              <span className="ms" style={{ fontSize: '18px' }}>send</span>
            </SendBtn>
          </ChatInputBar>
        </TabContent>

        {/* Tab 2: Biology Market */}
        <TabContent active={currentTab === 'biology'}>
          {filteredBiology.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-light)', opacity: 0.65 }}>
              <span className="ms" style={{ fontSize: '48px', marginBottom: '12px', color: 'var(--point)' }}>phishing</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>아직 등록된 생물 분양글이 없습니다.</p>
            </div>
          ) : (
            <MarketGrid>
              {filteredBiology.map(item => (
                <MarketCard 
                  key={item.item_id}
                  item={item}
                  seller={users[item.user_id] || currentUser}
                  isMine={item.user_id === currentUser?.user_id}
                  onCompleteClick={(e) => {
                    e.stopPropagation();
                    handleCompleteItem(item.item_id, 'BIOLOGY');
                  }}
                  onCardClick={() => navigate(`/profile/${item.user_id}`)}
                />
              ))}
            </MarketGrid>
          )}
          <AdBanner 
            platform="auto"
            adSenseClient="" // PC/모바일 웹 ID
            adSenseSlot=""   
            adMobAndroidAdUnitId="ca-app-pub-5790779596646122/8477437575"
            adMobIosAdUnitId="ca-app-pub-5790779596646122/5993945706"
          />
        </TabContent>

        {/* Tab 3: Goods Market */}
        <TabContent active={currentTab === 'goods'}>
          {filteredGoods.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-light)', opacity: 0.65 }}>
              <span className="ms" style={{ fontSize: '48px', marginBottom: '12px', color: 'var(--point)' }}>inventory_2</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>아직 등록된 용품/수초 분양글이 없습니다.</p>
            </div>
          ) : (
            <MarketGrid>
              {filteredGoods.map(item => (
                <MarketCard 
                  key={item.item_id}
                  item={item}
                  seller={users[item.user_id] || currentUser}
                  isMine={item.user_id === currentUser?.user_id}
                  onCompleteClick={(e) => {
                    e.stopPropagation();
                    handleCompleteItem(item.item_id, 'GOODS');
                  }}
                  onCardClick={() => navigate(`/profile/${item.user_id}`)}
                />
              ))}
            </MarketGrid>
          )}
          <AdBanner 
            platform="auto"
            adSenseClient="" // PC/모바일 웹 ID
            adSenseSlot=""   
            adMobAndroidAdUnitId="ca-app-pub-5790779596646122/8477437575"
            adMobIosAdUnitId="ca-app-pub-5790779596646122/5993945706"
          />
        </TabContent>
      </TabWrapper>

      {currentTab !== 'all-chat' && (
        <Fab onClick={() => setIsPostModalOpen(true)} aria-label="게시글 작성">
          <span className="ms" style={{ fontSize: '28px' }}>add</span>
        </Fab>
      )}

      {/* Menu Drawer */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="더보기">
        <MenuItem onClick={() => { setIsMenuOpen(false); navigate(`/profile/${currentUser?.user_id}`); }}>
          <span className="ms">person</span> 내 프로필 보기
        </MenuItem>
        {isDeveloper && (
          <MenuItem onClick={() => { setIsMenuOpen(false); handleToggleDeveloperRole(); }} style={{ borderColor: 'var(--point)', color: 'var(--point)' }}>
            <span className="ms" style={{ color: 'var(--point)' }}>
              {currentUser?.role === 'admin' ? 'person' : 'shield_person'}
            </span>
            {currentUser?.role === 'admin' ? '[개발자] 일반 모드로 전환' : '[개발자] 관리자 모드로 전환'}
          </MenuItem>
        )}
        <MenuItem onClick={() => { setIsMenuOpen(false); setIsSuggestionOpen(true); }}>
          <span className="ms">lightbulb</span> 건의사항 보내기
        </MenuItem>
        <MenuItem onClick={() => { setIsMenuOpen(false); logout(); }}>
          <span className="ms">logout</span> 로그아웃
        </MenuItem>
      </BottomSheet>

      {/* Write Post BottomSheet */}
      <BottomSheet 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        title={currentTab === 'biology' ? '🐟 생물 분양글 올리기' : '🌿 용품/수초 글 올리기'}
      >
        <InputGroup>
          <Label>거래 방식</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ModalBtn 
              selected={postTradeType === 'GIVE'} 
              onClick={() => setPostTradeType('GIVE')}
            >
              나눔/분양하기
            </ModalBtn>
            <ModalBtn 
              selected={postTradeType === 'TAKE'} 
              onClick={() => setPostTradeType('TAKE')}
            >
              찾아요/구해요
            </ModalBtn>
          </div>
        </InputGroup>

        <InputGroup>
          <Label>사진 등록 (선택)</Label>
          <ImageUploadTrigger onClick={() => setIsPhotoOptionOpen(true)}>
            {postImageBase64 ? (
              <img src={postImageBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <span className="ms" style={{ fontSize: '28px', marginBottom: '4px' }}>photo_camera</span>
                <span>사진 추가하기</span>
              </>
            )}
          </ImageUploadTrigger>
        </InputGroup>

        <InputGroup>
          <Label>글 제목</Label>
          <ModalInput 
            placeholder="제목을 입력해 주세요" 
            value={postTitle}
            onChange={e => setPostTitle(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>분양가 / 책임비 (원)</Label>
          <ModalInput 
            placeholder="무료 나눔은 비워두세요" 
            type="text"
            inputMode="numeric"
            value={postPrice}
            onChange={e => setPostPrice(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </InputGroup>

        <InputGroup>
          <Label>상세 설명</Label>
          <ModalTextarea 
            rows={4} 
            placeholder="생물의 종류, 건강 상태, 크기 및 직거래 약속 장소 등을 남겨주세요." 
            value={postDesc}
            onChange={e => setPostDesc(e.target.value)}
          />
        </InputGroup>

        <div style={{
          backgroundColor: 'var(--sub)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          lineHeight: '1.45',
          color: 'var(--text)',
          marginBottom: '16px',
          border: '1px solid var(--muted-dark)'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--point-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="ms" style={{ fontSize: '16px' }}>gavel</span> 안전한 생물 분양 준수사항
          </div>
          • 개, 고양이, 햄스터 등 6대 반려동물은 관련법상 개인 거래가 금지되어 물코에서 분양할 수 없습니다. (위반 시 제재)<br />
          • 물코는 <strong>관상어, 수초, 물생활 용품</strong> 거래만 허용합니다.<br />
          • 개인 간의 비상업적인 거래여야 하며, 거래 시 발생한 직거래 문제에 대해 물코는 책임을 지지 않습니다.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="checkbox" 
            id="postAgree" 
            checked={postAgree} 
            onChange={e => setPostAgree(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--point)' }} 
          />
          <label htmlFor="postAgree" style={{ fontSize: '0.84rem', fontWeight: '500', cursor: 'pointer', userSelect: 'none' }}>
            [필수] 위의 생물 분양 준수사항을 확인했으며 동의합니다.
          </label>
        </div>

        <PrimaryBtn onClick={handleCreatePost} style={{ marginTop: '16px' }}>
          등록 완료
        </PrimaryBtn>
      </BottomSheet>

      {/* Select Photo Option Sheet */}
      <BottomSheet 
        isOpen={isPhotoOptionOpen} 
        onClose={() => setIsPhotoOptionOpen(false)} 
        title="사진 추가"
      >
        <MenuItem onClick={triggerFileSelect}>
          <span className="ms">image</span> 앨범에서 선택
        </MenuItem>
        <MenuItem onClick={triggerCameraSelect}>
          <span className="ms">photo_camera</span> 카메라로 촬영
        </MenuItem>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleImageChange} 
        />
        <input 
          ref={cameraInputRef} 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleImageChange} 
        />
      </BottomSheet>

      {/* Suggestion BottomSheet */}
      <BottomSheet 
        isOpen={isSuggestionOpen} 
        onClose={() => { setIsSuggestionOpen(false); setSuggestionText(''); }} 
        title="💡 건의사항 보내기"
      >
        <InputGroup>
          <Label>보내실 의견 (제안 / 버그 제보 등)</Label>
          <ModalTextarea 
            placeholder="물꼬를 사용하시면서 느낀 건의사항이나 개선 제안, 발견한 버그가 있다면 편하게 남겨주세요. 🐠"
            value={suggestionText}
            onChange={e => setSuggestionText(e.target.value)}
            style={{ height: '140px' }}
          />
        </InputGroup>
        <PrimaryBtn 
          onClick={handleSendSuggestion}
          disabled={!suggestionText.trim()}
          style={{ marginTop: '16px' }}
        >
          제출하기
        </PrimaryBtn>
      </BottomSheet>
    </Container>
  );
};
