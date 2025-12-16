"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileImage,
  CheckCircle2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  photo_url?: string
}

interface Order {
  id: number
  order_number: string
  client_name: string
  order_date: string
  total_amount: number
  status: string
  customer_phone: string
  customer_email: string
  customer_name: string
  shipping_address: string
  payment_method: string
  user_email: string
  receipt_url?: string
  notes?: string
  items: OrderItem[]
}

export default function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Order details:", data)
        setOrder(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch order details.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching order details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Order status updated",
          description: `Order status has been updated to ${newStatus}.`,
        })
        fetchOrderDetails()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update order status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Something went wrong while updating order status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const verifyReceipt = async () => {
    if (!order) return

    try {
      setIsVerifying(true)
      const response = await fetch(`/api/admin/orders/${order.id}/verify-receipt`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Receipt Verified",
          description: "Payment receipt has been verified and order status updated to confirmed.",
        })
        setShowReceiptDialog(false)
        fetchOrderDetails()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to verify receipt.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying receipt:", error)
      toast({
        title: "Error",
        description: "Something went wrong while verifying receipt.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default"
      case "shipped":
        return "default"
      case "confirmed":
        return "default"
      case "processing":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "pending":
        return <Clock className="h-5 w-5" />
      case "cancelled":
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "gcash":
        return "GCash"
      case "paymaya":
        return "PayMaya"
      case "cash_on_delivery":
        return "Cash on Delivery"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method || "N/A"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  // Determine if receipt is verified based on status
  const isReceiptVerified =
    order && order.receipt_url && ["confirmed", "processing", "shipped", "delivered"].includes(order.status)

  if (isLoading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">Loading order details...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!order) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">Order not found</div>
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
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/orders">Orders</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{order.order_number || `Order #${order.id}`}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusIcon(order.status)}
                  <h1 className="text-3xl font-bold">{order.order_number || `Order #${order.id}`}</h1>
                  <Badge variant={getStatusColor(order.status)} className="text-sm">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1">Placed on {formatDate(order.order_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={order.status} onValueChange={updateOrderStatus} disabled={isUpdating}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Receipt Verification Card - Updated Colors */}
          {order.receipt_url && (
            <Card
              className={`border-2 ${
                isReceiptVerified ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 ${isReceiptVerified ? "text-green-900" : "text-orange-900"}`}
                >
                  <FileImage className="h-5 w-5" />
                  Payment Receipt
                </CardTitle>
                <CardDescription className={isReceiptVerified ? "text-green-700" : "text-orange-700"}>
                  {isReceiptVerified
                    ? "Payment receipt has been verified and order is confirmed"
                    : "Customer has uploaded a payment receipt for verification"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setShowReceiptDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    View Receipt
                  </Button>
                  {order.status === "pending" && (
                    <Button
                      onClick={verifyReceipt}
                      disabled={isVerifying}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isVerifying ? "Verifying..." : "Verify & Confirm Order"}
                    </Button>
                  )}
                  {isReceiptVerified && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Receipt Verified
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${isReceiptVerified ? "text-green-700" : "text-orange-700"}`}>
                  {order.status === "pending"
                    ? "Please review the payment receipt and verify it before confirming the order."
                    : "Payment receipt has been verified and order is confirmed."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Customer and Payment Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.customer_name || order.client_name}</p>
                    <p className="text-sm text-gray-500">Customer Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.customer_email || order.user_email}</p>
                    <p className="text-sm text-gray-500">Email Address</p>
                  </div>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.customer_phone}</p>
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                  </div>
                )}
                {order.shipping_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{order.shipping_address}</p>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(order.order_date)}</p>
                    <p className="text-sm text-gray-500">Order Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatPaymentMethod(order.payment_method)}</p>
                    <p className="text-sm text-gray-500">Payment Method</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4" />
                  <div>
                    <p className="text-2xl font-bold">₱{order.total_amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-3">
                    <div className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{order.notes}</p>
                      <p className="text-sm text-gray-500">Order Notes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>Products included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center border rounded-md p-3 hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="flex-shrink-0 w-16 h-16">
                      <img
                        src={item.photo_url || "/placeholder.svg?height=64&width=64&text=Product"}
                        alt={item.product_name}
                        className="w-full h-full object-contain rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=Product"
                        }}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-base">{item.product_name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                        <span>Quantity: {item.quantity}</span>
                        <span>Unit Price: ₱{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold">₱{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Subtotal</p>
                    </div>
                  </div>
                ))}

                {(!order.items || order.items.length === 0) && (
                  <div className="text-center py-6 text-gray-500">No items found for this order.</div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="flex justify-between items-center border-t pt-4 mt-4">
                    <span className="font-medium">Order Total:</span>
                    <span className="text-xl font-bold">₱{order.total_amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt Dialog */}
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>Review the payment receipt uploaded by the customer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                {order.receipt_url ? (
                  <Image
                    src={order.receipt_url || "/placeholder.svg"}
                    alt="Payment Receipt"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No receipt available</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Order Amount: ₱{order.total_amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Payment Method: {formatPaymentMethod(order.payment_method)}</p>
                </div>
                {order.status === "pending" && (
                  <Button onClick={verifyReceipt} disabled={isVerifying} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isVerifying ? "Verifying..." : "Verify & Confirm"}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
