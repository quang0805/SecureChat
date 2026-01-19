// src/types/store.ts
import type { Conversation, Message, RatchetState } from "./chat";
import type { User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    // --- CÁC KHÓA DÀNH CHO DOUBLE RATCHET ---
    // Khóa định danh bí mật của thiết bị (ECDH Private Key)
    identityPrivateKey: CryptoKey | null;
    // Khóa Master (tạo từ mật khẩu) dùng để giải mã các Ratchet State từ Database
    tempMasterKey: CryptoKey | null;

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
    fetchMe: () => Promise<void>;
    updateDisplayName: (newName: string) => Promise<void>;
    updateAvatar: (url: string) => Promise<void>;
}

export interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

export interface ChatState {
    conversations: Conversation[];
    messages: Record<string, Message[]>;

    // Quản lý bánh răng của từng phòng chat: { [conversationId]: RatchetState }
    ratchetMap: Record<string, RatchetState>;

    activeConversationId: string | null;
    loading: boolean;
    messageLoading: boolean;
    onlineUserIds: string[];

    reset: () => void;
    setActiveConversationId: (id: string | null) => void;

    // --- CHAT ACTIONS (Tất cả đều là Async để giải mã) ---
    fetchConversation: () => Promise<void>;
    fetchMessages: (id: string) => Promise<void>;

    /**
     * Gửi tin nhắn: Xoay bánh răng gửi -> Mã hóa -> Sync State lên Server
     */
    sendMessage: (conversationId: string, content: string, contentType?: string) => Promise<void>;

    /**
     * Nhận tin nhắn từ Socket: DH Ratchet -> Symmetric Ratchet -> Giải mã -> Sync State
     */
    handleIncomingMessage: (message: Message) => Promise<void>;

    handleIncomingNewConversation: (newConvo: Conversation) => void;
    handleUserStatusChange: (userId: string, status: 'online' | 'offline') => void;
    updateLastMessage: (message: Message) => void;
    setOnlineUsers: (ids: string[]) => void;
    fetchUsersOnline: () => Promise<void>;
    searchUsers: (query: string) => Promise<User[]>;

    /**
     * Bắt đầu chat với User mới: Thực hiện Handshake để tạo bí mật gốc (Initial Root Key)
     */
    startConversation: (targetUser: User) => Promise<void>;

    // --- DOUBLE RATCHET SPECIFIC ACTIONS ---
    /**
     * Khởi tạo bánh răng lần đầu tiên giữa 2 người
     */
    initializeRatchet: (convoId: string, targetUser: User) => Promise<void>;

    /**
     * Tải bánh răng đã mã hóa từ Server về và giải mã bằng tempMasterKey
     */
    loadRatchetState: (convoId: string) => Promise<void>;

    /**
     * Mã hóa bánh răng hiện tại và gửi lên PostgreSQL để đồng bộ
     */
    syncRatchetState: (convoId: string) => Promise<void>;
}