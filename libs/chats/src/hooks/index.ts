import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createQueryKeys, useCustomMutation } from '@lemon/shared';

import { createRoom, enterRoom, fetchRoom, leaveRoom, sendMessage, updateNode } from '../apis';

import type { ChatBody, NodeBody, RoomBody } from '@lemoncloud/eureka-chats-api';

export const roomKeys = createQueryKeys('room');

export const useCreateRoom = () => {
    return useCustomMutation(
        (body: RoomBody) => {
            return createRoom(body);
        },
        {
            onError: error => {
                toast(error instanceof Error ? error.message : 'An unknown error occurred');
            },
        }
    );
};

export const useEnterRoom = () => {
    return useCustomMutation(
        (body: NodeBody) => {
            return enterRoom(body);
        },
        {
            onError: error => {
                toast(error instanceof Error ? error.message : 'An unknown error occurred');
            },
        }
    );
};

export const useSendMessage = () => {
    return useCustomMutation(
        (body: ChatBody) => {
            return sendMessage(body);
        },
        {
            onError: error => {
                toast(error instanceof Error ? error.message : 'An unknown error occurred');
            },
        }
    );
};

export const useLeaveRoom = () => {
    return useCustomMutation(
        (nodeId: string) => {
            return leaveRoom(nodeId);
        },
        {
            onError: error => {
                toast(error instanceof Error ? error.message : 'An unknown error occurred');
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
    return useCustomMutation(
        ({ nodeId, connectionId }: { nodeId: string; connectionId: string }) => {
            return updateNode(nodeId, connectionId);
        },
        {
            onError: error => {
                toast(error instanceof Error ? error.message : 'An unknown error occurred');
            },
        }
    );
};
