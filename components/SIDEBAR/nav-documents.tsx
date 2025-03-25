"use client"

import { motion } from "framer-motion"
import { FolderIcon, MoreHorizontalIcon, ShareIcon, type LucideIcon } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
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
      staggerChildren: 0.07,
      delayChildren: 0.3,
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

const labelVariants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.4,
    },
  },
}

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <motion.div variants={labelVariants} initial="hidden" animate="show">
        <SidebarGroupLabel>Documents</SidebarGroupLabel>
      </motion.div>
      <motion.div variants={container} initial="hidden" animate="show">
        <SidebarMenu>
          {items.map((item) => (
            <motion.div key={item.name}>
              <SidebarMenuItem>
                <motion.div whileHover={{ opacity: 0.9 }} transition={{ duration: 0.2 }}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover className="rounded-sm data-[state=open]:bg-accent">
                      <MoreHorizontalIcon />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <DropdownMenuItem>
                        <FolderIcon />
                        <span>Open</span>
                      </DropdownMenuItem>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <DropdownMenuItem>
                        <ShareIcon />
                        <span>Share</span>
                      </DropdownMenuItem>
                    </motion.div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </motion.div>
          ))}
          <motion.div variants={item}>
            <SidebarMenuItem>
              <motion.div whileHover={{ opacity: 0.9 }} transition={{ duration: 0.2 }}>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontalIcon className="text-sidebar-foreground/70" />
                  <span>More</span>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          </motion.div>
        </SidebarMenu>
      </motion.div>
    </SidebarGroup>
  )
}

