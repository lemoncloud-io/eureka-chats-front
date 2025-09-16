import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'sonner';

import { useEnterRoom, useLeaveRoom, useUpdateNode } from '@lemon/chats';
import { CHAT_API_ENDPOINT, EnvironmentVariableError, validateChatApiEndpoint } from '@lemon/web-core';

import { ChatWebSocketServiceV2 } from '../services/websocket';

import type { ChatMessageInfo, NodeView } from '@lemoncloud/eureka-chats-api';
import type { SocketResponse } from '@lemoncloud/eureka-sockets-api';

/**
 * interface: `SocketResponse`
 * - WebSocket response structure
 * - extends SocketPayload with response-specific features
 */
export interface ClientChatMessageInfo extends ChatMessageInfo {
    isSystemMessage?: boolean;
}

export const useChatNode = () => {
    const { t } = useTranslation();
    const [node, setNode] = useState<(NodeView & { nickname?: string }) | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'
    >('disconnected');
    const [messages, setMessages] = useState<SocketResponse<ClientChatMessageInfo>[]>([]);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsService = useRef<ChatWebSocketServiceV2 | null>(null);
    const hasEnteredRoom = useRef(false);
    const nodeIdRef = useRef<string | null>(null);

    const { mutateAsync: enterRoom } = useEnterRoom();
    const { mutateAsync: leaveRoom } = useLeaveRoom();

    const { mutateAsync: updateNode } = useUpdateNode();

    const joinRoom = useCallback(
        async (nickname: string) => {
            if (hasEnteredRoom.current || isJoining) return;

            setIsJoining(true);
            setError(null);
            try {
                const node = await enterRoom({ name: nickname });

                if (!node.room$ || !node.room$.channelId) {
                    throw new Error('Invalid node response');
                }

                if (!node.Token?.identityToken) {
                    throw new Error('Identity token is missing from node response');
                }

                setNode({ ...node, nickname });
                nodeIdRef.current = node.id || null;

                wsService.current = new ChatWebSocketServiceV2();
                setConnectionStatus('connecting');

                wsService.current.onConnectionStatus(setConnectionStatus);

                wsService.current.onConnectionId(async connectionId => {
                    if (!node.id) {
                        console.error('Node ID is missing');
                        return;
                    }
                    const updatedNode = await updateNode({ nodeId: node.id, connectionId });

                    setNode({ ...updatedNode, nickname });
                });

                wsService.current.onMessage(socketResponse => {
                    if (socketResponse.action === 'message') {
                        const messageData = socketResponse.data;

                        if (messageData?.action === 'join' || messageData?.action === 'leave') {
                            const currentConnectionId = wsService.current?.getConnectionId();
                            if (messageData.author !== currentConnectionId) {
                                const actionText =
                                    messageData.action === 'join'
                                        ? t('chat.systemMessages.joined')
                                        : t('chat.systemMessages.left');
                                const systemMessage = {
                                    ...socketResponse,
                                    data: {
                                        ...messageData,
                                        message: t('chat.systemMessages.userAction', {
                                            userName: messageData.authorName || t('chat.anonymousUser'),
                                            action: actionText,
                                        }),
                                        isSystemMessage: true,
                                    },
                                };
                                setMessages(prev => [...prev, systemMessage]);
                            }
                        } else {
                            setMessages(prev => [...prev, socketResponse]);
                        }
                    }
                });

                wsService.current.connect(node.room$.channelId, node.Token?.identityToken);
                hasEnteredRoom.current = true;

                return node;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
                setError(errorMessage);
                throw error;
            } finally {
                setIsJoining(false);
            }
        },
        [enterRoom, isJoining, updateNode]
    );

    const sendWebSocketMessage = useCallback((text: string) => {
        wsService.current?.sendChatMessage(text);
    }, []);

    const leaveRoomHandler = useCallback(async () => {
        if (!node?.id || isLeaving) return;

        setIsLeaving(true);
        try {
            await leaveRoom(node.id);
            wsService.current?.disconnect();
            wsService.current = null;
            setNode(null);
            setMessages([]);
            hasEnteredRoom.current = false;
            nodeIdRef.current = null;
            console.log('[CHAT-V2] Successfully left room with nodeId:', node.id);
        } catch (error) {
            console.error('[CHAT-V2] Failed to leave room:', error);
        } finally {
            setIsLeaving(false);
        }
    }, [node?.id, leaveRoom, isLeaving]);

    useEffect(() => {
        return () => {
            const cleanup = async () => {
                const currentNodeId = nodeIdRef.current;

                if (currentNodeId) {
                    try {
                        await leaveRoom(currentNodeId);
                        console.log('[CHAT-V2] Successfully left room with nodeId:', currentNodeId);
                    } catch (error) {
                        console.error('[CHAT-V2] Failed to leave room:', error);
                    }
                }
                if (wsService.current) {
                    console.log('[CHAT-V2] Cleanup: Disconnecting WebSocket');
                    wsService.current.disconnect();
                    wsService.current = null;
                }
            };
            cleanup();
        };
    }, [leaveRoom]);

    useEffect(() => {
        const leaveRoomBeacon = (nodeId: string) => {
            try {
                validateChatApiEndpoint();

                const url = `${CHAT_API_ENDPOINT}/public/leave-chat?nodeId=${encodeURIComponent(nodeId)}`;
                const payload = JSON.stringify({});

                try {
                    wsService.current?.disconnect?.();
                    wsService.current = null;
                } catch {
                    // Ignore disconnect errors
                }

                if (navigator.sendBeacon) {
                    const blob = new Blob([payload], { type: 'application/json' });
                    navigator.sendBeacon(url, blob);
                } else {
                    fetch(url, {
                        method: 'POST',
                        body: payload,
                        headers: { 'Content-Type': 'application/json' },
                        keepalive: true,
                    });
                }
            } catch (err) {
                console.error('[CHAT] leaveRoomBeacon failed', err);

                if (err instanceof EnvironmentVariableError) {
                    toast.error('Chat service configuration error. Unable to properly disconnect.');
                }
            }
        };

        const sendLeaveBeacon = () => {
            const currentNodeId = nodeIdRef.current;
            if (!currentNodeId) return;
            leaveRoomBeacon(currentNodeId);
        };

        const onBeforeUnload = (_e: BeforeUnloadEvent) => {
            sendLeaveBeacon();
        };
        const onPageHide = () => {
            sendLeaveBeacon();
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        window.addEventListener('pagehide', onPageHide);

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            window.removeEventListener('pagehide', onPageHide);
        };
    }, []);

    return {
        node,
        connectionStatus,
        messages,
        joinRoom,
        sendWebSocketMessage,
        leaveRoom: leaveRoomHandler,
        isConnected: connectionStatus === 'connected',
        isJoining,
        isLeaving,
        error,
    };
};
