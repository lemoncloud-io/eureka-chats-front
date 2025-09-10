import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryKeys, useCustomMutation } from '@lemon/shared';

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

export const useCreateRoom = () => {
    return useCustomMutation<RoomView, ServerError, RoomBody>(
        (body: RoomBody) => {
            return createRoom(body);
        },
        {
            onError: error => {
                toast.error(error.response?.data ?? 'An unknown error occurred');
            },
        }
    );
};

export const useEnterRoom = () => {
    return useCustomMutation<UserTokenView, ServerError, NodeBody>(
        (body: NodeBody) => {
            return enterRoom(body);
        },
        {
            onError: error => {
                toast.error(error.response?.data ?? 'An unknown error occurred');
            },
        }
    );
};

export const useSendMessage = () => {
    return useCustomMutation<ChatView, ServerError, ChatBody>(
        (body: ChatBody) => {
            return sendMessage(body);
        },
        {
            onError: error => {
                toast.error(error.response?.data ?? 'An unknown error occurred');
            },
        }
    );
};

export const useLeaveRoom = () => {
    return useCustomMutation<NodeView, ServerError, string>(
        (nodeId: string) => {
            return leaveRoom(nodeId);
        },
        {
            onError: error => {
                toast.error(error.response?.data ?? 'An unknown error occurred');
            },
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
            onError: error => {
                toast.error(error.response?.data ?? 'An unknown error occurred');
            },
        }
    );
};
