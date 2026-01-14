import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

import type { User } from "@/types/user"
import Logout from "../auth/Logout"
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function NavUser(

  { user }: { user: User }) {
  const { isMobile } = useSidebar()
  const { updateDisplayName } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [tempName, setTempName] = useState(user?.display_name || "");

  const handleUpdate = async () => {
    if (tempName.trim()) {
      await updateDisplayName(tempName);
      setOpen(false); // Đóng modal sau khi cập nhật xong
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback className="rounded-lg bg-red-200 font-semibold">
                  {
                    user.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.display_name}</span>
                <span className="truncate text-xs">{user.username}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={user.username} />
                  <AvatarFallback className="rounded-lg font-semibold">
                    {
                      user.display_name.charAt(0)
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.display_name}</span>
                  <span className="truncate text-xs">{user.username}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <Dialog open={open} onOpenChange={setOpen}>
              <DropdownMenuGroup>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors rounded-lg gap-3"
                  >
                    <UserIcon className="size-4 text-muted-foreground group-focus:text-primary" />
                    <span className="font-medium">Change display name</span>
                  </DropdownMenuItem>
                </DialogTrigger>

                <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors rounded-lg gap-3">
                  <Bell className="size-4 text-muted-foreground group-focus:text-primary" />
                  <span className="font-medium">Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DialogContent className="glass-strong border-border/50 sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 pb-2">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-primary/20">
                        <UserIcon className="size-5 text-primary" />
                      </div>
                      <DialogTitle className="text-xl font-bold tracking-tight">
                        Edit Profile
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground/80 text-xs">
                    </DialogDescription>
                  </DialogHeader>
                </div>

                {/* Input Section */}
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      New display name
                    </label>
                    <div className="relative group">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Nhập tên hiển thị mới..."
                        className="h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-4 transition-all"
                      />
                      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 pt-2 gap-3 sm:gap-0">
                  <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded-xl !hover:bg-muted font-semibold transition-all active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="cursor-pointer bg-gradient-primary shadow-soft hover:shadow-glow rounded-xl px-6 font-bold transition-all active:scale-95"
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>

                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
            >
              <Logout />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu >
  )
}
