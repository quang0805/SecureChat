import { useChatStore } from "@/stores/useChatStore"
import MessageItem from "./MessageItem";
import { useEffect, useMemo, useRef } from "react";

const ChatWindowBody = () => {
    const activeConversationId = useChatStore((s) => s.activeConversationId);
    const conversations = useChatStore((s) => s.conversations);
    const allMessages = useChatStore((s) => s.messages);
    const fetchMessages = useChatStore((s) => s.fetchMessages);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId);

        }
    }, [activeConversationId])

    const messages = useMemo(() => {
        if (!activeConversationId) return [];
        return allMessages[activeConversationId] ?? [];
    }, [allMessages, activeConversationId]);

    const selectedConvo = conversations.find((c) => c.id == activeConversationId);
    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);
    if (!selectedConvo) return;
    if (!messages?.length) {
        return <div className="flex h-full justify-center items-center text-muted-foreground">
            Đoạn chat chưa có tin nhắn nào!
        </div>
    }
    return (
        <div className="p-5 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div className="mx-10 p-5 flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar">
                {reversedMessages.map((message, index) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        index={index}
                        messages={reversedMessages}
                        selectedConvo={selectedConvo}
                        lastMessageStatus="seen"
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div >
    )
}

export default ChatWindowBody
