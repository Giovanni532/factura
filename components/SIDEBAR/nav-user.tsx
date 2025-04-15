"use client"

import { motion } from "framer-motion"
import { LogOutIcon, MoreVerticalIcon, UserCircleIcon, BarcodeIcon } from "lucide-react"

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
import Link from "next/link"
import { paths } from "@/paths"
import Image from "next/image"

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
  subscription,
}: {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string
  }
  subscription: {
    index: (userId: string) => string
    invoices: {
      list: (userId: string) => string
      detail: (userId: string, invoiceId: string) => string
    }
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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="rounded-lg">{user?.firstName?.charAt(0)} {user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <MoreVerticalIcon className="ml-auto size-4 cursor-pointer" />
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
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="rounded-lg">{user?.firstName?.charAt(0)} {user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.firstName} {user?.lastName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show">
                  <DropdownMenuItem asChild>
                    <Link href={paths.dashboard.profile(user?.id as string)} className="cursor-pointer">
                      <UserCircleIcon className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                  <DropdownMenuItem asChild>
                    <Link href={subscription.index(user?.id as string)} className="cursor-pointer">
                      <BarcodeIcon className="mr-2 h-4 w-4" />
                      <span>Abonnement</span>
                    </Link>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </motion.div>
  )
}

