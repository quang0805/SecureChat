import { SidebarTrigger } from "../ui/sidebar"
import ChatWindowHeader from "./ChatWindowHeader"

const ChatWelcomeScreen = () => {
    return (
        <div className="bg-primary-foreground w-full h-full rounded-2xl flex flex-1 flex-col justify-center items-center shadow-md">
            <ChatWindowHeader />
            <div className="w-full h-full flex flex-col justify-center items-center">
                <h2
                    className="text-6xl mb-5"
                >💬</h2>
                <p>Welcome my Secure Chat Application!</p>
            </div>
        </div >
    )
}

export default ChatWelcomeScreen
