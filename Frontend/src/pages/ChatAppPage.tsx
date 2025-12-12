import ChatWindowLayout from "@/components/chat/ChatWindowLayout"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/useAuthStore"
import { useChatStore } from "@/stores/useChatStore"
import { useEffect } from "react"

const ChatAppPage = () => {
    const { fetchMe } = useAuthStore();
    const { fetchConversation } = useChatStore();
    useEffect(() => {
        fetchMe();
        fetchConversation();
    }, [])
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col h-screen w-full p-2 items-center">
                <ChatWindowLayout />
            </div>
        </SidebarProvider >
    )
}
export default ChatAppPage;
