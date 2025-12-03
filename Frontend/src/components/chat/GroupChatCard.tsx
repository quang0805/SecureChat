import { useAuthStore } from "@/stores/useAuthStore"
import { useChatStore } from "@/stores/useChatStore"
import type { Conversation } from "@/types/chat"
import ChatCard from "./ChatCard"

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
    const user = useAuthStore((s) => s.user)
    const { activeConversationId, setActiveConversation, messages } = useChatStore()

    if (!user) return null;
    const otherUsers = convo.participants.find((p) => p.id !== user.id)
    if (!otherUsers) return null;
    const lastMessage = convo.last_message?.content ?? "";
    const handleSelectConversation = async (id: string) => {
        setActiveConversation(id)
        if (!messages[id]) {
            //TODO: CALL API
        }
    }

    return (
        <ChatCard
            convoId={convo.id}
            name={convo.name ?? " "}
            timestamp={
                convo.last_message?.created_at ? new Date(convo.last_message.created_at) : undefined
            }
            isActive={activeConversationId === convo.id}
            onSelect={handleSelectConversation}
            leftSection={
                <>
                    {/* todo: user avatar */}
                    {/* todo: status badge */}

                    {/* todo: unread count */}
                </>
            }
            subtitle={
                <p className="text-sm truncate text-muted-foreground"
                >{convo.participants.length} thành viên</p>
            }
        />
    )
}

export default GroupChatCard
