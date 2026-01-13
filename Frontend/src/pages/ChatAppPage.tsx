import ChatWindowLayout from "@/components/chat/ChatWindowLayout"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import WebSocketManager from "@/components/websocket/WebSocketManager"
import { useAuthStore } from "@/stores/useAuthStore"
import { useChatStore } from "@/stores/useChatStore"
import { useEffect } from "react"
const ChatAppPage = () => {
    const { fetchMe, accessToken } = useAuthStore();
    const { fetchConversation, fetchUsersOnline, searchUsers } = useChatStore();

    useEffect(() => {
        fetchMe();
        fetchConversation();
        fetchUsersOnline();

    }, [])
    return (
        <SidebarProvider>
            {accessToken && <WebSocketManager />}
            <AppSidebar />
            <div className="flex flex-col h-screen w-full p-2 items-center">
                <ChatWindowLayout />
            </div>
        </SidebarProvider >
    )
}
export default ChatAppPage;
