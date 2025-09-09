import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { ChatRoutes } from '../features/chat';

const router = createBrowserRouter([
    {
        path: '/*',
        element: <ChatRoutes />,
    },
]);

export const Router = () => {
    return <RouterProvider router={router} />;
};
