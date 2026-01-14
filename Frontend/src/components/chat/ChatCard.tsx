
import type React from "react";
import { Card } from "../ui/card";
import { cn, formatOnlineTime } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ChatCardProps {
    convoId: string;
    name: string;
    timestamp?: Date;
    isActive: boolean;
    onSelect: (id: string) => void;
    leftSection: React.ReactNode;
    subtitle: React.ReactNode;
}

const ChatCard = ({
    convoId, name, timestamp, isActive, onSelect, leftSection, subtitle
}: ChatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                className={cn(
                    // Base styles: Tối giản, không viền cứng
                    "relative group border-none p-3 mb-1 cursor-pointer transition-all duration-300",
                    "bg-transparent hover:bg-muted/40",
                    // Active state: Hiệu ứng nổi bật nhưng tinh tế
                    isActive && [
                        "bg-primary/10 shadow-sm",
                        "before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-1 before:bg-primary before:rounded-r-full"
                    ]
                )}
                onClick={() => onSelect(convoId)}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar section với indicator trạng thái */}
                    <div className="relative shrink-0">
                        {leftSection}
                    </div>

                    {/* Content section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h3 className={cn(
                                "font-semibold text-sm truncate transition-colors",
                                isActive ? "text-primary" : "text-foreground/90"
                            )}>
                                {name}
                            </h3>

                            <div className="flex items-center gap-2">
                                {timestamp && (
                                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                        {formatOnlineTime(timestamp)}
                                    </span>
                                )}

                                {/* Nút More chỉ hiện khi hover hoặc active */}
                                <button className="p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="size-3.5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* Tin nhắn cuối cùng (Subtitle) */}
                        <div className="flex items-center justify-between">
                            <div className={cn(
                                "text-[12.5px] truncate flex-1 pr-4",
                                isActive ? "text-foreground/80 font-medium" : "text-muted-foreground"
                            )}>
                                {subtitle}
                            </div>

                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default ChatCard;