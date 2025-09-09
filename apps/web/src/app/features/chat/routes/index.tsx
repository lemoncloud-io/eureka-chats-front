import { Navigate, Route, Routes } from 'react-router-dom';

import { ChatPage } from '../pages';

export const ChatRoutes = () => {
    return (
        <Routes>
            <Route index element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
