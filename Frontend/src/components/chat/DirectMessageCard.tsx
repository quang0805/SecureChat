import type { Conversation } from '@/types/chat'
import ChatCard from './ChatCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
    const user = useAuthStore((s) => s.user)
    const { activeConversationId, setActiveConversationId, onlineUserIds } = useChatStore()
    const lastMessage = convo.last_message?.content_type === "text" ? convo.last_message?.content ?? "" :
        convo.last_message?.content_type === "image" ? "Hình ảnh" : ""
    const handleSelectConversation = async (id: string) => {
        setActiveConversationId(id);
    }
    if (!user) return null;
    const otherUser = convo.participants.find((p) => p.id !== user.id);
    if (!otherUser) return null;
    const isOnline = onlineUserIds.includes(otherUser.id);

    return (
        <ChatCard
            convoId={convo.id}
            name={otherUser.display_name ?? ""}
            timestamp={
                convo.last_message?.created_at ? new Date(convo.last_message.created_at) : undefined
            }
            isActive={activeConversationId === convo.id}
            onSelect={() => handleSelectConversation(convo.id)}
            leftSection={
                <>
                    <UserAvatar
                        type='sidebar'
                        name={otherUser.display_name ?? ""}
                        avatarUrl={otherUser.avatar_url ?? undefined}
                    />
                    {/* Todo: Websocket */}
                    <StatusBadge status={isOnline ? "online" : "offline"} />
                </>
            }
            subtitle={
                <p
                    className='text-sm truncate font-medium text-foreground'
                >
                    {lastMessage}
                </p>
            }
        />
    )
}
export default DirectMessageCard
