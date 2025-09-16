import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowUp } from 'lucide-react';

import { SettingsControl } from '../../../shared/components/SettingsControl';

import type { NodeView } from '@lemoncloud/eureka-chats-api';

interface NicknameFormProps {
    onJoin: (nickname: string) => Promise<NodeView | undefined>;
    isJoining: boolean;
    error?: string;
}

/**
 * Nickname input form for joining chat room
 * Centered card layout with mobile-optimized input to prevent zoom
 * @param {NicknameFormProps} props - Component props
 * @param {Function} props.onJoin - Function to join chat room with nickname
 * @param {boolean} props.isJoining - Whether join operation is in progress
 * @returns {JSX.Element} Full-screen nickname input form
 */
export const NicknameForm = ({ onJoin, isJoining, error }: NicknameFormProps) => {
    const { t } = useTranslation();
    const [nickname, setNickname] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    /**
     * Handle form submission to join chat room
     */
    const handleSubmit = async () => {
        if (!nickname.trim()) return;
        await onJoin(nickname);
    };

    /**
     * Handle Enter key press to submit form
     * @param {React.KeyboardEvent} e - Keyboard event
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="w-full bg-background py-3 px-4 h-[52px] flex items-center justify-between">
                <div
                    className="text-[24px] inline-block"
                    style={{
                        fontFamily: 'Aldrich',
                        letterSpacing: '-1.68px',
                        background: 'linear-gradient(90deg, #0B1933 3.75%, #102F6B 46.88%, #3968C3 94.37%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Eureka Chats
                </div>
                <SettingsControl />
            </header>

            <div className="flex-1 flex items-start justify-center px-4 pt-16">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-medium text-foreground mb-2">{t('chat.nicknameForm.title')}</h2>
                        <p className="text-sm text-muted-foreground">{t('chat.nicknameForm.description')}</p>
                    </div>

                    <div
                        className={`bg-background rounded-2xl border p-4 shadow-sm ${
                            isFocused ? 'border-primary' : 'border-border'
                        }`}
                    >
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder={t('chat.nicknameForm.placeholder')}
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className={`flex-1 bg-background focus:outline-none text-base leading-6 text-foreground placeholder:text-muted-foreground transition-opacity ${
                                    isJoining ? 'opacity-50' : ''
                                }`}
                                style={{ fontSize: '16px' }}
                                disabled={isJoining}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isJoining || !nickname.trim()}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    nickname.trim() && !isJoining ? 'bg-primary' : 'bg-muted'
                                }`}
                            >
                                {isJoining ? (
                                    <div className="w-4 h-4 border-2 border-muted-foreground/50 border-t-foreground rounded-full animate-spin" />
                                ) : (
                                    <ArrowUp
                                        size={16}
                                        className={
                                            nickname.trim() ? 'text-primary-foreground' : 'text-muted-foreground'
                                        }
                                    />
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
