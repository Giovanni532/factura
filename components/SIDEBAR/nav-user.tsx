"use client"

import { motion } from "framer-motion"
import { BellIcon, CreditCardIcon, LogOutIcon, MoreVerticalIcon, UserCircleIcon, BarcodeIcon } from "lucide-react"

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
  payments,
  billing,
}: {
  user: {
    name: string
    email: string
    avatar: string
  } | null
  payments: {
    list: string
    detail: (paymentId: string) => string
    refund: (paymentId: string) => string
  }
  billing: {
    index: string
    upgrade: string
    invoiceDetail: (invoiceId: string) => string
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
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
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
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show">
                  <DropdownMenuItem asChild>
                    <a href="#">
                      <UserCircleIcon className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </a>
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                  <DropdownMenuItem asChild>
                    <a href={payments.list}>
                      <CreditCardIcon className="mr-2 h-4 w-4" />
                      <span>Paiements</span>
                    </a>
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                  <DropdownMenuItem asChild>
                    <a href={billing.index}>
                      <BarcodeIcon className="mr-2 h-4 w-4" />
                      <span>Abonnement</span>
                    </a>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <motion.div variants={menuItemVariants} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
                <DropdownMenuItem onClick={handleSignOut}>
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

