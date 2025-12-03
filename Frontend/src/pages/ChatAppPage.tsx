import ChatWindowLayout from "@/components/chat/ChatWindowLayout"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useChatStore } from "@/stores/useChatStore"
import { useEffect } from "react"


const ChatAppPage = () => {
    const fetchConversation = useChatStore((s) => s.fetchConversation)
    const conversations = useChatStore((s) => s.conversations)
    useEffect(() => {
        console.log(conversations)
    }, [conversations.length])
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col h-screen w-full p-2 items-center">
                <ChatWindowLayout />
                <Button
                    className="m-3 w-1/2 justify-center"
                    onClick={fetchConversation}
                >
                    Fetch Conversation
                </Button>
            </div>
        </SidebarProvider >
    )
}
export default ChatAppPage
