import { useCallback, useState } from 'react';

import { useSendMessage } from '@lemon/chats';

export const useChatMessage = (nodeId: string | undefined, roomId: string | undefined) => {
    const { mutateAsync: sendMessage, isPending } = useSendMessage();
    const [pendingMessage, setPendingMessage] = useState<string>('');

    const sendHttpMessage = useCallback(
        async (text: string) => {
            if (!nodeId || !roomId) return;

            setPendingMessage(text);

            try {
                const result = await sendMessage({
                    nodeId,
                    roomId,
                    message: text,
                });
                return result;
            } finally {
                setPendingMessage('');
            }
        },
        [nodeId, roomId, sendMessage]
    );

    return {
        sendHttpMessage,
        isSending: isPending,
        pendingMessage: isPending ? pendingMessage : '',
    };
};
