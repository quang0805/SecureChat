import { useChatStore } from "@/stores/useChatStore"
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
    const { activeConversationId, messages, messageLoading: loading, conversations } = useChatStore()
    const selectedConvo = conversations.find((c) => c.id == activeConversationId) ?? null;
    if (!selectedConvo) {
        return <ChatWelcomeScreen />
    }
    if (loading) {
        return <ChatWindowSkeleton />
    }
    return (
        <SidebarInset
            className="bg-gray-400 flex flex-col h-full overflow-hidden flex-1 rounded-sm shadow-md"
        >
            {/* Header */}
            <ChatWindowHeader />
            {/* Body  */}
            <div className="flex-1 overflow-y-auto bg-primary-foreground"
            >
                <ChatWindowBody />
            </div>
            {/* Footer */}
            <div>
                <MessageInput />
            </div>
        </SidebarInset>
    )
}

export default ChatWindowLayout
