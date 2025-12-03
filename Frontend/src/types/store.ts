import type { Conversation, Message } from "./chat";
import type { User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;
    clearState: () => void;
    signUp: (
        username: string,
        password: string,
        firstName: string,
        lastName: string
    ) => Promise<void>;
    signIn: (
        username: string,
        password: string
    ) => Promise<void>;
    logOut: () => void;
    fetchMe: () => Promise<void>
}


export interface ThemeState {
    isDark: boolean
    toggleTheme: () => void
    setTheme: (dark: boolean) => void
}


export interface ChatState {
    conversations: Conversation[];
    messages: Record<
        string,
        {
            items: Message[]
            hasMore: boolean
            nextCursor?: string | null
        }
    >;
    activeConversationId: string | null
    loading: boolean
    reset: () => void
    setActiveConversation: (id: string | null) => void
    fetchConversation: () => Promise<void>

}