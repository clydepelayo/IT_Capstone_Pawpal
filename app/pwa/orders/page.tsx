"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ChevronRight } from "lucide-react"

interface Order {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
}

export default function PWAOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
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
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatPrice = (amount: any): string => {
    const numAmount = Number(amount)
    if (isNaN(numAmount)) return "₱0.00"
    return `₱${numAmount.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-blue-100">View and track your orders</p>
      </div>

      <div className="p-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400">Your orders will appear here</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/pwa/orders/${order.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-sm">{order.order_number}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getStatusColor(order.status)} text-xs`}>{order.status.replace("-", " ")}</Badge>
                  <span className="font-bold text-blue-600">{formatPrice(order.total_amount)}</span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
