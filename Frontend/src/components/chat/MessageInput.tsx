import { useAuthStore } from "@/stores/useAuthStore"
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { Image, Send } from "lucide-react";

const MessageInput = () => {
    const { user } = useAuthStore();
    const { activeConversationId, sendMessage } = useChatStore()
    const [value, setValue] = useState("")
    const inputRef = useRef<HTMLInputElement>(null);
    if (!user) return;
    const handleSendMessage = async (message: string) => {
        if (!value.trim()) return;
        await sendMessage(activeConversationId!, message);
        setValue('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const handleKeyDown = async (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (value.trim()) {
                await handleSendMessage(value);
            }
        }
    }
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
                ref={inputRef}
                onKeyDown={e => handleKeyDown(e)}
            >
            </Input>
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
