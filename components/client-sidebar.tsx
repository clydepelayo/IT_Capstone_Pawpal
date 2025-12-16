"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  Heart,
  Home,
  PawPrint,
  ShoppingBag,
  User,
  LogOut,
  Receipt,
  Plus,
  Package,
  Activity,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NotificationPanel } from "@/components/notification-panel"
import { useToast } from "@/hooks/use-toast"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/client",
      icon: Home,
    },
    {
      title: "My Pets",
      url: "/client/pets",
      icon: PawPrint,
    },
    {
      title: "Appointments",
      url: "/client/appointments",
      icon: Calendar,
    },
    {
      title: "Shop",
      url: "/client/shop",
      icon: ShoppingBag,
    },
    {
      title: "Orders",
      url: "/client/orders",
      icon: Package,
    },
    {
      title: "Transactions",
      url: "/client/transactions",
      icon: Receipt,
    },
  ],
  quickActions: [
    {
      title: "My Activity",
      url: "/client/myactivity",
      icon: Activity,
    },
    {
      title: "Add Pet",
      url: "/client/pets/add",
      icon: Plus,
    },
    {
      title: "Book Appointment",
      url: "/client/appointments/book",
      icon: Calendar,
    },
  ],
}

interface UserProfile {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
}

export function ClientSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/client/profile", {
        credentials: "include",
      })

      if (response.ok) {
        const profileData = await response.json()
        setUserProfile(profileData)
      } else {
        console.error("Failed to fetch user profile")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFullName = () => {
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    } else if (userProfile.first_name) {
      return userProfile.first_name
    } else if (userProfile.last_name) {
      return userProfile.last_name
    }
    return "User"
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out.",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">Pawpal</span>
          </div>
          <NotificationPanel />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User />
              <span className="truncate">{isLoading ? "Loading..." : getFullName()}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
