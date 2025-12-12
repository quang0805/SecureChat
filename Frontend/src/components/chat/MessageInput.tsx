import { useAuthStore } from "@/stores/useAuthStore"
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { Image, Send } from "lucide-react";

const MessageInput = () => {
    const { user } = useAuthStore();
    const { activeConversationId, sendMessage, fetchMessages } = useChatStore()
    const [value, setValue] = useState("")
    const handleSendMessage = async (message: string) => {
        if (!value.trim()) return;
        await sendMessage(activeConversationId!, message);
        setValue('');
    }
    if (!user) return;
    useEffect(() => {
        console.log(value)
    }, [value])
    return (
        <div className="flex items-center justify-between gap-2 p-3 min-h-14 bg-background">
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition-smooth"
            >
                <Image />
            </Button>
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nhập tin nhắn"
                className="pr-20 h-9 bg-white border-border/10 focus:border-primary/50 transition-smooth resize-none"
            >
            </Input>
            {/* <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-cetner gap-1">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:bg-primary/10 transition-smooth"
                    >
                    </Button>
                </div> */}
            <Button
                className="bg-blue-500 hover:bg-blue-500/80 transition-smooth hover:scale-105 cursor-pointer"
                disabled={!value.trim()}
                onClick={() => handleSendMessage(value)}
            >
                <Send />
            </Button>
        </div>
    )
}

export default MessageInput
