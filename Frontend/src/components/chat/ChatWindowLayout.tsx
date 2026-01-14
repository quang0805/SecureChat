import { useChatStore } from "@/stores/useChatStore"
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { AnimatePresence, motion } from "framer-motion";

const ChatWindowLayout = () => {
    const { activeConversationId, messages, messageLoading, conversations } = useChatStore()
    const selectedConvo = conversations.find((c) => c.id == activeConversationId) ?? null;
    if (!selectedConvo) {
        return <ChatWelcomeScreen />
    }
    return (
        <div className="relative h-full w-full overflow-hidden">
            <AnimatePresence mode="wait">
                {messageLoading ? (
                    // Khi isLoading = true, Skeleton
                    <ChatWindowSkeleton key="skeleton" />
                ) : (
                    // Khi isLoading = false, ChatContent
                    <motion.div
                        key="chat-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full w-full"
                    >
                        {/* GIAO DIỆN CHAT */}

                        < SidebarInset
                            className="bg-gray-400 flex flex-col h-full overflow-hidden flex-1 rounded-sm shadow-md"
                        >
                            {/* Header */}
                            < ChatWindowHeader />
                            {/* Body  */}
                            < div className="flex-1 overflow-y-auto bg-primary-foreground"
                            >
                                <ChatWindowBody />
                            </ div>
                            {/* Footer */}
                            < div >
                                <MessageInput />
                            </ div>
                        </SidebarInset >
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ChatWindowLayout
