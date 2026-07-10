import React from 'react';
import styled from 'styled-components';
import { ChatMessage as ChatMessageType, User } from '../../types';
import { escapeHtml } from '../../utils/format';

interface ChatBubbleProps {
  message: ChatMessageType;
  sender: User | null;
  isMe: boolean;
  onAvatarClick?: () => void;
  onDeleteClick?: () => void;
  onReportClick?: () => void;
  isHost?: boolean;
}

const BubbleRow = styled.div<{ isMe: boolean }>`
  display: flex;
  margin-bottom: 16px;
  justify-content: ${props => (props.isMe ? 'flex-end' : 'flex-start')};
  animation: fadeIn 0.25s ease;
`;

const AvatarWrapper = styled.div<{ bg?: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.circle};
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 700;
  font-size: 0.9rem;
  background: ${props => props.bg || props.theme.colors.main};
  box-shadow: ${props => props.theme.shadows.sm};
  cursor: pointer;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  filter: contrast(1.05);
`;

const ContentCol = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
`;

const SenderName = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.7;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const AdminBadge = styled.span`
  background-color: ${props => props.theme.colors.point};
  color: ${props => props.theme.colors.white};
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1.5px 5px;
  border-radius: 4px;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const HostBadge = styled.span`
  background-color: #f1c40f;
  color: #2c3e50;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1.5px 5px;
  border-radius: 4px;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const BubbleContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
`;

const MessageBubble = styled.div<{ isMe: boolean }>`
  background-color: ${props => (props.isMe ? props.theme.colors.main : props.theme.colors.white)};
  color: ${props => props.theme.colors.text};
  padding: 10px 14px;
  border-radius: ${props => (props.isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px')};
  font-size: 0.86rem;
  line-height: 1.4;
  word-break: break-all;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TimeLabel = styled.div`
  font-size: 0.65rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.5;
  white-space: nowrap;
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.65;
  transition: opacity 0.2s ease;

  &:active {
    opacity: 1;
  }
`;

const ReportBtn = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textLight || '#8c8c8c'};
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.65;
  transition: all 0.2s ease;

  &:hover {
    color: #e67e22 !important;
    opacity: 1;
  }
  &:active {
    transform: scale(0.9);
  }
`;

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, sender, isMe, onAvatarClick, onDeleteClick, onReportClick, isHost }) => {
  const getAvatarBg = () => {
    if (!sender?.avatar) return undefined;
    const bgMap: Record<string, string> = {
      'images/avatar-girl.png': '#FFE5EC',
      'images/avatar-boy.png': '#E5F7FF',
      'images/avatar-woman.png': '#E5FAF0',
      'images/avatar-man.png': '#FFF5D1',
      'images/avatar-child.png': '#FFEAF0'
    };
    return bgMap[sender.avatar];
  };

  const renderAvatar = () => {
    if (!sender) return '?';
    if (sender.avatar) {
      return <AvatarImage src={`/${sender.avatar}`} alt={sender.nickname} />;
    }
    return sender.avatar_letter || sender.nickname.charAt(0);
  };

  return (
    <BubbleRow isMe={isMe}>
      {!isMe && (
        <AvatarWrapper bg={getAvatarBg()} onClick={onAvatarClick}>
          {renderAvatar()}
        </AvatarWrapper>
      )}
      
      <ContentCol>
        {!isMe && (
          <SenderName>
            {sender?.nickname || '알 수 없음'}
            {sender?.role === 'admin' && <AdminBadge>운영자 👑</AdminBadge>}
            {isHost && <HostBadge>방장 ⭐️</HostBadge>}
          </SenderName>
        )}
        <BubbleContainer style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
          <MessageBubble isMe={isMe}>
            {message.content}
          </MessageBubble>
          <TimeLabel>{message.time}</TimeLabel>
          {onDeleteClick && (
            <DeleteBtn onClick={onDeleteClick} title="메시지 삭제">
              <span className="ms" style={{ fontSize: '15px' }}>delete</span>
            </DeleteBtn>
          )}
          {!isMe && onReportClick && (
            <ReportBtn onClick={onReportClick} title="신고하기">
              <span className="ms" style={{ fontSize: '15px' }}>report</span>
            </ReportBtn>
          )}
        </BubbleContainer>
      </ContentCol>
    </BubbleRow>
  );
};
