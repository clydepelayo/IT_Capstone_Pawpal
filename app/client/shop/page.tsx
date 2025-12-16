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

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  photo_url?: string | null
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
  photo_url?: string | null
  stock_quantity?: number
}

interface Category {
  id: number
  name: string
}

export default function ShopPage() {
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
        console.log("Products fetched:", data)
        setProducts(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch products")
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
        console.log("Categories fetched:", data)
        setCategories(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch categories")
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
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
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(newCart))
    setCart(newCart)
  }

  const getProductImage = (product: Product): string => {
    // Use photo_url if available
    if (product.photo_url) {
      return product.photo_url
    }

    // Default placeholder
    return "/placeholder.svg?height=200&width=200"
  }

  const calculatePrice = (product: Product) => {
    const basePrice = Number(product.price)
    const now = new Date()
    const isValidDiscount =
      product.is_on_sale &&
      product.discount_value &&
      (!product.discount_start_date || new Date(product.discount_start_date) <= now) &&
      (!product.discount_end_date || new Date(product.discount_end_date) >= now)

    if (!isValidDiscount) {
      return {
        originalPrice: basePrice,
        finalPrice: basePrice,
        hasDiscount: false,
      }
    }

    let finalPrice = basePrice

    if (product.discount_type === "percentage") {
      finalPrice = basePrice - (basePrice * (product.discount_value || 0)) / 100
    } else if (product.discount_type === "fixed") {
      finalPrice = Math.max(0, basePrice - (product.discount_value || 0))
    }

    return {
      originalPrice: basePrice,
      finalPrice,
      hasDiscount: true,
      discountPercentage:
        product.discount_type === "percentage"
          ? product.discount_value
          : Math.round(((basePrice - finalPrice) / basePrice) * 100),
    }
  }

  const addToCart = (product: Product) => {
    const priceInfo = calculatePrice(product)
    const priceToUse = priceInfo.finalPrice

    const productImage = product.photo_url || ""

    const existingItem = cart.find((item) => item.product_id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast({
          title: "Stock limit reached",
          description: `Only ${product.stock_quantity} items available in stock`,
          variant: "destructive",
        })
        return
      }

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
        photo_url: product.photo_url,
        stock_quantity: product.stock_quantity,
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
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/client">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Shop</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="container mx-auto py-8 px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
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
              <BreadcrumbItem>
                <BreadcrumbLink href="/client">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shop</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Shop</h1>
              <p className="text-gray-600 mt-2">Browse our selection of pet products</p>
            </div>
            <Button onClick={() => router.push("/client/shop/checkout")} className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {Array.isArray(categories) &&
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchTerm || selectedCategory !== "all") && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchTerm}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Category: {selectedCategory}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Grid */}
          {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const priceInfo = calculatePrice(product)
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={getProductImage(product) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                      {priceInfo.hasDiscount && (
                        <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-700">
                          <Tag className="h-3 w-3 mr-1" />
                          {priceInfo.discountPercentage}% OFF
                        </Badge>
                      )}
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                          {priceInfo.hasDiscount ? (
                            <>
                              <span className="text-lg font-bold text-blue-600">
                                ₱{priceInfo.finalPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₱{priceInfo.originalPrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold">₱{Number(product.price).toFixed(2)}</span>
                          )}
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => addToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
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
      </SidebarInset>
    </SidebarProvider>
  )
}
