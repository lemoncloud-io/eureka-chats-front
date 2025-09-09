import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatMessage } from './ChatMessage';
import { SystemMessage } from './SystemMessage';

import type { ClientChatMessageInfo } from '../hooks/useChatNode';
import type { SocketResponse } from '@lemoncloud/eureka-sockets-api';

interface MessageListProps {
    messages: SocketResponse<ClientChatMessageInfo>[];
    currentUserId: string;
    currentUserNickname: string;
    isSending?: boolean;
    pendingMessage?: string;
}

/**
 * Message list container with auto-scroll functionality
 * Renders chat messages and system messages with proper scrolling behavior
 * @param {MessageListProps} props - Component props
 * @param {SocketResponse<ClientChatMessageInfo>[]} props.messages - Array of messages from WebSocket
 * @param {string} props.currentUserId - Current user's connection ID
 * @param {string} props.currentUserNickname - Current user's nickname
 * @param {boolean} props.isSending - Whether a message is currently being sent
 * @param {string} props.pendingMessage - The message being sent (for loader display)
 * @returns {JSX.Element} Scrollable message list container
 */
export const MessageList = ({
    messages,
    currentUserId,
    currentUserNickname,
    isSending,
    pendingMessage,
}: MessageListProps) => {
    const { t } = useTranslation();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="h-full overflow-y-auto overflow-x-hidden px-4 pt-4 pb-8">
                <div className="text-center text-muted-foreground mt-8">
                    <p>{t('chat.emptyMessage')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden px-4 pt-4 pb-8">
            {messages.map((msg, idx) => {
                if (msg.data?.isSystemMessage) {
                    return <SystemMessage key={idx} message={msg.data.message || ''} />;
                }

                const isMyMessage = msg.data?.author === currentUserId;

                return (
                    <ChatMessage
                        key={idx}
                        message={msg.data?.message || ''}
                        timestamp={msg.ts}
                        isMyMessage={isMyMessage}
                        authorNickname={
                            isMyMessage ? currentUserNickname : msg.data?.authorName || t('chat.anonymousUser')
                        }
                    />
                );
            })}

            {isSending && pendingMessage && (
                <div className="flex justify-end mb-3">
                    <div className="max-w-[85%] px-3 py-2 bg-primary text-primary-foreground rounded-xl rounded-br-md break-words text-base leading-6 relative">
                        <div className="flex justify-center my-1">
                            <div className="flex space-x-1">
                                <div
                                    className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full animate-pulse"
                                    style={{ animationDelay: '0ms' }}
                                ></div>
                                <div
                                    className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full animate-pulse"
                                    style={{ animationDelay: '100ms' }}
                                ></div>
                                <div
                                    className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full animate-pulse"
                                    style={{ animationDelay: '200ms' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};
