"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Package,
  Truck,
  User,
  X,
  Loader2,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  payment_method: string
  notes?: string
  total_amount: number
  status: string
  created_at: string
  item_count: number
  user_name: string
  user_email: string
  user_phone: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/client/orders", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Orders data received:", data)

        // Handle both array and object responses
        if (Array.isArray(data)) {
          setOrders(data)
        } else if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders)
        } else {
          setOrders([])
        }
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrderId(orderId)

    try {
      const response = await fetch(`/api/client/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order cancelled successfully.",
        })

        // Update the order status in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)),
        )
      } else {
        throw new Error(data.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel order.",
        variant: "destructive",
      })
    } finally {
      setCancellingOrderId(null)
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cash_on_delivery":
        return "Cash on Delivery"
      case "gcash":
        return "GCash"
      case "bank_transfer":
        return "Bank Transfer"
      case "credit_card":
        return "Credit Card"
      default:
        return method
    }
  }

  const canCancelOrder = (status: string) => {
    return status.toLowerCase() === "pending"
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            </div>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
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
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <Button asChild>
              <Link href="/client/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Button asChild>
                  <Link href="/client/shop">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          Order #{order.id}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>
                            {order.item_count} item{order.item_count !== 1 ? "s" : ""}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <p className="text-lg font-semibold mt-1">₱{order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        {/* <div>
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            Customer Information
                          </h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {order.customer_email}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.customer_phone}
                            </p>
                            {order.user_phone && order.user_phone !== order.customer_phone && (
                              <p className="flex items-center gap-1 text-blue-600">
                                <Phone className="h-3 w-3" />
                                {order.user_phone}
                              </p>
                            )}
                          </div>
                        </div> */}

                        <div>
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Method
                          </h4>
                          <p className="text-sm text-muted-foreground">{formatPaymentMethod(order.payment_method)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shipping_address}</p>
                        </div>

                        {order.notes && (
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4" />
                              Order Notes
                            </h4>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Order placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                        {canCancelOrder(order.status) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={cancellingOrderId === order.id}>
                                {cancellingOrderId === order.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel Order
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order #{order.id}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this order? This action cannot be undone. You will
                                  need to place a new order if you change your mind.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Order
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
