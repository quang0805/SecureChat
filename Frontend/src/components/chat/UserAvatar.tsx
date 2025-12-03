import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"


interface IUserAvatarProps {
    type: "sidebar" | "chat" | "profile";
    name: string;
    avatarUrl?: string;
    className?: string;
}


const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
    const bgColor = !avatarUrl ? "bg-blue-700" : "";
    if (!name) {
        name = "(^_^)"
    }
    return (
        <Avatar
            className={cn(
                className ?? "",
                type === "sidebar" && "size-12 text-base",
                type === "chat" && "size-8 text-sm",
                type === "profile" && "size-24 text-3xl shadow-md"
            )}
        >
            <AvatarImage
                src={avatarUrl}
                alt={name}
            />
            <AvatarFallback className={`flex items-center justify-center w-12 h-12 text-white ${bgColor} rounded-full font-semibold overflow-hidden `}>
                {name.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
}

export default UserAvatar
