import React from 'react';
import styled from 'styled-components';
import { MarketItem, User } from '../../types';
import { getItemIconInfo } from '../common/Icons';
import { formatPrice } from '../../utils/format';

interface MarketCardProps {
  item: MarketItem;
  seller: User | null;
  isMine: boolean;
  onCompleteClick: (e: React.MouseEvent) => void;
  onCardClick: () => void;
}

const CardWrapper = styled.div`
  position: relative;
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  border: 1px solid rgba(0,0,0,0.02);

  &:active {
    transform: scale(0.98);
  }
`;

const ThumbnailContainer = styled.div<{ bg: string }>`
  width: 100%;
  aspect-ratio: 1.1;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TagChip = styled.span<{ variant: 'give' | 'take' | 'complete' }>`
  align-self: flex-start;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2.5px 6px;
  border-radius: 4px;
  
  ${props => {
    if (props.variant === 'give') {
      return `
        background-color: #E2EFE7;
        color: #2E6A4F;
      `;
    }
    if (props.variant === 'take') {
      return `
        background-color: #E6EEFF;
        color: #2E5FA5;
      `;
    }
    return `
      background-color: #E0E0DB;
      color: #7A7A75;
    `;
  }}
`;

const Title = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled.div<{ free?: boolean }>`
  font-size: 0.88rem;
  font-weight: 700;
  color: ${props => (props.free ? props.theme.colors.point : props.theme.colors.text)};
`;

const SellerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.72rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.5;
  margin-top: 2px;

  svg {
    flex-shrink: 0;
  }
`;

const CompleteBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 10px;
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: 10;
  
  &:active {
    opacity: 0.9;
  }
`;

const CompletedOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(253, 249, 247, 0.5);
  border-radius: ${props => props.theme.borderRadius.lg};
  pointer-events: none;
  z-index: 5;
`;

export const MarketCard: React.FC<MarketCardProps> = ({ 
  item, 
  seller, 
  isMine, 
  onCompleteClick, 
  onCardClick 
}) => {
  const isCompleted = item.status === 'COMPLETED';
  const tagVariant = isCompleted 
    ? 'complete' 
    : (item.trade_type === 'GIVE' ? 'give' : 'take');
  
  const tagText = isCompleted 
    ? '거래완료' 
    : (item.trade_type === 'GIVE' ? '보내요' : '받아요');

  const iconInfo = getItemIconInfo(item);

  return (
    <CardWrapper onClick={onCardClick}>
      <ThumbnailContainer bg={iconInfo.bg}>
        {iconInfo.isImage ? (
          <ThumbnailImage src={iconInfo.src} alt={item.title} />
        ) : (
          <span style={{ fontSize: '2.5rem' }}>{iconInfo.emoji}</span>
        )}
      </ThumbnailContainer>
      
      <CardBody>
        <TagChip variant={tagVariant}>{tagText}</TagChip>
        <Title>{item.title}</Title>
        <Price free={item.price === 0}>{formatPrice(item.price)}</Price>
        <SellerRow>
          <svg viewBox="0 0 14 14" width="11" height="11" fill="none">
            <path d="M7 1a4.5 4.5 0 0 0-4.5 4.5C2.5 8.5 7 13 7 13s4.5-4.5 4.5-7.5A4.5 4.5 0 0 0 7 1z" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          {seller?.nickname || '알 수 없음'}
        </SellerRow>
      </CardBody>

      {isMine && !isCompleted && (
        <CompleteBtn onClick={onCompleteClick}>완료</CompleteBtn>
      )}

      {isCompleted && <CompletedOverlay />}
    </CardWrapper>
  );
};
