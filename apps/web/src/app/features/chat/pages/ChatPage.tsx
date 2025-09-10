import { AppLayout } from '../../../shared';
import { ChatHeader, MessageInput, MessageList, NicknameForm } from '../components';
import { useChatMessage, useChatNode } from '../hooks';

/**
 * Main chat page component that handles the entire chat experience
 * Shows nickname form if user hasn't joined, otherwise shows chat interface
 * @returns {JSX.Element} Chat page with conditional rendering based on join status
 */
export const ChatPage = () => {
    const { node, messages, joinRoom, connectionStatus, leaveRoom, isJoining, isLeaving } = useChatNode();
    const { sendHttpMessage, isSending, pendingMessage } = useChatMessage(node?.id, node?.roomId);

    // Show nickname form if user hasn't joined yet
    if (!node) {
        return (
            <AppLayout>
                <NicknameForm onJoin={joinRoom} isJoining={isJoining} />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-background">
                <ChatHeader
                    nickname={node.nickname || ''}
                    connectionStatus={connectionStatus}
                    onLeave={leaveRoom}
                    isLeaving={isLeaving}
                    canLeave={!!node.id}
                />

                <div className="flex-1 overflow-hidden">
                    <MessageList
                        messages={messages}
                        currentUserId={node.connectionId || ''}
                        currentUserNickname={node.nickname || ''}
                        isSending={isSending}
                        pendingMessage={pendingMessage}
                    />
                </div>

                <MessageInput
                    onSendMessage={sendHttpMessage}
                    isSending={isSending}
                    isDisabled={connectionStatus !== 'connected'}
                />
            </div>
        </AppLayout>
    );
};
