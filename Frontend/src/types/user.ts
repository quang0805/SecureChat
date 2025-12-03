export interface User {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Friend {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
}

export interface FriendRequest {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
}

