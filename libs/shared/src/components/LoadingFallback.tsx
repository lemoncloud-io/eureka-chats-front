import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
    message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = '' }) => {
    return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/80" />
                <div className="space-y-2">
                    {message && <div className="text-lg font-semibold text-foreground">{message}</div>}
                </div>
            </div>
        </div>
    );
};
