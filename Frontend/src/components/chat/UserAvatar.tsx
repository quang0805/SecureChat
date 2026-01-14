import { cn } from "@/lib/utils";
import * as AvatarPrimitive from "@radix-ui/react-avatar"; // Đổi cách import để tránh nhầm lẫn

interface IUserAvatarProps {
    type: "sidebar" | "chat" | "profile";
    name: string;
    avatarUrl?: string;
    className?: string;
}

const getGradientByName = (name: string) => {
    const gradients = [
        "from-indigo-500 to-purple-500",
        "from-purple-500 to-pink-500",
        "from-blue-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-rose-500",
        "from-fuchsia-500 to-purple-600",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
    const safeName = name || "User";
    const gradient = getGradientByName(safeName);

    // Định nghĩa kích thước khung Avatar
    const sizeClasses = {
        sidebar: "size-12 text-sm",
        chat: "size-14 text-[10px]",
        profile: "size-24 text-3xl shadow-xl border-4",
    };

    return (
        <div className={cn("relative inline-block shrink-0", className)}>
            <AvatarPrimitive.Root
                className={cn(
                    "relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-slate-100 dark:bg-slate-800 shadow-sm",
                    sizeClasses[type]
                )}
            >
                <AvatarPrimitive.Image
                    src={avatarUrl}
                    alt={safeName}
                    className="aspect-square h-full w-full object-cover"
                />

                {/* Fallback hiển thị chữ cái đầu nếu không load được ảnh */}
                <AvatarPrimitive.Fallback
                    className={cn(
                        "flex h-full w-full items-center justify-center rounded-full font-bold text-white bg-gradient-to-br transition-all duration-500",
                        gradient
                    )}
                    delayMs={600} // Đợi 600ms nếu ảnh chậm mới hiện chữ cái
                >
                    {safeName.charAt(0).toUpperCase()}
                </AvatarPrimitive.Fallback>
            </AvatarPrimitive.Root>

        </div>
    );
};

export default UserAvatar;