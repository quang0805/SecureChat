import { useChatStore } from "@/stores/useChatStore"
import type { Conversation, Participant } from "@/types/chat"
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import { Phone, Video, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
    const { conversations, activeConversationId, onlineUserIds } = useChatStore()
    const user = useAuthStore((s) => s.user);
    let otherUser;
    chat = chat ?? conversations.find((c) => c.id == activeConversationId);
    if (!chat) {
        return (
            <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
                <SidebarTrigger
                    className="-ml-1 text-foreground hover:bg-primary/10"
                />
            </header>
        )
    }
    const otherUsers = chat.participants.filter((c) => c.id != user?.id)
    if (chat.type == "private") {
        otherUser = otherUsers.length > 0 ? otherUsers[0] : null
        if (!chat || !otherUser) return;
    }
    const isOnline = onlineUserIds.includes(otherUsers[0].id)

    return (
        <header
            className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background"
        >
            <div className="flex items-center gap-1 w-full"
            >
                <SidebarTrigger className="-ml-1 text-foreground hover:bg-primary/10" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <div className="p-2 w-full flex items-center">
                    {/* Hiển thị Avatar cuộc hội thoại */}
                    <div className="relative">{
                        chat.type == "private" ? (
                            <>
                                <UserAvatar
                                    type={"chat"}
                                    name={otherUser?.display_name || ""}
                                    avatarUrl={otherUser?.avatar_url || undefined}
                                />
                                <StatusBadge
                                    status={isOnline ? "online" : "offline"}
                                />
                            </>
                        ) : (
                            <>
                                <UserAvatar
                                    type={"chat"}
                                    name={chat.name}
                                    avatarUrl={undefined}
                                />
                                <StatusBadge
                                    status={isOnline ? "online" : "offline"}
                                />
                            </>
                        )
                    }</div>
                    {/* Hiển thị tên cuộc hội thoại */}
                    <h2 className="font-semibold text-foreground m-3">
                        {
                            chat.type == "private" ? otherUser?.display_name : chat.name
                        }
                    </h2>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                    <Button variant="ghost" size="icon" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                        <Phone className="size-5" fill="currentColor" />
                    </Button>

                    <Button variant="ghost" size="icon" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                        <Video className="size-5" fill="currentColor" />
                    </Button>

                    <Button variant="ghost" size="icon" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                        <MoreHorizontal className="size-5" />
                    </Button>
                </div>
            </div>

        </header >
    )
}

export default ChatWindowHeader
