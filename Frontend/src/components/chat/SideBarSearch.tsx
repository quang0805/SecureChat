import { useState, useEffect } from "react"
import { Search, X, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useChatStore } from "@/stores/useChatStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types/user"

export function SidebarSearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false)
    const { searchUsers, startConversation } = useChatStore()

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true)
                const users = await searchUsers(query)
                setResults(users)
                setLoading(false)
            } else {
                setResults([])
            }
        }, 100) // Debounce 400ms để tránh gọi API liên tục
        return () => clearTimeout(delayDebounce)
    }, [query])

    return (
        <div className="px-3 py-2 relative">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm username..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="
                        pl-8 h-9 border-none outline-none transition-all
                        /* Light Mode: Màu tím nhạt hoặc xám nhạt, chữ đen */
                        bg-purple-50/50 dark:bg-white/5 
                        text-slate-900 dark:text-slate-100
                        placeholder:text-slate-400 dark:placeholder:text-slate-50
                        /* Hover state */
                        hover:bg-purple-100/50 dark:hover:bg-white/10
                        /* Focus state: Hiện viền tím thương hiệu */
                        focus-visible:ring-1 focus-visible:ring-purple-500/50 
                        focus-visible:bg-white dark:focus-visible:bg-white/10
                    "
                />
                {query && (
                    <X
                        className="absolute right-2 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => setQuery("")}
                    />
                )}
            </div>

            {/* Kết quả tìm kiếm hiển thị nổi */}
            {results.length > 0 && (
                <div className="absolute left-3 right-3 z-50 mt-2 bg-popover border rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 text-[10px] font-bold text-muted-foreground uppercase border-b">
                        Kết quả toàn cầu
                    </div>
                    {results.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => {
                                startConversation(user)
                                setQuery("")
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer transition-colors"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.display_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">{user.display_name}</span>
                                <span className="text-[10px] text-muted-foreground truncate">@{user.username}</span>
                            </div>
                            <UserPlus className="ml-auto h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}