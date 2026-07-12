import React from 'react';
import styled from 'styled-components';

interface LayoutProps {
  children: React.ReactNode;
}

export const LayoutWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.bg};
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 auto;
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <LayoutWrapper>{children}</LayoutWrapper>;
};
