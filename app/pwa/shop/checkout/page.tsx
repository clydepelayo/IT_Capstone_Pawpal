"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard, Package, User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"

interface CartItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
  photo?: string
  stock_quantity: number // Made stock_quantity required instead of optional
}

interface FormData {
  paymentMethod: string
  notes: string
}

interface FormErrors {
  [key: string]: string
}

interface UserData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
}

interface PaymentMethodInfo {
  qrCode?: string
  accountName?: string
  accountNumber?: string
  instructions: string[]
}

const PAYMENT_METHODS: Record<string, PaymentMethodInfo> = {
  gcash: {
    qrCode: "/gcash-qr-code.jpg",
    accountName: "Veterinary Clinic",
    accountNumber: "09XX XXX XXXX",
    instructions: [
      "1. Open your GCash app",
      "2. Scan the QR code or send to the number",
      "3. Enter the exact amount shown",
      "4. Complete the payment",
      "5. Take a screenshot of confirmation",
      "6. Upload the receipt below",
    ],
  },
  paymaya: {
    qrCode: "/paymaya-qr-code.jpg",
    accountName: "Veterinary Clinic",
    accountNumber: "09XX XXX XXXX",
    instructions: [
      "1. Open your PayMaya app",
      "2. Scan the QR code or send to the number",
      "3. Enter the exact amount shown",
      "4. Complete the payment",
      "5. Take a screenshot of confirmation",
      "6. Upload the receipt below",
    ],
  },
  cash: {
    instructions: [
      "1. Your order will be prepared after confirmation",
      "2. Visit our clinic during business hours",
      "3. Bring the exact amount in cash",
      "4. Present your order number at the counter",
      "5. Collect your items after payment",
    ],
  },
}

