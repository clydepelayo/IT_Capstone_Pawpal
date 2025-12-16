"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard, QrCode, Package } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import Image from "next/image"

interface CartItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
  photo?: string
  stock_quantity?: number // Added stock_quantity to validate against stock limits
}

interface FormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupAddress: string
  paymentMethod: string
  notes: string
}

interface FormErrors {
  [key: string]: string
}

interface PaymentMethodInfo {
  qrCode?: string
  accountName?: string
  accountNumber?: string
  instructions: string[]
  requiresReceipt: boolean
}

const PAYMENT_METHODS: Record<string, PaymentMethodInfo> = {
  gcash: {
    qrCode: "/gcash-qr-code.jpg",
    accountName: "Veterinary Clinic",
    accountNumber: "09XX XXX XXXX",
    requiresReceipt: true,
    instructions: [
      "1. Open your GCash app",
      "2. Scan the QR code above or send to the number",
      "3. Enter the exact amount shown",
      "4. Complete the payment",
      "5. Take a screenshot of the confirmation",
      "6. Upload the receipt below before placing order",
    ],
  },
  paymaya: {
    qrCode: "/paymaya-qr-code.jpg",
    accountName: "Veterinary Clinic",
    accountNumber: "09XX XXX XXXX",
    requiresReceipt: true,
    instructions: [
      "1. Open your PayMaya app",
      "2. Scan the QR code above or send to the number",
      "3. Enter the exact amount shown",
      "4. Complete the payment",
      "5. Take a screenshot of the confirmation",
      "6. Upload the receipt below before placing order",
    ],
  },
  cash: {
    requiresReceipt: false,
    instructions: [
      "1. Review your order details carefully",
      "2. Click 'Place Pickup Order' to confirm",
      "3. Prepare the exact amount for pickup",
      "4. Visit our clinic to collect your order",
      "5. Pay in cash when you pick up your items",
      "6. Please bring a valid ID for verification",
    ],
  },
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string>("")
  const [userData, setUserData] = useState<{
    name: string
    email: string
    phone: string
    address: string
  } | null>(null)
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickupAddress: "",
    paymentMethod: "",
    notes: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load cart
        const loadedCart = loadCart()
        setCart(loadedCart)

        // Fetch user profile
        const response = await fetch("/api/client/profile", {
          credentials: "include",
        })

        if (response.ok) {
          const profile = await response.json()
          const userInfo = {
            name: profile.first_name + " " + profile.last_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
          }
          setUserData(userInfo)
          
          // Auto-populate form data
          setFormData((prev) => ({
            ...prev,
            customerName: userInfo.name,
            customerEmail: userInfo.email,
            customerPhone: userInfo.phone,
            pickupAddress: userInfo.address,
          }))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user information. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const loadCart = (): CartItem[] => {
    try {
      const cartKeys = ["veterinary_cart", "cart", "shop_cart"]
      let loadedCart: CartItem[] = []

      for (const key of cartKeys) {
        const cartData = localStorage.getItem(key)
        if (cartData) {
          try {
            const parsed = JSON.parse(cartData)
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedCart = parsed
              console.log(`Cart loaded from ${key}:`, loadedCart)
              break
            }
          } catch (error) {
            console.log(`Error parsing cart from ${key}:`, error)
          }
        }
      }

      return loadedCart
    } catch (error) {
      console.error("Error loading cart:", error)
      return []
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    try {
      const cartKeys = ["veterinary_cart", "cart", "shop_cart"]
      cartKeys.forEach((key) => {
        localStorage.setItem(key, JSON.stringify(newCart))
      })
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const cartItem = cart.find((item) => item.product_id === productId)
    if (cartItem?.stock_quantity && newQuantity > cartItem.stock_quantity) {
      toast({
        title: "Stock limit reached",
        description: `Only ${cartItem.stock_quantity} items available in stock`,
        variant: "destructive",
      })
      return
    }

    const updatedCart = cart.map((item) => (item.product_id === productId ? { ...item, quantity: newQuantity } : item))
    setCart(updatedCart)
    saveCart(updatedCart)
  }

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter((item) => item.product_id !== productId)
    setCart(updatedCart)
    saveCart(updatedCart)

    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    })
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image (JPG, PNG, GIF).",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    setReceiptFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    if (errors.receipt) {
      setErrors((prev) => ({ ...prev, receipt: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method"
    }

    const selectedMethod = PAYMENT_METHODS[formData.paymentMethod]
    if (selectedMethod?.requiresReceipt && !receiptFile) {
      newErrors.receipt = "Payment receipt is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const errorMessage = PAYMENT_METHODS[formData.paymentMethod]?.requiresReceipt
        ? "Please upload payment receipt."
        : "Please select a payment method."
      
      toast({
        title: "Form Validation Error",
        description: errorMessage,
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Starting order submission...")

      let receiptUrl = null

      const selectedMethod = PAYMENT_METHODS[formData.paymentMethod]
      if (selectedMethod?.requiresReceipt) {
        if (!receiptFile) {
          throw new Error("Receipt file is missing")
        }

        const uploadFormData = new FormData()
        uploadFormData.append("receipt", receiptFile)
        uploadFormData.append("type", "order")

        console.log("Uploading receipt...")
        const uploadResponse = await fetch("/api/client/orders/upload-receipt", {
          method: "POST",
          credentials: "include",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.message || "Failed to upload receipt")
        }

        const uploadResult = await uploadResponse.json()
        receiptUrl = uploadResult.receiptUrl

        console.log("Receipt uploaded successfully:", receiptUrl)
      }

      const orderData = {
        customerName: (userData?.name || formData.customerName || "").trim(),
        customerEmail: (userData?.email || formData.customerEmail || "").trim(),
        customerPhone: (userData?.phone || formData.customerPhone || "").trim(),
        shippingAddress: (userData?.address || formData.pickupAddress || "Pickup at clinic").trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        receiptUrl: receiptUrl,
        items: cart,
        subtotal: getTotal(),
        shippingFee: 0,
        totalAmount: getTotal(),
      }

      console.log("Creating order with data:", orderData)

      const response = await fetch("/api/client/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Order created successfully:", result.orderId || result.order_id)

        setCart([])
        const cartKeys = ["veterinary_cart", "cart", "shop_cart"]
        cartKeys.forEach((key) => {
          localStorage.removeItem(key)
        })

        const successMessage =
          formData.paymentMethod === "cash"
            ? `Your order #${result.orderId || result.order_id} has been placed. Please pay in cash when you pick up your items.`
            : `Your order #${result.orderId || result.order_id} has been placed with payment receipt. Ready for pickup!`

        toast({
          title: "Order Placed Successfully!",
          description: successMessage,
        })

        router.push("/client/orders")
      } else {
        throw new Error(result.message || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPaymentMethodName = (method: string): string => {
    const names: Record<string, string> = {
      gcash: "GCash",
      paymaya: "PayMaya",
      cash: "Cash",
    }
    return names[method] || method
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
                  <BreadcrumbLink href="/client/shop">Shop</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (cart.length === 0) {
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
                  <BreadcrumbLink href="/client/shop">Shop</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Add some products to your cart before proceeding to checkout.
                </p>
                <Button asChild>
                  <Link href="/client/shop">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shop
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const selectedPaymentInfo = formData.paymentMethod ? PAYMENT_METHODS[formData.paymentMethod] : null

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
                <BreadcrumbLink href="/client/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button variant="outline" asChild>
              <Link href="/client/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Link>
            </Button>
          </div>
        </header>
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Checkout - Pickup Order</h1>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Package className="h-4 w-4" />
            <AlertTitle>Pickup Information</AlertTitle>
            <AlertDescription>
              This is a pickup order. Please collect your items from our clinic at your convenience after payment
              confirmation.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your items before placing the order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.photo ? (
                        <Image
                          src={item.photo || "/placeholder.svg"}
                          alt={item.product_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">₱{item.price.toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity} // Disable plus button when stock limit reached
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.product_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">₱{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₱{getTotal().toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">No shipping fee - pickup order</p>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Full Name</Label>
                          <p className="font-medium">{userData.name || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs">Email Address</Label>
                          <p className="font-medium">{userData.email || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Phone Number</Label>
                        <p className="font-medium">{userData.phone || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Address</Label>
                        <p className="font-medium">{userData.address || "Not provided"}</p>
                      </div>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm">
                          To update your information, please visit your{" "}
                          <Link href="/client/profile" className="font-semibold underline">
                            profile page
                          </Link>
                          .
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Loading customer information...</p>
                    </div>
                  )}
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any special instructions or notes for your order"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Select payment method and complete payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="paymaya">PayMaya</SelectItem>
                        <SelectItem value="cash">Cash (Pay at Pickup)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod}</p>}
                  </div>

                  {selectedPaymentInfo && (
                    <>
                      {selectedPaymentInfo.qrCode && (
                        <div
                          className={`flex flex-col items-center space-y-4 p-4 rounded-lg ${
                            formData.paymentMethod === "gcash"
                              ? "bg-blue-50"
                              : formData.paymentMethod === "paymaya"
                                ? "bg-green-50"
                                : "bg-gray-50"
                          }`}
                        >
                          <div className="relative w-64 h-64 bg-white rounded-lg border-2 border-gray-200 p-2">
                            <Image
                              src={selectedPaymentInfo.qrCode || "/placeholder.svg"}
                              alt={`${getPaymentMethodName(formData.paymentMethod)} QR Code`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <Alert
                            className={
                              formData.paymentMethod === "gcash"
                                ? "bg-blue-100 border-blue-300"
                                : formData.paymentMethod === "paymaya"
                                  ? "bg-green-100 border-green-300"
                                  : ""
                            }
                          >
                            <AlertTitle className="text-center font-semibold">
                              {selectedPaymentInfo.accountName}
                            </AlertTitle>
                            <AlertDescription className="text-center space-y-1">
                              <p className="text-lg font-bold">{selectedPaymentInfo.accountNumber}</p>
                              <p
                                className={`text-xl font-bold ${
                                  formData.paymentMethod === "gcash"
                                    ? "text-blue-600"
                                    : formData.paymentMethod === "paymaya"
                                      ? "text-green-600"
                                      : "text-primary"
                                }`}
                              >
                                Amount: ₱{getTotal().toLocaleString()}
                              </p>
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}

                      {formData.paymentMethod === "cash" && (
                        <Alert className="bg-green-50 border-green-200">
                          <AlertTitle className="text-center font-semibold text-green-800">Cash Payment</AlertTitle>
                          <AlertDescription className="text-center space-y-1">
                            <p className="text-2xl font-bold text-green-600">Amount: ₱{getTotal().toLocaleString()}</p>
                            <p className="text-sm text-green-700">Please prepare exact amount for pickup</p>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">
                          {formData.paymentMethod === "cash" ? "Pickup Instructions:" : "Payment Instructions:"}
                        </h4>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          {selectedPaymentInfo.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>

                      {selectedPaymentInfo.requiresReceipt && (
                        <div className="space-y-2">
                          <Label htmlFor="receipt">Upload Payment Receipt *</Label>
                          <Input
                            id="receipt"
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptChange}
                            className={errors.receipt ? "border-red-500" : ""}
                          />
                          {errors.receipt && <p className="text-sm text-red-500">{errors.receipt}</p>}
                          {receiptFile && (
                            <div className="mt-2">
                              <p className="text-sm text-green-600 font-medium">✓ {receiptFile.name}</p>
                              {receiptPreview && (
                                <div className="mt-2 relative w-full h-48 border rounded-lg overflow-hidden">
                                  <Image
                                    src={receiptPreview || "/placeholder.svg"}
                                    alt="Receipt preview"
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          <Alert className="bg-orange-50 border-orange-200">
                            <AlertDescription className="text-sm text-orange-800">
                              <strong>Important:</strong> You must upload your payment receipt before placing the order.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={
                      isSubmitting || (selectedPaymentInfo?.requiresReceipt && !receiptFile) || !formData.paymentMethod
                    }
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Placing Order..." : `Place Pickup Order - ₱${getTotal().toLocaleString()}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
}
