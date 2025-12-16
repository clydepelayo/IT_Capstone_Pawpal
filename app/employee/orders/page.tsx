"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeSidebar } from "@/components/employee-sidebar"
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
  Package,
  Clock,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Eye,
  FileImage,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Order {
  id: number
  order_number: string
  client_name: string
  user_email: string
  order_date: string
  total_amount: number
  status: string
  payment_method: string
  receipt_url?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: string
}

export default function EmployeeOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [verifyingOrderId, setVerifyingOrderId] = useState<number | null>(null)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const url = filterStatus === "all" ? "/api/admin/orders" : `/api/admin/orders?status=${filterStatus}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch orders.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching orders.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Status updated",
          description: `Order status has been updated to ${formatStatusDisplay(newStatus)}.`,
        })
        fetchOrders()
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
      setUpdatingOrderId(null)
    }
  }

  const verifyReceipt = async (orderId: number) => {
    try {
      setVerifyingOrderId(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}/verify-receipt`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Receipt Verified",
          description: "Payment receipt has been verified and order status updated to confirmed.",
        })
        setShowReceiptDialog(false)
        setSelectedReceipt(null)
        fetchOrders()
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
      setVerifyingOrderId(null)
    }
  }

  const openReceiptDialog = (order: Order) => {
    setSelectedReceipt(order)
    setShowReceiptDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "ready-to-pickup":
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
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "ready-to-pickup":
        return <ShoppingBag className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getReceiptBadge = (order: Order) => {
    if (!order.receipt_url) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          No Receipt
        </Badge>
      )
    }

    if (["confirmed", "processing", "ready-to-pickup", "completed"].includes(order.status)) {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-green-600 hover:bg-green-700 cursor-pointer"
          onClick={() => openReceiptDialog(order)}
        >
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      )
    }

    if (order.status === "pending") {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-orange-600 hover:bg-orange-700 cursor-pointer"
          onClick={() => openReceiptDialog(order)}
        >
          <FileImage className="h-3 w-3" />
          Pending
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => openReceiptDialog(order)}>
        <FileImage className="h-3 w-3" />
        View Receipt
      </Badge>
    )
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
    if (!dateString || dateString === "N/A") return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const formatStatusDisplay = (status: string) => {
    switch (status) {
      case "ready-to-pickup":
        return "Ready to Pickup"
      case "completed":
        return "Completed"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const pendingReceiptsCount = orders.filter((order) => order.receipt_url && order.status === "pending").length

  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/employee/appointments">Employee Portal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Orders Management</h1>
              <p className="text-gray-600">View and manage all customer orders</p>
            </div>
            {pendingReceiptsCount > 0 && (
              <Badge variant="default" className="bg-orange-600 text-lg px-4 py-2">
                {pendingReceiptsCount} Receipt{pendingReceiptsCount !== 1 ? "s" : ""} Pending
              </Badge>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>Complete list of customer orders</CardDescription>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="ready-to-pickup">Ready to Pickup</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No orders found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number || `ORD-${String(order.id).padStart(4, "0")}`}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name || order.client_name}</p>
                              <p className="text-sm text-gray-500">{order.customer_email || order.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.order_date)}</TableCell>
                          <TableCell className="font-semibold">₱{order.total_amount.toLocaleString()}</TableCell>
                          <TableCell>{formatPaymentMethod(order.payment_method)}</TableCell>
                          <TableCell>{getReceiptBadge(order)}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                              disabled={updatingOrderId === order.id}
                            >
                              <SelectTrigger className="w-40">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(order.status)}
                                  <span>{formatStatusDisplay(order.status)}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="ready-to-pickup">Ready to Pickup</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/employee/orders/${order.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {order.receipt_url && order.status === "pending" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => verifyReceipt(order.id)}
                                  disabled={verifyingOrderId === order.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  {verifyingOrderId === order.id ? "Verifying..." : "Verify"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>
                Order: {selectedReceipt?.order_number || `ORD-${String(selectedReceipt?.id).padStart(4, "0")}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                {selectedReceipt?.receipt_url ? (
                  <Image
                    src={selectedReceipt.receipt_url || "/placeholder.svg"}
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
                  <p className="text-sm font-medium">Order Amount: ₱{selectedReceipt?.total_amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Payment Method: {formatPaymentMethod(selectedReceipt?.payment_method || "")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Customer: {selectedReceipt?.customer_name || selectedReceipt?.client_name}
                  </p>
                </div>
                {selectedReceipt && selectedReceipt.status === "pending" && (
                  <Button
                    onClick={() => verifyReceipt(selectedReceipt.id)}
                    disabled={verifyingOrderId === selectedReceipt.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {verifyingOrderId === selectedReceipt.id ? "Verifying..." : "Verify & Confirm"}
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
