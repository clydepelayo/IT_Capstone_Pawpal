"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Receipt,
  Eye,
  Download,
  Banknote,
  Clock,
  CheckCircle,
  Package,
  Calendar,
  ChevronDown,
  MapPin,
  ShoppingBag,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: number
  transaction_type: string
  description: string
  amount: number
  payment_method: string
  status: string
  transaction_date: string
  reference_id: string
  reference_type: string
  appointment_id?: number
  order_id?: number
  created_at: string
  updated_at: string
  service_name?: string
  pet_name?: string
  appointment_date?: string
  appointment_status?: string
  order_number?: string
  order_total?: number
  order_subtotal?: number
  order_shipping_fee?: number
  order_status?: string
  order_payment_method?: string
  order_shipping_address?: string
  order_notes?: string
  order_date?: string
  order_items_count?: number
  order_items_summary?: string
}

export default function ClientTransactions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/client/transactions", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Transactions loaded:", data)
        setTransactions(data)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      setIsExporting(true)

      const params = new URLSearchParams({
        format,
        status: filterStatus,
        type: filterType,
      })

      const response = await fetch(`/api/client/transactions/export?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url

        const filename =
          format === "csv"
            ? `transactions-${new Date().toISOString().split("T")[0]}.csv`
            : `transactions-${new Date().toISOString().split("T")[0]}.json`

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Successful",
          description: `Transactions exported as ${format.toUpperCase()}`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Export Failed",
          description: errorData.message || "Failed to export transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error exporting transactions:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.order_items_summary?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    const matchesType = filterType === "all" || transaction.transaction_type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      case "refunded":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "failed":
        return <XCircle className="h-3 w-3" />
      case "refunded":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "product_purchase":
      case "order":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "service":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />
      case "product_purchase":
      case "order":
        return <Package className="h-4 w-4" />
      case "service":
        return <Receipt className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "product_purchase":
        return "Product Purchase"
      case "appointment":
        return "Appointment"
      case "service":
        return "Service"
      case "order":
        return "Order"
      default:
        return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const formatPaymentMethod = (method: string) => {
    if (!method) return "Not specified"

    switch (method.toLowerCase()) {
      case "gcash":
        return "GCash"
      case "paymaya":
        return "PayMaya"
      case "bank_transfer":
        return "Bank Transfer"
      case "cash_on_delivery":
      case "cod":
        return "Cash on Delivery"
      case "cash":
        return "Cash"
      case "credit_card":
        return "Credit Card"
      case "debit_card":
        return "Debit Card"
      default:
        return method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " ")
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const totalAmount = filteredTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)
  const totalTransactions = filteredTransactions.length
  const completedTransactions = filteredTransactions.filter((t) => t.status === "completed").length
  const pendingTransactions = filteredTransactions.filter((t) => t.status === "pending").length

  const orderTransactions = filteredTransactions.filter((t) => t.transaction_type === "order")
  const appointmentTransactions = filteredTransactions.filter((t) => t.transaction_type === "appointment")

  const thisMonthTransactions = filteredTransactions.filter((t) => {
    const transactionDate = new Date(t.transaction_date)
    const now = new Date()
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear() &&
      t.status === "completed"
    )
  })

  const thisMonthAmount = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transaction History</h1>
              <p className="text-gray-600 dark:text-gray-400">View your payment and transaction records</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent" disabled={isExporting}>
                  <Download className="h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  {orderTransactions.length} orders, {appointmentTransactions.length} appointments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedTransactions}</div>
                <p className="text-xs text-muted-foreground">Successful payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingTransactions}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{thisMonthAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{thisMonthTransactions.length} transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions, orders, pets, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-background"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-background"
              >
                <option value="all">All Types</option>
                <option value="appointment">Appointments</option>
                <option value="order">Orders</option>
                <option value="service">Services</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your complete transaction records from appointments, orders, and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Loading transactions...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(transaction.transaction_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(transaction.transaction_date).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(transaction.transaction_type)} variant="secondary">
                              <div className="flex items-center gap-1">
                                {getTypeIcon(transaction.transaction_type)}
                                {formatTransactionType(transaction.transaction_type)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex flex-col">
                              <span className="font-medium truncate">{transaction.description}</span>
                              {transaction.pet_name && (
                                <span className="text-xs text-muted-foreground">Pet: {transaction.pet_name}</span>
                              )}
                              {transaction.order_number && (
                                <span className="text-xs text-muted-foreground">Order: {transaction.order_number}</span>
                              )}
                              {transaction.order_items_summary && (
                                <span className="text-xs text-muted-foreground truncate">
                                  Items: {transaction.order_items_summary}
                                </span>
                              )}
                              {transaction.transaction_type === "order" && transaction.order_status && (
                                <Badge className={getOrderStatusColor(transaction.order_status)} variant="outline">
                                  Order: {transaction.order_status}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 font-mono">
                            {transaction.reference_id || transaction.order_number || "-"}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {formatPaymentMethod(transaction.payment_method)}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">₱{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(transaction.status)} className="gap-1">
                              {getStatusIcon(transaction.status)}
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setSelectedTransaction(transaction)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getTypeIcon(transaction.transaction_type)}
                                    Transaction Details
                                  </DialogTitle>
                                  <DialogDescription>Complete information about this transaction</DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-6">
                                    {/* Basic Transaction Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                                        <p className="font-mono">{selectedTransaction.id}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Date</label>
                                        <p>
                                          {new Date(selectedTransaction.transaction_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Type</label>
                                        <p>{formatTransactionType(selectedTransaction.transaction_type)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <Badge variant={getStatusColor(selectedTransaction.status)} className="gap-1">
                                          {getStatusIcon(selectedTransaction.status)}
                                          {selectedTransaction.status}
                                        </Badge>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Amount</label>
                                        <p className="text-lg font-semibold">
                                          ₱{selectedTransaction.amount.toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                        <p>{formatPaymentMethod(selectedTransaction.payment_method)}</p>
                                      </div>
                                    </div>

                                    {/* Order Details */}
                                    {selectedTransaction.transaction_type === "order" &&
                                      selectedTransaction.order_number && (
                                        <div className="border-t pt-4">
                                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <ShoppingBag className="h-5 w-5" />
                                            Order Details
                                          </h3>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Order Number</label>
                                              <p className="font-mono">{selectedTransaction.order_number}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Order Status</label>
                                              <Badge
                                                className={getOrderStatusColor(selectedTransaction.order_status || "")}
                                                variant="outline"
                                              >
                                                {selectedTransaction.order_status}
                                              </Badge>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Subtotal</label>
                                              <p>₱{selectedTransaction.order_subtotal?.toLocaleString()}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Shipping Fee</label>
                                              <p>₱{selectedTransaction.order_shipping_fee?.toLocaleString()}</p>
                                            </div>
                                            <div className="col-span-2">
                                              <label className="text-sm font-medium text-gray-500">Items</label>
                                              <p>{selectedTransaction.order_items_summary}</p>
                                            </div>
                                            {selectedTransaction.order_shipping_address && (
                                              <div className="col-span-2">
                                                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                  <MapPin className="h-4 w-4" />
                                                  Shipping Address
                                                </label>
                                                <p className="text-sm">{selectedTransaction.order_shipping_address}</p>
                                              </div>
                                            )}
                                            {selectedTransaction.order_notes && (
                                              <div className="col-span-2">
                                                <label className="text-sm font-medium text-gray-500">Notes</label>
                                                <p className="text-sm">{selectedTransaction.order_notes}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Appointment Details */}
                                    {selectedTransaction.transaction_type === "appointment" &&
                                      selectedTransaction.service_name && (
                                        <div className="border-t pt-4">
                                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Appointment Details
                                          </h3>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Service</label>
                                              <p>{selectedTransaction.service_name}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Pet</label>
                                              <p>{selectedTransaction.pet_name}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">
                                                Appointment Date
                                              </label>
                                              <p>
                                                {selectedTransaction.appointment_date &&
                                                  new Date(selectedTransaction.appointment_date).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                    },
                                                  )}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">
                                                Appointment Status
                                              </label>
                                              <Badge variant="outline">{selectedTransaction.appointment_status}</Badge>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                    {/* Reference Information */}
                                    {selectedTransaction.reference_id && (
                                      <div className="border-t pt-4">
                                        <h3 className="text-lg font-semibold mb-3">Reference Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-500">Reference ID</label>
                                            <p className="font-mono">{selectedTransaction.reference_id}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-500">Reference Type</label>
                                            <p>{selectedTransaction.reference_type}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!isLoading && filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-500">No transactions found.</p>
                    {searchTerm || filterStatus !== "all" || filterType !== "all" ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Try adjusting your search or filter criteria.
                        </p>
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => {
                            setSearchTerm("")
                            setFilterStatus("all")
                            setFilterType("all")
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Transactions will appear here when you book appointments or make purchases.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
