"use client"

import type * as React from "react"
import {
  ArrowUpCircleIcon,
  FileIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/SIDEBAR/nav-main"
import { NavUser } from "@/components/SIDEBAR/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { paths } from "@/paths"
import { useAuthStore } from "@/store/auth-store"

const navMain = [
  {
    title: "Dashboard",
    url: paths.dashboard.home,
    icon: LayoutDashboardIcon,
    actions: [{ label: "Voir le tableau de bord", url: paths.dashboard.home }],
  },
  {
    title: "Devis",
    url: paths.dashboard.quotes.list,
    icon: FileTextIcon,
    actions: [
      { label: "Créer un devis", url: paths.dashboard.quotes.create },
      { label: "Voir tous les devis", url: paths.dashboard.quotes.list },
    ],
  },
  {
    title: "Factures",
    url: paths.dashboard.invoices.list,
    icon: FileIcon,
    actions: [
      { label: "Créer une facture", url: paths.dashboard.invoices.create },
      { label: "Voir toutes les factures", url: paths.dashboard.invoices.list },
    ],
  },
  {
    title: "Clients",
    url: paths.dashboard.clients.list,
    icon: UsersIcon,
    actions: [
      { label: "Voir tous les clients", url: paths.dashboard.clients.list },
    ],
  },
  {
    title: "Produits/Services",
    url: paths.dashboard.items.list,
    icon: PackageIcon,
    actions: [
      { label: "Voir tous les produits", url: paths.dashboard.items.list },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  const userData = user ? {
    id: user.id as string,
    firstName: user.name?.split(" ")[0] || "Utilisateur",
    lastName: user.name?.split(" ")[1] || "Utilisateur",
    email: user.email || "user@example.com",
    avatar: user.image || "/avatars/default.jpg",
  } : {
    id: "",
    firstName: "Utilisateur",
    lastName: "Utilisateur",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Factura</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} subscription={paths.dashboard.subscription} />
      </SidebarFooter>
    </Sidebar>
  )
}

