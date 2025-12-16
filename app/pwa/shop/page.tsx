"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Filter, X, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  photo_url?: string | null
  photos?: string | string[]
  stock_quantity: number
  is_on_sale?: boolean
  discount_type?: string | null
  discount_value?: number | null
  discount_start_date?: string | null
  discount_end_date?: string | null
}

interface CartItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
  photo?: string
  photos?: string[]
  photo_url?: string | null
  stock_quantity: number // Added stock_quantity to CartItem interface
}

interface Category {
  id: number
  name: string
}

export default function PWAShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    loadCart()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/client/products", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const filterProducts = () => {
    let filtered = Array.isArray(products) ? [...products] : []

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const loadCart = () => {
    const savedCart = localStorage.getItem("pwa_cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem("pwa_cart", JSON.stringify(newCart))
    setCart(newCart)
  }

  const getProductImage = (product: Product): string => {
    if (product.photos) {
      try {
        const photosArray = typeof product.photos === "string" ? JSON.parse(product.photos) : product.photos
        if (Array.isArray(photosArray) && photosArray.length > 0) {
          return photosArray[0]
        }
      } catch (e) {
        console.error("Error parsing photos:", e)
      }
    }

    if (product.photo_url) {
      return product.photo_url
    }

    return "/placeholder.svg?height=200&width=200"
  }

  const calculatePrice = (product: Product) => {
    const price = Number(product.price || 0)
    const now = new Date()
    const isValidDiscount =
      product.is_on_sale &&
      product.discount_value &&
      (!product.discount_start_date || new Date(product.discount_start_date) <= now) &&
      (!product.discount_end_date || new Date(product.discount_end_date) >= now)

    if (!isValidDiscount) {
      return {
        originalPrice: price,
        finalPrice: price,
        hasDiscount: false,
      }
    }

    let finalPrice = price

    if (product.discount_type === "percentage") {
      finalPrice = price - (price * (product.discount_value || 0)) / 100
    } else if (product.discount_type === "fixed") {
      finalPrice = Math.max(0, price - (product.discount_value || 0))
    }

    return {
      originalPrice: price,
      finalPrice,
      hasDiscount: true,
      discountPercentage:
        product.discount_type === "percentage"
          ? product.discount_value
          : Math.round(((price - finalPrice) / price) * 100),
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id)
    const currentCartQuantity = existingItem ? existingItem.quantity : 0
    const newTotalQuantity = currentCartQuantity + 1
    const stockQuantity = Number(product.stock_quantity || 0)

    if (newTotalQuantity > stockQuantity) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${stockQuantity} units available. You already have ${currentCartQuantity} in your cart.`,
        variant: "destructive",
      })
      return
    }

    const priceInfo = calculatePrice(product)
    const priceToUse = priceInfo.finalPrice

    let photosArray: string[] = []
    if (product.photos) {
      try {
        photosArray = typeof product.photos === "string" ? JSON.parse(product.photos) : product.photos
      } catch (e) {
        console.error("Error parsing photos:", e)
      }
    }

    const productImage = photosArray.length > 0 ? photosArray[0] : product.photo_url || ""

    if (existingItem) {
      const newCart = cart.map((item) =>
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
      saveCart(newCart)
    } else {
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: priceToUse,
        photo: productImage,
        photos: photosArray,
        photo_url: product.photo_url,
        stock_quantity: stockQuantity, // Include stock_quantity in cart item
      }
      saveCart([...cart, newItem])
    }

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shop</h1>
            <p className="text-sm text-blue-100">Browse pet products</p>
          </div>
          <Button
            onClick={() => router.push("/pwa/shop/checkout")}
            className="relative bg-white text-blue-600 hover:bg-blue-50"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const priceInfo = calculatePrice(product)
              const cartItem = cart.find((item) => item.product_id === product.id)
              const cartQuantity = cartItem ? cartItem.quantity : 0
              const stockQuantity = Number(product.stock_quantity || 0)
              const isAtStockLimit = cartQuantity >= stockQuantity
              const remainingStock = stockQuantity - cartQuantity

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={getProductImage(product) || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                    {priceInfo.hasDiscount && (
                      <Badge className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {priceInfo.discountPercentage}%
                      </Badge>
                    )}
                    {stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      {priceInfo.hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-600">₱{priceInfo.finalPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 line-through">
                            ₱{priceInfo.originalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold">₱{priceInfo.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    {cartQuantity > 0 && (
                      <p className="text-xs text-gray-600 mb-1">
                        In cart: {cartQuantity} | Available: {remainingStock}
                      </p>
                    )}
                    {isAtStockLimit && stockQuantity > 0 && (
                      <p className="text-xs text-orange-600 font-semibold mb-1">Stock limit reached</p>
                    )}
                    <Button
                      className="w-full h-8 text-xs"
                      onClick={() => addToCart(product)}
                      disabled={stockQuantity === 0 || isAtStockLimit}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      {isAtStockLimit ? "Limit Reached" : "Add"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No products found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
