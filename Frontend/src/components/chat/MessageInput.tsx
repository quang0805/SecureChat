import { useAuthStore } from "@/stores/useAuthStore"
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { Image, Send } from "lucide-react";
import { toast } from "sonner";

const MessageInput = () => {
    const { user } = useAuthStore();
    const { activeConversationId, sendMessage } = useChatStore()
    const [value, setValue] = useState("")
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null)
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
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra định dạng (chỉ cho phép ảnh)
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chỉ chọn tệp hình ảnh");
            return;
        }

        // Kiểm tra dung lượng 
        if (file.size > 1 * 1024 * 1024) {
            toast.error(`Ảnh quá lớn, vui lòng chọn ảnh dưới 1MB ${file.size}`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            // Gửi tin nhắn với type là 'image'
            if (activeConversationId) {
                await sendMessage(activeConversationId, base64String, "image");
                // Reset input file để có thể chọn lại cùng 1 ảnh nếu muốn
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex items-center justify-between gap-2 p-3 min-h-14 bg-background">
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition-smooth cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <Image />
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nhập tin nhắn"
                className="pr-20 h-9 bg-white border-[0.5px] border-border/40 focus:border-primary/10 focus:ring-0 transition-smooth resize-none outline-none"
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
