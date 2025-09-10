import { CHAT_API_ENDPOINT, webCore } from '@lemon/web-core';

import type {
    ChatBody,
    ChatView,
    NodeBody,
    NodeView,
    RoomBody,
    RoomView,
    UserTokenView,
} from '@lemoncloud/eureka-chats-api';

export const createRoom = async (body: RoomBody) => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHAT_API_ENDPOINT}/rooms/0`,
        })
        .setBody(body)
        .execute<RoomView>();

    return data;
};

export const fetchRoom = async (roomId: string) => {
    const { data } = await webCore
        .buildRequest({
            method: 'GET',
            baseURL: `${CHAT_API_ENDPOINT}/public/room-detail`,
        })
        .setParams({ roomId })
        .execute<RoomView>();

    return data;
};

export const enterRoom = async (body: NodeBody) => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHAT_API_ENDPOINT}/public/start-chat?token`,
        })
        .setBody(body)
        .execute<UserTokenView>();

    return data;
};

export const sendMessage = async (body: ChatBody) => {
    const { data } = await webCore
        .buildSignedRequest({
            method: 'POST',
            baseURL: `${CHAT_API_ENDPOINT}/public/send-message`,
        })
        .setBody(body)
        .execute<ChatView>();

    return data;
};

export const leaveRoom = async (nodeId: string) => {
    const { data } = await webCore
        .buildRequest({
            method: 'POST',
            baseURL: `${CHAT_API_ENDPOINT}/public/leave-chat`,
        })
        .setBody({})
        .setParams({ nodeId })
        .execute<NodeView>();

    return data;
};

export const updateNode = async (nodeId: string, connectionId: string) => {
    const { data } = await webCore
        .buildRequest({
            method: 'POST',
            baseURL: `${CHAT_API_ENDPOINT}/public/update-node`,
        })
        .setParams({ nodeId })
        .setBody({ connectionId })
        .execute<NodeView>();

    return data;
};
