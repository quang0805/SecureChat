
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ShieldCheck } from "lucide-react"
import { Switch } from "../ui/switch"
import DirectMessageList from "../chat/DirectMessageList"
import { useThemeStore } from "@/stores/useThemeStore"
import { NavUser } from "./nav-user"
import { useAuthStore } from "@/stores/useAuthStore"
import { SidebarSearch } from "../chat/SideBarSearch"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  return (
    <Sidebar variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Container chính với hiệu ứng Glassmorphism */}
            <div className="relative group p-[1px] rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">

              {/* Hiệu ứng viền Gradient chạy ngầm (chỉ hiện rõ khi hover) */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20 group-hover:opacity-100 animate-gradient-x transition-opacity duration-500" />

              <div className="relative flex flex-col gap-4 p-3 rounded-[15px] bg-card/80 backdrop-blur-xl border border-border/50">

                {/* Phần Branding: Logo + Name */}
                <div className="flex items-center justify-between w-full">
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                      <div className="relative p-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                        <ShieldCheck className="size-5 text-primary-foreground" />
                      </div>
                    </div>
                    <h1 className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                      Secure<span className="text-primary">Chat</span>
                    </h1>
                  </motion.div>
                </div>

                {/* Phần Theme Toggle: Thiết kế lại dạng thanh công cụ nhỏ */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="relative size-5 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isDark ? (
                          <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Moon className="size-4 text-indigo-400" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="sun"
                            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Sun className="size-4 text-amber-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                      {isDark ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>

                  <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* Sidebar Search */}
      <SidebarSearch />
      {/* Content */}
      <SidebarContent
        className="beautiful-scrollbar"
      >

        {/* List Conversations */}
        <SidebarGroup>
          <SidebarGroupContent>
            <DirectMessageList />
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      {/* Footer */}
      <SidebarFooter
      >
        {user && <NavUser
          user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}