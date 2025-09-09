import { create } from 'zustand';

import { updateProfile } from '../api';
import { LANGUAGE_KEY, webCore } from '../core';

export interface UserProfile {
    sid: string;
    uid: string;
    gid: string | null;
    roles: string[];
    identityId: string;
    $site: {
        id: string;
        createdAt: number;
        updatedAt: number;
        deletedAt: number;
        name: string;
        stereo: string;
        domain: string;
        ownerId: string;
        owner$: {
            id: string;
            name: string;
        };
    };
    $user: {
        id: string;
        createdAt: number;
        updatedAt: number;
        deletedAt: number;
        accountId: string;
        email: string;
        name: string;
        nick: string;
        siteId: string;
        site$: {
            id: string;
            name: string;
        };
        account$: {
            id: string;
            stereo: string;
            name: string;
        };
    };
    $auth: {
        id: string;
        createdAt: number;
        updatedAt: number;
        deletedAt: number;
        accountId: string;
        userId: string;
        siteId: string;
    };
    $role: {
        id: string;
        createdAt: number;
        updatedAt: number;
        deletedAt: number;
        stereo: string;
        siteId: string;
        userId: string;
        role: string;
    };
}

export type UserView = Partial<UserProfile>;

export interface WebCoreState {
    isInitialized: boolean;
    isAuthenticated: boolean;
    error: Error | null;
    profile: UserProfile | null;
    userName: string;
}

export interface WebCoreStore extends WebCoreState {
    initialize: () => void;
    logout: () => Promise<void>;
    setIsAuthenticated: (isAuth: boolean) => void;
    setProfile: (profile: UserProfile) => void;
    updateProfile: (user: UserView) => Promise<void>;
}

/**
 * Initial state configuration for the web core store
 */
const initialState: Pick<WebCoreStore, keyof WebCoreState> = {
    isInitialized: false,
    isAuthenticated: false,
    error: null,
    profile: null,
    userName: '',
};

/**
 * Zustand store for managing web core state and actions
 */
export const useWebCoreStore = create<WebCoreStore>()(set => ({
    ...initialState,

    /**
     * Initializes the web core application
     * - Sets up authentication state
     * - Configures language preferences
     * - Handles initialization errors
     */
    initialize: async () => {
        set({ isInitialized: false, error: null });
        await webCore.init();
        await webCore.setUseXLemonLanguage(true, LANGUAGE_KEY);
        const isAuthenticated = await webCore.isAuthenticated();
        set({ isInitialized: true, isAuthenticated });
    },

    /**
     * Handles user logout
     * - Clears authentication state
     * - Removes user profile data
     * - Redirects to login page
     */
    logout: async () => {
        await webCore.logout();
        set({ isAuthenticated: false, profile: null, userName: '' });
        window.location.href = '/';
    },

    /**
     * Updates authentication state
     * @param isAuthenticated - New authentication state
     */
    setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

    /**
     * Updates user profile information
     * @param profile - User profile data
     */
    setProfile: (profile: UserProfile) =>
        set({
            profile,
            userName: profile.$user?.name || 'Unknown',
        }),

    /**
     * Updates username and related profile information
     * @param user - Updated user view data
     */
    updateProfile: async (user: UserView) => {
        const updated = await updateProfile(user);
        // TODO: set updated profile
        // set(state => {
        //     const profile = { ...state.profile, $user: user };
        //     const userName = user.$user?.name;
        //     return { ...state, profile, userName };
        // });
    },
}));
