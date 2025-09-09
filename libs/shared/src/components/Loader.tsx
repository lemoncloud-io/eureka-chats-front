import { Loader2 } from 'lucide-react';

import { cn } from '@lemon/ui-kit';

const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
};

interface LoaderProps {
    size?: keyof typeof sizes;
    message?: string;
    className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'sm', message = '', className = '' }) => {
    return (
        <div className={cn('flex items-center space-x-3', className)}>
            <Loader2 className={cn('animate-spin text-foreground/80 dark:text-foreground/90', sizes[size])} />
            {message && <span className="text-sm font-medium text-foreground/90">{message}</span>}
        </div>
    );
};
