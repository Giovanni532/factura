"use client"

import { motion } from "framer-motion"
import { BellIcon, CreditCardIcon, LogOutIcon, MoreVerticalIcon, UserCircleIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

const menuItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { logout, checkAuth } = useAuthStore()

  const handleSignOut = async () => {
    await logout()
    await checkAuth()
    router.push("/")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0.5,
        duration: 0.5,
      }}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ opacity: 0.9 }} whileTap={{ opacity: 0.8 }}>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <MoreVerticalIcon className="ml-auto size-4" />
                </SidebarMenuButton>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show">
                  <DropdownMenuItem>
                    <UserCircleIcon />
                    Account
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                  <DropdownMenuItem>
                    <CreditCardIcon />
                    Billing
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                  <DropdownMenuItem>
                    <BellIcon />
                    Notifications
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </motion.div>
  )
}

