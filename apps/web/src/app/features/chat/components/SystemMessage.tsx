interface SystemMessageProps {
    message: string;
}

/**
 * System message component for displaying join/leave notifications
 * @param {SystemMessageProps} props - Component props
 * @param {string} props.message - System message content
 * @returns {JSX.Element} Centered system message
 */
export const SystemMessage = ({ message }: SystemMessageProps) => {
    return (
        <div className="flex justify-center my-[9px]">
            <div className="inline-flex py-1 px-2 bg-muted-foreground rounded-[7px] text-primary-foreground text-[13px] font-medium">
                {message}
            </div>
        </div>
    );
};
