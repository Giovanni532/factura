import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/SIDEBAR/app-sidebar"
import { SiteHeader } from "@/components/SIDEBAR/site-header"
import { cookies } from "next/headers"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const allCookies = await cookies()
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Cookie": allCookies.toString(),
        },
        cache: "no-store",
    })

    const user = await response.json()

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" user={user} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
