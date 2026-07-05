import React, { useEffect } from 'react';
import styled from 'styled-components';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: absolute;
  inset: 0;
  background-color: rgba(44, 44, 44, 0.4);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.25s ease, visibility 0.25s ease;
  backdrop-filter: blur(2px);
`;

const Sheet = styled.div<{ isOpen: boolean }>`
  width: 100%;
  background-color: ${props => props.theme.colors.bg};
  border-radius: ${props => props.theme.borderRadius.lg} ${props => props.theme.borderRadius.lg} 0 0;
  padding: 16px 20px 24px;
  transform: translateY(${props => (props.isOpen ? '0' : '100%')});
  transition: transform 0.28s cubic-bezier(0.1, 0.76, 0.55, 0.94);
  max-height: 85%;
  display: flex;
  flex-direction: column;
`;

const Handle = styled.div`
  width: 36px;
  height: 4px;
  background-color: ${props => props.theme.colors.muted};
  border-radius: 999px;
  margin: 0 auto 16px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 12px;
`;

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <Sheet isOpen={isOpen}>
        <Handle />
        {title && <Title>{title}</Title>}
        {children}
      </Sheet>
    </Overlay>
  );
};
