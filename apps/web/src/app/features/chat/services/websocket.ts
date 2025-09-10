import { SOCKET_ENDPOINT } from '@lemon/web-core';

import type { SocketPayload, SocketResponse } from '@lemoncloud/eureka-sockets-api';

export class ChatWebSocketServiceV2 {
    private ws: WebSocket | null = null;
    private channelId = '';
    private token = '';
    private connectionId = '';
    private messageCallback: ((response: SocketResponse) => void) | null = null;
    private connectionCallback:
        | ((status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting') => void)
        | null = null;
    private connectionIdCallback: ((connectionId: string) => void) | null = null;
    private pingInterval: NodeJS.Timeout | null = null;
    private isManualDisconnect = false;

    connect(channelId: string, identityToken?: string) {
        this.channelId = channelId;
        const wsUrl = `${SOCKET_ENDPOINT}?channels=${channelId}&x-lemon-identity=${identityToken || ''}`;
        console.log(wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('[WEBSOCKET-V2] Connected');
            this.connectionCallback?.('connected');
            this.isManualDisconnect = false;
            this.requestConnectionId();
            this.startPingPong();
        };

        this.ws.onmessage = event => {
            const response: SocketResponse = JSON.parse(event.data);

            if (response.action === 'info' && response.data?.connectionId) {
                this.connectionId = response.data.connectionId;
                this.connectionIdCallback?.(this.connectionId);
            } else if (response.action === 'message') {
                this.messageCallback?.(response);
            } else if (response.action === 'ping') {
                this.sendMessage({ action: 'pong', data: { timestamp: Date.now() } });
            }
        };

        this.ws.onclose = () => {
            this.connectionCallback?.('disconnected');
            this.stopPingPong();
        };

        this.ws.onerror = () => {
            this.connectionCallback?.('error');
        };
    }

    sendChatMessage(text: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        this.sendMessage({
            action: 'message',
            data: { text, sender: 'user', timestamp: Date.now() },
        });
    }

    private sendMessage(payload: SocketPayload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }

    private requestConnectionId() {
        this.sendMessage({ action: 'info', data: { type: 'info' } });
    }

    private startPingPong() {
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.sendMessage({ action: 'ping', data: { timestamp: Date.now() } });
            }
        }, 180000);
    }

    private stopPingPong() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    onMessage(callback: (response: SocketResponse) => void) {
        this.messageCallback = callback;
    }

    onConnectionStatus(
        callback: (status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting') => void
    ) {
        this.connectionCallback = callback;
    }

    onConnectionId(callback: (connectionId: string) => void) {
        this.connectionIdCallback = callback;
    }

    getConnectionId(): string {
        return this.connectionId;
    }

    disconnect() {
        this.isManualDisconnect = true;
        this.stopPingPong();
        this.connectionId = '';
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
