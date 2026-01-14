import { motion } from "framer-motion";

const ChatWindowSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.02, // Hơi nở ra một chút khi biến mất tạo cảm giác chiều sâu
                filter: "blur(10px)", // Thêm hiệu ứng mờ dần
                transition: { duration: 0.4, ease: "easeInOut" }
            }}
            className="flex flex-col h-full w-full bg-background/50 backdrop-blur-sm absolute inset-0 z-20"
        >
            <div className="flex flex-col h-full w-full bg-background/50 backdrop-blur-sm relative overflow-hidden">
                {/*  HEADER SKELETON  */}
                <div className="h-[68px] px-4 flex items-center justify-between border-b border-border/40 bg-background/80">
                    <div className="flex items-center gap-3">
                        {/* Avatar tròn */}
                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse shadow-inner" />
                        <div className="space-y-2">
                            {/* Tên người dùng */}
                            <div className="h-4 w-32 bg-muted rounded-full animate-pulse" />
                            {/* Trạng thái (Online/Offline) */}
                            <div className="h-2.5 w-16 bg-muted/60 rounded-full animate-pulse" />
                        </div>
                    </div>
                    {/* Cụm icon Phone/Video/More bên phải */}
                    <div className="flex items-center gap-4 px-2">
                        <div className="size-5 rounded-md bg-muted/60 animate-pulse" />
                        <div className="size-5 rounded-md bg-muted/60 animate-pulse" />
                        <div className="size-5 rounded-md bg-muted/60 animate-pulse" />
                    </div>
                </div>

                {/* 2. MESSAGE AREA SKELETON (Mô phỏng bong bóng chat) */}
                <div className="flex-1 p-6 space-y-8 overflow-hidden bg-chat-pattern/30">

                    {/* Tin nhắn nhận được (Bên trái) */}
                    <div className="flex items-end gap-3 max-w-[70%]">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="space-y-2">
                            <div className="h-10 w-48 bg-muted/80 rounded-2xl rounded-bl-none animate-pulse" />
                            <div className="h-8 w-32 bg-muted/50 rounded-2xl rounded-bl-none animate-pulse" />
                        </div>
                    </div>

                    {/* Tin nhắn gửi đi (Bên phải - dùng màu Primary) */}
                    <div className="flex flex-col items-end gap-2 ml-auto max-w-[70%]">
                        <div className="h-12 w-64 bg-primary/20 rounded-2xl rounded-br-none animate-pulse" />
                        <div className="h-10 w-40 bg-primary/10 rounded-2xl rounded-br-none animate-pulse" />
                    </div>

                    {/* Tin nhắn hình ảnh nhận được */}
                    <div className="flex items-end gap-3 max-w-[70%]">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="h-40 w-56 bg-muted/60 rounded-2xl rounded-bl-none animate-pulse" />
                    </div>

                    {/* Tin nhắn gửi đi ngắn */}
                    <div className="flex justify-end ml-auto">
                        <div className="h-10 w-24 bg-primary/20 rounded-2xl rounded-br-none animate-pulse" />
                    </div>
                </div>

                {/* INPUT BAR SKELETON */}
                <div className="p-4 bg-background/80 border-t border-border/40">
                    <div className="flex items-center gap-3 px-2">
                        <div className="size-6 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 h-11 bg-muted/40 rounded-2xl animate-pulse" />
                        <div className="size-10 rounded-xl bg-primary/20 animate-pulse" />
                    </div>
                </div>

                {/* Hiệu ứng quét bảo mật đặc trưng */}
                <motion.div
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-[2px] bg-primary/10 blur-sm z-10 pointer-events-none"
                />
            </div>
        </motion.div>
    )
};

export default ChatWindowSkeleton;
