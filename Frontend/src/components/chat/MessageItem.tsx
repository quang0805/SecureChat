import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";


interface MessageItemProps {
    message: Message;
    index: number;
    messages: Message[];
    selectedConvo: Conversation;
    // lastMessageStatus: "delivered" | "seen"
}

const MessageItem = ({ message, index, messages, selectedConvo }: MessageItemProps) => {

    const user = useAuthStore((s) => s.user)
    const isOwn = user?.id === message.sender_id ? true : false
    const prev = messages[index - 1];
    let isGroupBreak = (!prev) ||
        message.sender_id !== prev?.sender_id ||
        (new Date(prev.created_at).getTime() - new Date(message?.created_at).getTime()) > 30000000;

    const participant = selectedConvo.participants.find((p) => p.id === message.sender_id)
    return (
        <div
            className={cn(
                "flex gap-2 message-bounce",
                isOwn ? "justify-end" : "justify-start"
            )}
        >
            {/* Avatar  */}
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
            {/* Tin nhắn */}
            <div className={cn("max-w-[280px] md:max-w-xs lg:max-w-md space-y-1 flex flex-col mx-5",
                isOwn ? "items-end" : "items-start"
            )}>
                <Card
                    className={cn(
                        "mb-0.5 overflow-hidden", // Thêm overflow-hidden để bo góc ảnh
                        isOwn ? "bg-chat-bubble-sent border-0 text-white" : "bg-chat-bubble-received",
                        // Thuộc tính padding và background đối với ảnh
                        message.content_type === "image" ? "p-0 !bg-chat-bubble-received" : "p-3",

                    )}
                >
                    {message.content_type === "image" ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                {/* cursor-zoom-in để báo hiệu click sẽ phóng to, hover:scale-105 tạo cảm giác tương tác */}
                                <div className="relative cursor-zoom-in group overflow-hidden rounded-lg">
                                    <img
                                        src={message.content}
                                        alt="Sent attachment"
                                        className="rounded-lg max-w-full h-auto object-cover transform transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-90"
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>
                            </DialogTrigger>

                            {/* NỘI DUNG ẢNH PHÓNG TO */}
                            <DialogContent className="max-w-none! w-[90vw] h-[90vh] p-0 border-none bg-transparent shadow-none flex justify-center items-center overflow-hidden cursor-zoom-out!">
                                <img
                                    src={message.content}
                                    className="w-full h-full object-contain animate-in zoom-in-95 duration-300 "
                                    alt="Full size"
                                    // Click vào ảnh to để đóng (nếu muốn)
                                    onClick={(e) => {
                                        // Bạn có thể thêm logic đóng dialog ở đây nếu component cho phép

                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        /* HIỂN THỊ TEXT */
                        <p className="text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                            {message.content}
                        </p>
                    )}
                </Card>

                {/* Hiển thị thời gian */}
                {
                    isGroupBreak && (
                        <span className="text-[10px] text-muted-foreground px-1 mb-3">
                            {formatMessageTime(new Date(message.created_at))}
                        </span>
                    )
                }
            </div>
        </div >
    )
}

export default MessageItem
