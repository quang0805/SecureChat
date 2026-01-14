import { useState, useEffect } from "react"
import { Search, X, UserPlus, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useChatStore } from "@/stores/useChatStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types/user"
import { motion, AnimatePresence } from "framer-motion"

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
                setLoading(false)
            }
        }, 400) // Tăng lên 400ms để tối ưu tài nguyên server
        return () => clearTimeout(delayDebounce)
    }, [query, searchUsers])

    return (
        <div className="px-4 py-3 relative z-50">
            {/* Input Group */}
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    )}
                </div>

                <Input
                    placeholder="Tìm kiếm ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="
                        pl-10 pr-10 h-10 border-none outline-none transition-all duration-300
                        bg-muted/50 dark:bg-white/5 backdrop-blur-md
                        hover:bg-muted/80 dark:hover:bg-white/10
                        focus-visible:ring-2 focus-visible:ring-primary/30
                        focus-visible:bg-background shadow-inner
                        rounded-xl text-sm
                    "
                />

                <AnimatePresence>
                    {query && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Results Dropdown */}
            <AnimatePresence>
                {(results.length > 0 || (query && !loading && results.length === 0)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-4 right-4 mt-3 bg-popover/90 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                        <div className="p-3 text-[10px] font-bold text-primary/70 uppercase tracking-widest border-b border-border/40 flex justify-between items-center">
                            <span>Kết quả tìm kiếm</span>
                            {results.length > 0 && <span className="text-muted-foreground normal-case font-normal">{results.length} người dùng</span>}
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {results.length > 0 ? (
                                results.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => {
                                            startConversation(user)
                                            setQuery("")
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-all active:scale-95 group"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                    {user.display_name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="flex flex-col flex-1 overflow-hidden">
                                            <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                {user.display_name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground truncate">
                                                @{user.username}
                                            </span>
                                        </div>

                                        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                            <UserPlus className="h-4 w-4" />
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center gap-2">
                                    <Search className="h-8 w-8 text-muted-foreground/20" />
                                    <p className="text-sm text-muted-foreground">Không tìm thấy người dùng này</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}