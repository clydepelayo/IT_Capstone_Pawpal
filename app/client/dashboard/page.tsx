"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Heart, PawPrint, ShoppingBag, Banknote, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"

interface DashboardStats {
  totalPets: number
  upcomingAppointments: number
  completedAppointments: number
  totalSpent: number
}

interface RecentAppointment {
  id: number
  service_name: string
  pet_name: string
  appointment_date: string
  status: string
  price: number
}

interface RecentOrder {
  id: number
  total_amount: number
  status: string
  created_at: string
  item_count: number
}

interface UserProfile {
  first_name: string
  last_name: string
  email: string
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch("/api/client/dashboard/stats", {
        credentials: "include",
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent appointments
      const appointmentsResponse = await fetch("/api/client/dashboard/recent-appointments", {
        credentials: "include",
      })

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        console.log("Recent appointments data:", appointmentsData)
        setRecentAppointments(appointmentsData || [])
      } else {
        console.error("Failed to fetch recent appointments:", appointmentsResponse.status)
      }

      // Fetch recent orders
      const ordersResponse = await fetch("/api/client/orders?limit=3", {
        credentials: "include",
      })

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        console.log("Orders data received:", ordersData)

        // Handle both array and object responses
        if (Array.isArray(ordersData)) {
          setRecentOrders(ordersData)
        } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
          setRecentOrders(ordersData.orders)
        } else {
          setRecentOrders([])
        }
      }

      // Fetch user profile
      const profileResponse = await fetch("/api/client/profile", {
        credentials: "include",
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFirstName = () => {
    return userProfile.first_name || "Pet Owner"
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {getFirstName()}!</h2>
            <div className="flex items-center space-x-2">
              <Button asChild>
                <Link href="/client/appointments/book">
                  <Plus className="mr-2 h-4 w-4" />
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                <PawPrint className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPets}</div>
                <p className="text-xs text-muted-foreground">Registered pets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                <p className="text-xs text-muted-foreground">Scheduled visits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedAppointments}</div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Your latest veterinary visits and upcoming appointments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(appointment.status)}
                            <div>
                              <p className="text-sm font-medium">{appointment.service_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.pet_name} • {formatDate(appointment.appointment_date)} at{" "}
                                {formatTime(appointment.appointment_date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          <span className="text-sm font-medium">₱{appointment.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold">No appointments yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Book your first appointment to get started.</p>
                      <div className="mt-6">
                        <Button asChild>
                          <Link href="/client/appointments/book">
                            <Plus className="mr-2 h-4 w-4" />
                            Book Appointment
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {recentAppointments.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/client/appointments">View All Appointments</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest product purchases.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.item_count} item{order.item_count !== 1 ? "s" : ""} •{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <p className="text-sm font-medium mt-1">₱{order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No orders yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Start shopping to see your orders here.</p>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/client/shop">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Browse Shop
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button asChild size="sm" className="w-full justify-start">
                      <Link href="/client/pets/add">
                        <PawPrint className="mr-2 h-4 w-4" />
                        Add New Pet
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Link href="/client/appointments/book">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Link href="/client/shop">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Browse Shop
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Link href="/client/pets">
                        <Heart className="mr-2 h-4 w-4" />
                        View My Pets
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
