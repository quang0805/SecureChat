import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { useAuthStore } from "@/stores/useAuthStore";

interface MessageItemProps {
    message: Message;
    index: number;
    messages: Message[];
    selectedConvo: Conversation;
    lastMessageStatus: "delivered" | "seen"
}

const MessageItem = ({ message, index, messages, selectedConvo, lastMessageStatus }: MessageItemProps) => {

    const user = useAuthStore((s) => s.user)
    const isOwn = user?.id === message.sender_id ? true : false
    // const nextMsg = messages[index + 1];
    const prev = messages[index - 1];
    let isGroupBreak = (!prev) ||
        message.sender_id !== prev?.sender_id ||
        (new Date(prev.created_at).getTime() - new Date(message?.created_at).getTime()) > 30000000;

    // isGroupBreak = false;
    const participant = selectedConvo.participants.find((p) => p.id === message.sender_id)
    return (
        <div
            className={cn(
                "flex gap-2 message-bounce",
                isOwn ? "justify-end" : "justify-start"
            )}
        >
            {/* avatar  */}
            {!isOwn && (
                <div className="w-8">
                    {
                        isGroupBreak && (
                            <UserAvatar
                                type="chat"
                                name={participant?.display_name ?? ""}
                                avatarUrl={participant?.avatar_url ?? undefined}
                            />
                        )
                    }

                </div>
            )}
            {/* Tin nhan */}
            <div className={cn("max-w-xs lg:max-w-md space-y-1 flex flex-col mx-5",
                isOwn ? "items-end" : "items-start"
            )}
            >
                <Card
                    className={cn(
                        "p-3 mb-0.5",
                        isOwn ? "bg-chat-bubble-sent border-0" : "bg-chat-bubble-received"
                    )}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {message.content}
                    </p>
                </Card>

                {/* times */}
                {
                    isGroupBreak && (
                        <span className="text-xs text-muted-foreground px-1 mb-3">
                            {formatMessageTime(new Date(message.created_at))}
                        </span>
                    )
                }
                {/* seen */}

            </div>
        </div >
    )
}

export default MessageItem
