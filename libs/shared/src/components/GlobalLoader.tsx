import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Loader2 } from 'lucide-react';

import { useGlobalLoader } from '../hooks';

export const GlobalLoader: React.FC = () => {
    const { isLoading } = useGlobalLoader();

    useEffect(() => {
        if (isLoading) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isLoading]);

    if (!isLoading) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="glass-strong p-6 rounded-xl shadow-lg">
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-foreground/80" />
                    <div className="text-sm font-medium text-foreground/90">Loading...</div>
                </div>
            </div>
        </div>,
        document.body
    );
};
