"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Users, Calendar, Package, Heart, Banknote, PawPrint, Eye, Loader2, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DashboardStats {
  totalUsers: number
  totalPets: number
  todayAppointments: number
  pendingAppointments: number
  monthlyRevenue: number
  lowStockProducts: number
}

interface Appointment {
  id: number
  client: string
  pet: string
  service: string
  date: string
  time: string
  status: string
  created_at: string
}

interface Order {
  id: number
  client: string
  total: number
  items: number
  status: string
  created_at: string
  order_items?: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPets: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    monthlyRevenue: 0,
    lowStockProducts: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Fetch dashboard stats
      const statsResponse = await fetch("/api/admin/dashboard/stats", {
        credentials: "include",
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent appointments
      const appointmentsResponse = await fetch("/api/admin/dashboard/recent-appointments", {
        credentials: "include",
      })
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setRecentAppointments(appointmentsData)
      }

      // Fetch recent orders
      const ordersResponse = await fetch("/api/admin/dashboard/recent-orders", {
        credentials: "include",
      })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === "N/A") return "N/A"
    try {
      // Handle both HH:MM:SS and HH:MM formats
      const [hours, minutes] = timeString.split(":")
      const hour = Number.parseInt(hours)
      const minute = minutes || "00"
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minute} ${ampm}`
    } catch {
      return timeString
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; color: string }
    > = {
      pending: { variant: "secondary", color: "text-yellow-600" },
      confirmed: { variant: "default", color: "text-blue-600" },
      completed: { variant: "default", color: "text-green-600" },
      cancelled: { variant: "destructive", color: "text-red-600" },
      processing: { variant: "secondary", color: "text-orange-600" },
      shipped: { variant: "default", color: "text-blue-600" },
      delivered: { variant: "default", color: "text-green-600" },
    }

    const config = statusConfig[status.toLowerCase()] || { variant: "outline" as const, color: "text-gray-600" }

    return (
      <Badge variant={config.variant} className="capitalize">
        {status}
      </Badge>
    )
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsViewDialogOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading dashboard data...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your veterinary clinic operations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered clients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                <PawPrint className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPets}</div>
                <p className="text-xs text-muted-foreground">Under our care</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingAppointments} pending approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month's earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Button asChild className="h-16 flex-col">
              <Link href="/admin/appointments">
                <Calendar className="h-6 w-6 mb-2" />
                Manage Appointments
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col bg-transparent">
              <Link href="/admin/users">
                <Users className="h-6 w-6 mb-2" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col bg-transparent">
              <Link href="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                Manage Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col bg-transparent">
              <Link href="/admin/services">
                <Heart className="h-6 w-6 mb-2" />
                Manage Services
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Appointments
                </CardTitle>
                <CardDescription>Latest appointment bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAppointments.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Pet</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.client}</TableCell>
                            <TableCell>{appointment.pet}</TableCell>
                            <TableCell>{appointment.service}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{formatDate(appointment.date)}</div>
                                <div className="text-muted-foreground">{formatTime(appointment.time)}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleViewAppointment(appointment)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                      <Link href="/admin/appointments">View All Appointments</Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest product orders</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.client}</TableCell>
                            <TableCell>{order.items}</TableCell>
                            <TableCell>₱{order.total.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                      <Link href="/admin/orders">View All Orders</Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent orders</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {(stats.pendingAppointments > 0 || stats.lowStockProducts > 0) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Alerts & Notifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {stats.pendingAppointments > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                        <div>
                          <p className="font-medium text-orange-800">Pending Appointments</p>
                          <p className="text-sm text-orange-600">
                            {stats.pendingAppointments} appointments need approval
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {stats.lowStockProducts > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className="font-medium text-red-800">Low Stock Alert</p>
                          <p className="text-sm text-red-600">{stats.lowStockProducts} products running low</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Appointment View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>View appointment information</DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client</p>
                    <p className="text-base font-semibold">{selectedAppointment.client}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pet</p>
                    <p className="text-base font-semibold">{selectedAppointment.pet}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Service</p>
                    <p className="text-base">{selectedAppointment.service}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <p className="text-base">{formatDate(selectedAppointment.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                    <p className="text-base">{formatTime(selectedAppointment.time)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Booked On</p>
                    <p className="text-base">{formatDate(selectedAppointment.created_at)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button asChild>
                    <Link href="/admin/appointments">Go to Appointments</Link>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Order View Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>View order information</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                    <p className="text-base font-semibold">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client</p>
                    <p className="text-base font-semibold">{selectedOrder.client}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-base">{selectedOrder.items}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-base font-semibold">₱{selectedOrder.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                    <p className="text-base">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>

                {/* Order Items Table */}
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Order Items</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead className="text-right">Unit Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.order_items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{item.product_name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">₱{item.unit_price.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ₱{item.total_price.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                    Close
                  </Button>
                  <Button asChild>
                    <Link href="/admin/orders">Go to Orders</Link>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
