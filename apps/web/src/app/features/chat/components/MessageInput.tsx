import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowUp } from 'lucide-react';

import type { ChatView } from '@lemoncloud/eureka-chats-api';

interface MessageInputProps {
    onSendMessage: (message: string) => Promise<ChatView | undefined>;
    isSending: boolean;
    isDisabled?: boolean;
}

/**
 * Message input component with auto-resize textarea and send functionality
 * @param {MessageInputProps} props - Component props
 * @param {Function} props.onSendMessage - Function to send message
 * @param {boolean} props.isSending - Whether message is currently being sent
 * @param {boolean} props.isDisabled - Whether the input should be disabled
 * @returns {JSX.Element} Fixed bottom message input with textarea
 */
export const MessageInput = ({ onSendMessage, isSending, isDisabled = false }: MessageInputProps) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    /**
     * Handle message sending and reset input
     */
    const handleSend = async () => {
        if (!message.trim() || isDisabled) return;
        await onSendMessage(message);
        setMessage('');
        // Reset textarea height and maintain focus after sending message
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = '48px'; // Reset to min-height
                inputRef.current.focus();
            }
        }, 0);
    };

    /**
     * Handle Enter key press to send message
     * @param {React.KeyboardEvent} e - Keyboard event
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const isButtonDisabled = isSending || !message.trim() || isDisabled;

    return (
        <div className="bg-background flex flex-col gap-2 mt-[10px] rounded-t-2xl border-t border-primary py-[10px] px-4">
            {isDisabled && (
                <div className="text-sm text-muted-foreground text-center">{t('chat.disconnectedMessage')}</div>
            )}
            <div className="flex gap-3">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={e => {
                        setMessage(e.target.value);
                        // Auto-resize
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chat.messageInputPlaceholder')}
                    className={`flex-1 bg-background focus:outline-none text-base leading-6 text-foreground placeholder:text-muted-foreground transition-opacity resize-none min-h-[48px] max-h-[120px] ${
                        isSending || isDisabled ? 'opacity-50' : ''
                    }`}
                    style={{ fontSize: '16px' }}
                    rows={1}
                    disabled={isSending || isDisabled}
                />
                <button
                    onClick={handleSend}
                    disabled={isButtonDisabled}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        message.trim() && !isSending && !isDisabled ? 'bg-primary' : 'bg-muted'
                    }`}
                >
                    {isSending ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/50 border-t-foreground rounded-full animate-spin" />
                    ) : (
                        <ArrowUp
                            size={16}
                            className={message.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}
                        />
                    )}
                </button>
            </div>
        </div>
    );
};
