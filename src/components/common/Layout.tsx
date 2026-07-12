import React from 'react';
import styled from 'styled-components';
import { useApp } from '../../context/AppContext';

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

const FloatingDevToggle = styled.button<{ isAdmin: boolean }>`
  position: fixed;
  top: 12px;
  right: calc(50% - 190px); /* 500px layout width support */
  z-index: 10001;
  background: ${props => props.isAdmin ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' : 'linear-gradient(135deg, #3A6073 0%, #2C3E50 100%)'};
  color: white;
  border: none;
  border-radius: 30px;
  padding: 6px 12px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }

  @media (max-width: 520px) {
    right: 56px;
  }
  
  .ms {
    font-size: 13px;
  }
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, setCurrentUser, setUsers, showToast } = useApp();
  
  const isDeveloper = currentUser?.email === 'syeon9574@gmail.com' || currentUser?.email?.startsWith('syeon9574');
  const isAdmin = currentUser?.role === 'admin';

  const handleToggleRole = () => {
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

  return (
    <LayoutWrapper>
      {children}
      {isDeveloper && currentUser && (
        <FloatingDevToggle isAdmin={isAdmin} onClick={handleToggleRole} title="개발자 모드 빠른 토글">
          <span className="ms">{isAdmin ? 'shield_person' : 'person'}</span>
          {isAdmin ? '관리자 모드' : '일반 모드'}
        </FloatingDevToggle>
      )}
    </LayoutWrapper>
  );
};
