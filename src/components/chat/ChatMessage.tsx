import React from 'react';
import styled from 'styled-components';
import { ChatMessage as ChatMessageType, User } from '../../types';
import { escapeHtml } from '../../utils/format';

interface ChatBubbleProps {
  message: ChatMessageType;
  sender: User | null;
  isMe: boolean;
  onAvatarClick?: () => void;
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

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, sender, isMe, onAvatarClick }) => {
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
        {!isMe && <SenderName>{sender?.nickname || '알 수 없음'}</SenderName>}
        <BubbleContainer style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
          <MessageBubble isMe={isMe}>
            {message.content}
          </MessageBubble>
          <TimeLabel>{message.time}</TimeLabel>
        </BubbleContainer>
      </ContentCol>
    </BubbleRow>
  );
};
