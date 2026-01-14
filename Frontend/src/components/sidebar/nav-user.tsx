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
import { ProfileSettings } from "../user/ProfileSettings";

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
                <span className="truncate text-xs">@{user.username}</span>
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
                  <span className="truncate text-xs">@{user.username}</span>
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
                    <span className="font-medium">Profile setting</span>
                  </DropdownMenuItem>
                </DialogTrigger>

                <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors rounded-lg gap-3">
                  <Bell className="size-4 text-muted-foreground group-focus:text-primary" />
                  <span className="font-medium">Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DialogContent className="max-w-none! w-[28vw] h-[80vh] backdrop-blur-xl bg-background/80 glass-strong border-border/50 sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <ProfileSettings onClose={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
            >
              <Logout
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu >
  )
}
