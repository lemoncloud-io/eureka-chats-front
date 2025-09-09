import { useTranslation } from 'react-i18next';

interface ChatMessageProps {
    message: string;
    timestamp?: string;
    isMyMessage: boolean;
    authorNickname: string;
}

/**
 * Format timestamp to localized time string
 * @param {string} [timestamp] - ISO timestamp string
 * @param {string} locale - Locale string (e.g., 'ko-KR', 'en-US')
 * @param {string} justNowText - Localized "just now" text
 * @returns {string} Formatted time string or localized "just now" if no timestamp
 */
const formatTimestamp = (timestamp?: string, locale = 'ko-KR', justNowText = 'Just now'): string => {
    if (!timestamp) return justNowText;
    return new Date(timestamp).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Chat message bubble component with different styling for own vs others' messages
 * @param {ChatMessageProps} props - Component props
 * @param {string} props.message - Message content
 * @param {string} [props.timestamp] - Message timestamp
 * @param {boolean} props.isMyMessage - Whether message is from current user
 * @param {string} props.authorNickname - Author's nickname
 * @returns {JSX.Element} Chat message bubble
 */
export const ChatMessage = ({ message, timestamp, isMyMessage, authorNickname }: ChatMessageProps) => {
    const { t, i18n } = useTranslation();

    // Get the appropriate locale for time formatting
    const timeLocale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
    const formattedTime = formatTimestamp(timestamp, timeLocale, t('chat.justNow'));

    if (isMyMessage) {
        return (
            <div className="w-full flex items-end justify-end gap-[6px] py-[6px]">
                <div className="text-[11px] text-muted-foreground">{formattedTime}</div>
                <div className="max-w-[70%] py-[6px] px-3 rounded-xl bg-primary text-primary-foreground text-sm break-words whitespace-pre-wrap">
                    {message}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[6px]">
            <div className="shrink-0 flex items-center gap-[6px]">
                <div className="w-6 h-6 bg-muted-foreground rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">
                        {authorNickname?.charAt(0) || 'U'}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">{authorNickname}</div>
            </div>
            <div className="w-full flex items-end gap-[6px] py-[6px]">
                <div className="max-w-[70%] py-[6px] px-3 rounded-xl bg-muted text-foreground text-sm break-words whitespace-pre-wrap">
                    {message}
                </div>
                <div className="text-[11px] text-muted-foreground">{formattedTime}</div>
            </div>
        </div>
    );
};
