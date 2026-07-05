import React from 'react';
import styled from 'styled-components';

interface LayoutProps {
  children: React.ReactNode;
}

export const LayoutWrapper = styled.div`
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.bg};
  box-shadow: ${props => props.theme.shadows.lg};
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 auto;
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <LayoutWrapper>{children}</LayoutWrapper>;
};
