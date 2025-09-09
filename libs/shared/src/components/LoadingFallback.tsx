import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
    message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = '' }) => {
    return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
                <Loader2 className="h-12 w-12 animate-spin text-foreground/80 mx-auto" />
                <div className="space-y-2">
                    {message && <div className="text-lg font-semibold text-foreground">{message}</div>}
                    <div className="text-sm text-muted-foreground">Please wait a moment...</div>
                </div>
            </div>
        </div>
    );
};
