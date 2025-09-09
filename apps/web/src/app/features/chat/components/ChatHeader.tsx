import { useTranslation } from 'react-i18next';

import { AlertCircle, ChevronLeft, RotateCcw, Wifi, WifiOff } from 'lucide-react';

import { SettingsControl } from '../../../shared/components/SettingsControl';

interface ChatHeaderProps {
    nickname: string;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
    onLeave: () => void;
    isLeaving: boolean;
    canLeave: boolean;
}

/**
 * Enhanced chat room header with connection status, leave functionality, and theme settings
 * Features modern design, smooth animations, and integrated settings control
 * @param {ChatHeaderProps} props - Component props
 * @param {string} props.nickname - Current user's nickname
 * @param {string} props.connectionStatus - WebSocket connection status
 * @param {Function} props.onLeave - Function to leave chat room
 * @param {boolean} props.isLeaving - Whether leave operation is in progress
 * @param {boolean} props.canLeave - Whether user can leave the room
 * @returns {JSX.Element} Enhanced fixed header with modern styling and controls
 */
export const ChatHeader = ({ nickname, connectionStatus, onLeave, isLeaving, canLeave }: ChatHeaderProps) => {
    const { t } = useTranslation();
    /**
     * Get status indicator styling based on connection state
     * @returns {object} Status styling with color, icon, and animation classes
     */
    const getStatusInfo = () => {
        switch (connectionStatus) {
            case 'connected':
                return {
                    color: 'bg-emerald-500',
                    icon: Wifi,
                    text: 'connected',
                    iconClass: 'text-emerald-600',
                    animation: '',
                };
            case 'connecting':
                return {
                    color: 'bg-amber-500',
                    icon: RotateCcw,
                    text: 'connecting',
                    iconClass: 'text-amber-600',
                    animation: 'animate-spin',
                };
            case 'reconnecting':
                return {
                    color: 'bg-amber-500',
                    icon: RotateCcw,
                    text: 'reconnecting',
                    iconClass: 'text-amber-600',
                    animation: 'animate-spin',
                };
            case 'error':
                return {
                    color: 'bg-red-500',
                    icon: AlertCircle,
                    text: 'error',
                    iconClass: 'text-red-600',
                    animation: '',
                };
            default:
                return {
                    color: 'bg-red-500',
                    icon: WifiOff,
                    text: 'disconnected',
                    iconClass: 'text-red-600',
                    animation: '',
                };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    /**
     * Handle back arrow click to leave room
     */
    const handleArrowClick = () => {
        if (canLeave) {
            onLeave();
        }
    };

    return (
        <header className="h-14 sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 flex items-center justify-between gap-3 px-4 transition-all duration-200">
            {/* Left Section - Back Button */}
            <div className="flex items-center">
                <button
                    onClick={handleArrowClick}
                    disabled={isLeaving}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    aria-label="Leave chat room"
                >
                    <ChevronLeft
                        className={`w-5 h-5 text-foreground transition-transform group-hover:-translate-x-0.5 ${
                            isLeaving ? 'animate-pulse' : ''
                        }`}
                    />
                </button>
            </div>

            {/* Center Section - Room Info */}
            <div className="flex-1 min-w-0 flex flex-col items-center">
                <div className="flex items-center gap-2">
                    <h1 className="font-semibold text-foreground">{t('chat.roomTitle')}</h1>
                    <StatusIcon
                        className={`w-4 h-4 ${statusInfo.iconClass} ${statusInfo.animation} transition-all duration-200`}
                    />
                </div>
                <div className="text-sm text-muted-foreground">{nickname}</div>
            </div>

            {/* Right Section - Settings */}
            <div className="flex items-center">
                <SettingsControl className="relative" />
            </div>
        </header>
    );
};
