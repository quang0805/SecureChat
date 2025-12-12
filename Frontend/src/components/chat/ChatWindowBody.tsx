import { useChatStore } from "@/stores/useChatStore"
import MessageItem from "./MessageItem";

const ChatWindowBody = () => {
    const {
        activeConversationId,
        conversations,
        messages: allMessages
    } = useChatStore();

    const messages = allMessages[activeConversationId!] ?? [];
    const selectedConvo = conversations.find((c) => c.id == activeConversationId);
    if (!selectedConvo) return;
    if (!messages?.length) {
        return <div className="flex h-full justify-center items-center text-muted-foreground">
            Đoạn chat chưa có tin nhắn nào!
        </div>
    }
    console.log(messages)
    return (
        <div className="p-5 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div className="mx-10 p-5 flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
                {messages.map((message, index) => (
                    <MessageItem
                        message={message}
                        index={index}
                        messages={messages}
                        selectedConvo={selectedConvo}
                        lastMessageStatus="seen"
                    />
                ))}
            </div>
        </div >
    )
}

export default ChatWindowBody
