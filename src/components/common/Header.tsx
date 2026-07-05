import React from 'react';
import styled from 'styled-components';
import { Icons } from './Icons';

interface HeaderProps {
  title?: React.ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  logo?: boolean;
}

const HeaderContainer = styled.header`
  height: 56px;
  background-color: ${props => props.theme.colors.bg};
  border-bottom: 1px solid ${props => props.theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const SideWrapper = styled.div`
  width: 40px;
  display: flex;
  align-items: center;
`;

const TitleWrapper = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 1.05rem;
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.circle};
  transition: ${props => props.theme.transitions.default};
  
  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const LogoImage = styled.img`
  height: 22px;
  object-fit: contain;
`;

export const Header: React.FC<HeaderProps> = ({ title, onBack, onMenu, logo }) => {
  return (
    <HeaderContainer>
      <SideWrapper>
        {onBack && (
          <IconButton onClick={onBack} aria-label="뒤로가기">
            <span className="ms" style={{ fontSize: '24px' }}>chevron_left</span>
          </IconButton>
        )}
      </SideWrapper>

      <TitleWrapper>
        {logo ? (
          <LogoImage src="/images/logo-wordmark.png" alt="물꼬" />
        ) : (
          title
        )}
      </TitleWrapper>

      <SideWrapper style={{ justifyContent: 'flex-end' }}>
        {onMenu && (
          <IconButton onClick={onMenu} title="설정">
            <span className="ms">more_horiz</span>
          </IconButton>
        )}
      </SideWrapper>
    </HeaderContainer>
  );
};
