import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryKeys, useCustomMutation } from '@lemon/shared';
import { EnvironmentVariableError } from '@lemon/web-core';

import { createRoom, enterRoom, fetchRoom, leaveRoom, sendMessage, updateNode } from '../apis';

import type {
    ChatBody,
    ChatView,
    NodeBody,
    NodeView,
    RoomBody,
    RoomView,
    UserTokenView,
} from '@lemoncloud/eureka-chats-api';
import type { AxiosError } from 'axios';

export const roomKeys = createQueryKeys('room');

export type ServerError = AxiosError<string>;

const handleChatError = (error: unknown) => {
    if (error instanceof EnvironmentVariableError) {
        toast.error('Chat service configuration error. Please check your environment settings.');
    } else if (error && typeof error === 'object' && 'response' in error) {
        const serverError = error as ServerError;
        toast.error(serverError.response?.data ?? 'An unknown error occurred');
    } else {
        toast.error('An unexpected error occurred. Please try again.');
    }
};

export const useCreateRoom = () => {
    return useCustomMutation<RoomView, ServerError, RoomBody>(
        (body: RoomBody) => {
            return createRoom(body);
        },
        {
            onError: handleChatError,
        }
    );
};

export const useEnterRoom = () => {
    return useCustomMutation<UserTokenView, ServerError, NodeBody>(
        (body: NodeBody) => {
            return enterRoom(body);
        },
        {
            onError: handleChatError,
        }
    );
};

export const useSendMessage = () => {
    return useCustomMutation<ChatView, ServerError, ChatBody>(
        (body: ChatBody) => {
            return sendMessage(body);
        },
        {
            onError: handleChatError,
        }
    );
};

export const useLeaveRoom = () => {
    return useCustomMutation<NodeView, ServerError, string>(
        (nodeId: string) => {
            return leaveRoom(nodeId);
        },
        {
            onError: handleChatError,
        }
    );
};

export const useRoom = (roomId: string) => {
    return useQuery({
        queryKey: roomKeys.detail(roomId),
        queryFn: () => fetchRoom(roomId),
        enabled: !!roomId,
        refetchOnMount: 'always',
    });
};

export const useUpdateNode = () => {
    return useCustomMutation<NodeView, ServerError, { nodeId: string; connectionId: string }>(
        ({ nodeId, connectionId }: { nodeId: string; connectionId: string }) => {
            return updateNode(nodeId, connectionId);
        },
        {
            onError: handleChatError,
        }
    );
};
