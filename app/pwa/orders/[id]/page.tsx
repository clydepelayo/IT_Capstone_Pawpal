"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, MapPin, CreditCard, Phone, Mail, FileText, Receipt, X } from "lucide-react"
import Image from "next/image"

interface OrderItem {
  id: number
  product_name: string
  quantity: number
  price: number
  photo_url?: string
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  payment_method: string
  total_amount: number
  subtotal: number
  shipping_fee: number
  status: string
  notes?: string
  receipt_url?: string
  created_at: string
}

export default function PWAOrderDetails() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
      fetchOrderItems()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderItems = async () => {
    try {
      const response = await fetch(`/api/client/orders/${orderId}/items`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Error fetching order items:", error)
    }
  }

  const handleCancelOrder = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch(`/api/client/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        fetchOrderDetails()
        setShowCancelDialog(false)
      } else {
        alert("Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      alert("An error occurred while cancelling the order")
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "ready-to-pickup":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (amount: any): string => {
    const numAmount = Number(amount)
    if (isNaN(numAmount)) return "₱0.00"
    return `₱${numAmount.toFixed(2)}`
  }

  const canCancelOrder = order?.status === "pending-payment" || order?.status === "confirmed"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Order not found</p>
          <Button className="mt-4" onClick={() => router.push("/pwa/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Order Details</h1>
              <p className="text-xs text-blue-100">{order.order_number}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Status</p>
                <Badge className={`${getStatusColor(order.status)} text-sm`}>{order.status.replace("-", " ")}</Badge>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">Placed on {formatDate(order.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url || "/placeholder.svg"}
                      alt={item.product_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{item.product_name}</h4>
                  <p className="text-xs text-gray-600 mb-1">Quantity: {item.quantity}</p>
                  <p className="font-semibold text-blue-600">{formatPrice(item.price)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{formatPrice(Number(item.price) * item.quantity)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{order.customer_name}</p>
                <p className="text-sm text-gray-600">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">{order.shipping_address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shipping Fee:</span>
              <span className="font-medium">{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-blue-600">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-sm capitalize">{order.payment_method}</span>
            </div>
          </CardContent>
        </Card>

        {/* Receipt */}
        {order.receipt_url && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={order.receipt_url || "/placeholder.svg"}
                  alt="Payment Receipt"
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Cancel Button */}
        {canCancelOrder && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
            disabled={isCancelling}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Order
          </Button>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Cancel Order?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isCancelling}
                >
                  No, Keep Order
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleCancelOrder} disabled={isCancelling}>
                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
