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
        Message[]
    >;
    activeConversationId: string | null
    loading: boolean
    messageLoading: boolean
    reset: () => void
    setActiveConversationId: (id: string | null) => void
    fetchConversation: () => Promise<void>
    fetchMessages: (id: string) => Promise<void>
    sendMessage: (conversationId: string, content: string) => Promise<void>
}