export default function PWACheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    paymentMethod: "",
    notes: "",
  })
  const [userData, setUserData] = useState<UserData | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadedCart = loadCart()
    setCart(loadedCart)
    fetchUserProfile()
    setIsLoading(false)
  }, [])

  const loadCart = (): CartItem[] => {
    try {
      const cartData = localStorage.getItem("pwa_cart")
      if (cartData) {
        const parsed = JSON.parse(cartData)
        return Array.isArray(parsed) ? parsed : []
      }
      return []
    } catch (error) {
      console.error("Error loading cart:", error)
      return []
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem("pwa_cart", JSON.stringify(newCart))
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const cartItem = cart.find((item) => item.product_id === productId)
    if (cartItem && newQuantity > cartItem.stock_quantity) {
      toast({
        title: "Stock Limit Exceeded",
        description: `Only ${cartItem.stock_quantity} units available for this product.`,
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

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/client/profile", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        toast({
          title: "Profile Error",
          description: "Could not load your profile information.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Profile Error",
        description: "Could not load your profile information.",
        variant: "destructive",
      })
    }
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

    if (formData.paymentMethod === "gcash" || formData.paymentMethod === "paymaya") {
      if (!receiptFile) {
        newErrors.receipt = "Payment receipt is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields.",
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty.",
        variant: "destructive",
      })
      return
    }

    if (!userData) {
      toast({
        title: "Profile Error",
        description: "Could not load your profile information. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let receiptUrl = ""

      if (formData.paymentMethod !== "cash") {
        if (!receiptFile) {
          throw new Error("Receipt file is missing")
        }

        const uploadFormData = new FormData()
        uploadFormData.append("receipt", receiptFile)
        uploadFormData.append("type", "order")

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
      }

      const orderData = {
        customerName: `${userData.first_name} ${userData.last_name}`.trim(),
        customerEmail: userData.email,
        customerPhone: userData.phone,
        shippingAddress: userData.address,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        receiptUrl: receiptUrl,
        items: cart,
        subtotal: getTotal(),
        shippingFee: 0,
        totalAmount: getTotal(),
      }

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
        setCart([])
        localStorage.removeItem("pwa_cart")

        toast({
          title: "Order Placed!",
          description: `Order #${result.orderId || result.order_id} placed successfully.`,
        })

        router.push("/pwa/orders")
      } else {
        throw new Error(result.message || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPaymentInfo = formData.paymentMethod ? PAYMENT_METHODS[formData.paymentMethod] : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <Button variant="ghost" size="sm" onClick={() => router.push("/pwa/shop")} className="text-white mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cart is empty</h3>
              <p className="text-gray-500 text-center mb-6">Add products to your cart first.</p>
              <Button onClick={() => router.push("/pwa/shop")}>Go to Shop</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <Button variant="ghost" size="sm" onClick={() => router.push("/pwa/shop")} className="text-white mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-sm text-blue-100">Complete your order</p>
      </div>

      <div className="p-4 space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Package className="h-4 w-4" />
          <AlertTitle>Pickup Order</AlertTitle>
          <AlertDescription className="text-sm">
            Collect items from our clinic after payment confirmation.
          </AlertDescription>
        </Alert>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                  {item.photo ? (
                    <Image
                      src={item.photo || "/placeholder.svg"}
                      alt={item.product_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.product_name}</h4>
                  <p className="text-xs text-gray-500">₱{item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="h-7 w-7 p-0 ml-1"
                    disabled={item.quantity >= item.stock_quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.product_id)}
                    className="h-7 w-7 p-0 ml-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">₱{getTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Information
              </CardTitle>
              <Link href="/pwa/profile">
                <Button variant="outline" size="sm">
                  Update Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {userData ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium">{`${userData.first_name} ${userData.last_name}`}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-medium">{userData.phone || "Not provided"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{userData.address || "Not provided"}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add special instructions or notes"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm">
                Payment Method *
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
              >
                <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="paymaya">PayMaya</SelectItem>
                  <SelectItem value="cash">Cash (Pay at Pickup)</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod}</p>}
            </div>

            {selectedPaymentInfo && (
              <>
                {formData.paymentMethod === "cash" ? (
                  <Alert className="bg-green-50 border-green-200">
                    <Package className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Cash Payment</AlertTitle>
                    <AlertDescription className="text-green-700">
                      <p className="font-semibold mb-2">Total Amount: ₱{getTotal().toFixed(2)}</p>
                      <div className="space-y-1 text-xs">
                        {selectedPaymentInfo.instructions.map((instruction, index) => (
                          <p key={index}>{instruction}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div
                      className={`flex flex-col items-center space-y-3 p-3 rounded-lg ${
                        formData.paymentMethod === "gcash" ? "bg-blue-50" : "bg-green-50"
                      }`}
                    >
                      <div className="relative w-48 h-48 bg-white rounded-lg border p-2">
                        <Image
                          src={selectedPaymentInfo.qrCode || "/placeholder.svg"}
                          alt="QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{selectedPaymentInfo.accountName}</p>
                        <p className="text-sm">{selectedPaymentInfo.accountNumber}</p>
                        <p
                          className={`text-lg font-bold mt-1 ${
                            formData.paymentMethod === "gcash" ? "text-blue-600" : "text-green-600"
                          }`}
                        >
                          ₱{getTotal().toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      {selectedPaymentInfo.instructions.map((instruction, index) => (
                        <p key={index}>{instruction}</p>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receipt" className="text-sm">
                        Upload Receipt *
                      </Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptChange}
                        className={errors.receipt ? "border-red-500" : ""}
                      />
                      {errors.receipt && <p className="text-xs text-red-500">{errors.receipt}</p>}
                      {receiptFile && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600">✓ {receiptFile.name}</p>
                          {receiptPreview && (
                            <div className="mt-2 relative w-full h-32 border rounded overflow-hidden">
                              <Image
                                src={receiptPreview || "/placeholder.svg"}
                                alt="Receipt"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full"
              disabled={
                isSubmitting ||
                !formData.paymentMethod ||
                (formData.paymentMethod !== "cash" && !receiptFile) ||
                !userData
              }
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isSubmitting ? "Placing Order..." : `Place Order - ₱${getTotal().toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
