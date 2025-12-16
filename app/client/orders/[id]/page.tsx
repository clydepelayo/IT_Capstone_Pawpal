"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  CheckCircle,
  Clock,
  Truck,
  Loader2,
  ShoppingBag,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { ClientSidebar } from "@/components/client-sidebar"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  photo_url: string
  quantity: number
  price: number
}

interface Order {
  id: number
  user_id: number
  user_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  payment_method: string
  subtotal: number
  status: string
  created_at: string
  user_email: string
  user_phone: string
  items: OrderItem[]
  notes?: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const { toast } = useToast()

  const orderId = params.id as string

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/client/orders/${orderId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch order details")
      }

      const orderData = await response.json()
      setOrder(orderData)
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch order details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    try {
      setCancelling(true)
      const response = await fetch(`/api/client/orders/${orderId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel order")
      }

      toast({
        title: "Success",
        description: "Order cancelled successfully",
      })

      // Refresh order details
      await fetchOrderDetails()
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel order",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "confirmed":
        return <CheckCircle className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "processing":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case "cod":
      case "cash_on_delivery":
        return "Cash on Delivery"
      case "bank_transfer":
        return "Bank Transfer"
      case "gcash":
        return "GCash"
      case "paymaya":
        return "PayMaya"
      case "credit_card":
        return "Credit Card"
      default:
        return method
    }
  }

  const getProgressSteps = (currentStatus: string) => {
    const steps = [
      { key: "pending", label: "Order Placed", icon: Clock },
      { key: "confirmed", label: "Confirmed", icon: CheckCircle },
      { key: "processing", label: "Processing", icon: Package },
      { key: "shipped", label: "Shipped", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle },
    ]

    if (currentStatus.toLowerCase() === "cancelled") {
      return [
        { key: "pending", label: "Order Placed", icon: Clock, completed: true },
        { key: "cancelled", label: "Cancelled", icon: XCircle, completed: true, cancelled: true },
      ]
    }

    const currentIndex = steps.findIndex((step) => step.key === currentStatus.toLowerCase())

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  if (loading) {
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
                  <BreadcrumbLink href="/client/orders">Orders</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Loading...</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Loading order details...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!order) {
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
                  <BreadcrumbLink href="/client/orders">Orders</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Order Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Order not found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  The order you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => router.push("/client/orders")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const progressSteps = getProgressSteps(order.status)

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
                <BreadcrumbLink href="/client/orders">Orders</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Order #{order.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/client/orders")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
              </div>
              <p className="text-muted-foreground">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(order.status)} border px-3 py-1`} variant="outline">
                <span className="capitalize font-medium">{order.status}</span>
              </Badge>
              {order.status.toLowerCase() === "pending" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={cancelling}>
                      {cancelling ? (
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
                        Are you sure you want to cancel this order? This action cannot be undone. You will need to place
                        a new order if you change your mind.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder} className="bg-red-600 hover:bg-red-700">
                        Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Order Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex items-center justify-between">
                  {progressSteps.map((step, index) => {
                    const Icon = step.icon
                    const isLast = index === progressSteps.length - 1

                    return (
                      <div key={step.key} className="flex flex-col items-center relative">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                            step.cancelled
                              ? "bg-red-50 border-red-300 text-red-600"
                              : step.completed
                                ? "bg-blue-50 border-blue-300 text-blue-600"
                                : "bg-gray-50 border-gray-300 text-gray-400"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="mt-3 text-center">
                          <p
                            className={`text-sm font-medium ${
                              step.cancelled ? "text-red-600" : step.completed ? "text-blue-600" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                        {!isLast && (
                          <div
                            className={`absolute top-6 left-12 w-full h-0.5 transition-colors ${
                              step.completed && !step.cancelled ? "bg-blue-300" : "bg-gray-300"
                            }`}
                            style={{ width: "calc(100vw / " + progressSteps.length + " - 3rem)" }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Items ({order.items.length} item{order.items.length !== 1 ? "s" : ""})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.photo_url ? (
                            <img
                              src={item.photo_url || "/placeholder.svg"}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=64&width=64"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{item.product_name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">₱{item.price.toLocaleString()} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-gray-900">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-6" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">₱{order.subtotal.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Information */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900">{order.user_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{order.user_email}</span>
                  </div>
                  {order.user_phone && order.user_phone !== order.customer_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600">{order.user_phone} (Account Phone)</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <span className="text-sm text-gray-700 leading-relaxed">{order.shipping_address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900">{formatPaymentMethod(order.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">₱{order.subtotal.toLocaleString()}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order Notes</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-600">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {order.status.toLowerCase() === "cancelled" && (
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-red-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-red-600">Order Cancelled</p>
                          <p className="text-xs text-gray-600">Recently</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
