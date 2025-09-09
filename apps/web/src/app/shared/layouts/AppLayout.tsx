import type { ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

/**
 * Main app layout component with centered container
 * Provides responsive design similar to Gangnam-unni app
 * @param {ReactNode} children - Child components to render within layout
 * @returns {JSX.Element} Centered layout container
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-800 px-0 md:px-4 lg:px-6 overflow-hidden">
            {/* Centered container with responsive width */}
            <div className="app-container">{children}</div>
        </div>
    );
};
