"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Calendar, Clock, Home, ChevronRight, Bell, Menu, Plus, MapPin } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { BadgeAPI } from "@/lib/badge"

interface UserProfile {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
}

interface Appointment {
  id: number
  pet_name: string
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
  cage_id?: number
  cage_number?: string
  cage_type?: string
  check_in_date?: string
  check_out_date?: string
}

interface Notification {
  id: number
  type: string
  title: string
  message: string
  related_id?: number
  related_type?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

interface NotificationData {
  notifications: Notification[]
  unreadCount: number
}

export default function PWADashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  useEffect(() => {
    fetchData()
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update badge when unread count changes
  useEffect(() => {
    BadgeAPI.set(unreadCount)
  }, [unreadCount])

  const fetchData = async () => {
    try {
      // Fetch profile
      const profileRes = await fetch("/api/client/profile", {
        credentials: "include",
      })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      } else {
        router.push("/pwa/login")
        return
      }

      // Fetch appointments
      const appointmentsRes = await fetch("/api/client/appointments", {
        credentials: "include",
      })
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json()
        const appointments = Array.isArray(data) ? data : data.appointments || []

        // Filter for upcoming appointments (pending or confirmed status)
        const upcoming = appointments
          .filter((apt: Appointment) => {
            const isUpcoming =
              apt.status === "pending" || apt.status === "confirmed" || apt.status === "pending payment"
            const appointmentDate = new Date(apt.appointment_date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isFuture = appointmentDate >= today
            return isUpcoming && isFuture
          })
          .sort((a: Appointment, b: Appointment) => {
            const dateA = new Date(a.appointment_date + " " + a.appointment_time)
            const dateB = new Date(b.appointment_date + " " + b.appointment_time)
            return dateA.getTime() - dateB.getTime()
          })
          .slice(0, 3)

        setUpcomingAppointments(upcoming)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/client/notifications", {
        credentials: "include",
      })

      if (response.ok) {
        const data: NotificationData = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)

        // Update the badge via service worker
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "UPDATE_BADGE",
            count: data.unreadCount,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch("/api/client/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
        )
        const newUnreadCount = Math.max(0, unreadCount - 1)
        setUnreadCount(newUnreadCount)

        // Update badge
        BadgeAPI.set(newUnreadCount)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/client/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })))
        setUnreadCount(0)

        // Clear badge
        BadgeAPI.clear()
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_confirmed":
      case "appointment_reminder":
      case "appointment_completed":
      case "appointment_cancelled":
        return <Calendar className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "appointment_confirmed":
        return "text-blue-500"
      case "appointment_reminder":
        return "text-yellow-500"
      case "appointment_completed":
        return "text-green-500"
      case "appointment_cancelled":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "pending payment":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getInitials = () => {
    if (!profile) return "U"
    return `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Heart className="w-6 h-6" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Pawpal</h1>
              <p className="text-xs text-blue-100">Pet Care Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Popover */}
            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-80">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                              !notification.is_read ? "bg-muted/30" : ""
                            }`}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">{notification.title}</p>
                                  {!notification.is_read && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                          {index < notifications.length - 1 && <Separator className="my-1" />}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{profile?.email}</p>
                    </div>
                  </div>
                  {profile?.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold mb-1">Welcome back, {profile?.first_name}! 👋</h2>
          <p className="text-blue-100 text-sm">Here's what's happening with your pets</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Quick Action - Book Appointment */}
        <Card
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onClick={() => router.push("/pwa/book")}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Book Appointment</h3>
                <p className="text-sm text-blue-100">Schedule a visit for your pet</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 opacity-80" />
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Appointments
            </CardTitle>
            {upcomingAppointments.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/pwa/appointments")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-500 text-sm mb-6">Book an appointment to get started</p>
                <Button onClick={() => router.push("/pwa/book")} className="bg-blue-600 hover:bg-blue-700">
                  Book Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-all duration-200 bg-white"
                    onClick={() => router.push(`/pwa/appointments/${appointment.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {appointment.cage_id ? (
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Home className="w-4 h-4 text-purple-600" />
                            </div>
                          ) : (
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{appointment.service_name}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <span>🐾</span> {appointment.pet_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} text-xs`}>{appointment.status}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(appointment.appointment_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(appointment.appointment_time)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>

                      {appointment.cage_id && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Cage:</span>
                            <span className="font-medium text-purple-600">
                              {appointment.cage_number} ({appointment.cage_type})
                            </span>
                          </div>
                          {appointment.check_in_date && appointment.check_out_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(appointment.check_in_date)} - {formatDate(appointment.check_out_date)}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
