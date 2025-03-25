"use client"

import { motion } from "framer-motion"
import { PlusCircleIcon, MoreHorizontalIcon, type LucideIcon } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    actions?: { label: string; url: string }[]
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 400,
              damping: 17,
            }}
          >
            <SidebarMenuItem className="flex items-center gap-2">
              <motion.div whileHover={{ opacity: 0.9 }} whileTap={{ opacity: 0.8 }}>
                <SidebarMenuButton
                  tooltip="Créer"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <PlusCircleIcon />
                  <span>Créer</span>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          </motion.div>
        </SidebarMenu>
        <motion.div variants={container} initial="hidden" animate="show">
          <SidebarMenu>
            {items.map((navItem, index) => (
              <motion.div key={navItem.title} variants={item} custom={index}>
                <SidebarMenuItem>
                  <motion.div whileHover={{ opacity: 0.9 }} transition={{ duration: 0.2 }}>
                    <SidebarMenuButton tooltip={navItem.title} asChild>
                      <a href={navItem.url}>
                        {navItem.icon && <navItem.icon />}
                        <span>{navItem.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </motion.div>

                  {navItem.actions && navItem.actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover className="rounded-sm data-[state=open]:bg-accent">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Options</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        {navItem.actions.map((action, i) => (
                          <motion.div
                            key={action.label}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <DropdownMenuItem asChild>
                              <a href={action.url}>{action.label}</a>
                            </DropdownMenuItem>
                          </motion.div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </SidebarMenuItem>
              </motion.div>
            ))}
          </SidebarMenu>
        </motion.div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

