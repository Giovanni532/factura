"use client"

import { motion } from "framer-motion"
import { PlusCircleIcon, type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  }[]
}) {
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <PlusCircleIcon />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          </motion.div>
        </SidebarMenu>
        <motion.div variants={container} initial="hidden" animate="show">
          <SidebarMenu>
            {items.map((item, index) => (
              <motion.div key={item.title} custom={index}>
                <SidebarMenuItem>
                  <motion.div whileHover={{ opacity: 0.9 }} transition={{ duration: 0.2 }}>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              </motion.div>
            ))}
          </SidebarMenu>
        </motion.div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

