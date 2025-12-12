import type { User } from "./user";

export interface Participant {
    id: string;
    avatar_url?: string | null;
    username: string;
    display_name: string;
    // avatarUrl?: string | null;
    // joinedAt: string;
    created_at: string;
    updated_at?: string | null;
}

export interface SeenUser {
    _id: string;
    displayName?: string;
    avatarUrl?: string | null;
}

export interface Group {
    name: string;
    createdBy: string;
}

export interface LastMessage {
    _id: string;
    content: string;
    createdAt: string;
    sender: {
        _id: string;
        displayName: string;
        avatarUrl?: string | null;
    };
}

export interface Conversation {
    id: string;
    type: "private" | "group";
    avatar_url: string | null;
    creator_id: string
    participants: Participant[];
    last_message: Message | null;
    name: string;
    // seenBy: SeenUser[];
    // lastMessage: LastMessage | null
    // unreadCounts: Record<string, number>; // key = userId, value = unread count
    // createdAt: string;
    // updatedAt: string;
}

export interface ConversationResponse {
    conversations: Conversation[];
}

export interface Message {
    id: string;
    content: string;
    content_type: string;
    conversation_id: string;
    sender_id: string;
    sender: User;
    created_at: string;
}
