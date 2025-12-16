"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Heart,
  PawPrint,
  ShoppingBag,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  X,
  User,
  LogOut,
  Phone,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Smartphone,
  Zap,
  Bell,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClientChatbot } from "@/components/client-chatbot"

interface UserProfile {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string // Changed from category_name to category
  photos: string[]
  photo_url: string | null
  discount_type?: string | null
  discount_value?: number | null
  is_on_sale?: boolean
  sale_price?: number
  discount_amount?: number
}

interface CartItem {
  product_id: number
  product_name: string
  quantity: number
  price: number
  photo?: string
  stock_quantity?: number // Added stock_quantity to validate against stock limits
}

interface HomepageSlide {
  id: number
  title: string
  subtitle: string
  button_text: string
  button_link: string
  discount_text: string
  background_color: string
  text_color: string
  image_url_1: string | null
  image_url_2: string | null
  is_active: boolean
  display_order: number
}

interface HomepageSection {
  id: number
  section_name: string
  title: string
  subtitle: string
  content: string | null
  image_url: string | null
  is_active: boolean
}

// Helper function to convert Tailwind class to inline style
const getBackgroundStyle = (colorClass: string): React.CSSProperties => {
  // Handle gradient classes
  if (colorClass.includes("gradient")) {
    // Extract gradient direction and colors
    if (colorClass.includes("from-green") && colorClass.includes("to-green")) {
      return {
        background: "linear-gradient(to right, #4ade80, #16a34a)",
      }
    }
    if (colorClass.includes("from-blue") && colorClass.includes("to-blue")) {
      return {
        background: "linear-gradient(to right, #60a5fa, #1e40af)",
      }
    }
    if (colorClass.includes("from-purple") && colorClass.includes("to-purple")) {
      return {
        background: "linear-gradient(to right, #c084fc, #7e22ce)",
      }
    }
    if (colorClass.includes("from-orange") && colorClass.includes("to-orange")) {
      return {
        background: "linear-gradient(to right, #fb923c, #c2410c)",
      }
    }
    if (colorClass.includes("from-red") && colorClass.includes("to-red")) {
      return {
        background: "linear-gradient(to right, #f87171, #dc2626)",
      }
    }
  }

  // Default fallback
  return {
    background: "linear-gradient(to right, #3b82f6, #1e40af)",
  }
}

const getTextColorStyle = (colorClass: string): React.CSSProperties => {
  if (colorClass.includes("text-white")) {
    return { color: "#ffffff" }
  }
  if (colorClass.includes("text-black") || colorClass.includes("text-gray-900")) {
    return { color: "#111827" }
  }
  return { color: "#ffffff" }
}

export default function ClientHomePage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [homepageSlides, setHomepageSlides] = useState<HomepageSlide[]>([])
  const [homepageSections, setHomepageSections] = useState<Record<string, HomepageSection>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { toast } = useToast()

  // PWA state and handlers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    checkLoginStatus()
    fetchProducts()
    fetchHomepageContent()
    loadCart()

    // PWA installation prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (homepageSlides.length > 0) {
      const interval = setInterval(() => {
        handleNextSlide()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [homepageSlides.length, currentSlide])

  const checkLoginStatus = async () => {
    try {
      const profileResponse = await fetch("/api/client/profile", {
        credentials: "include",
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error checking login status:", error)
      setIsLoggedIn(false)
      setUserProfile(null)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        setIsLoggedIn(false)
        setUserProfile(null)
        toast({
          title: "Logged out successfully",
          description: "You have been logged out.",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout.",
        variant: "destructive",
      })
    }
  }

  const fetchProducts = async () => {
    try {
      console.log("Fetching sale products...")
      // Fetch products on sale
      const saleResponse = await fetch("/api/client/products?onSale=true", {
        credentials: "include",
      })

      if (saleResponse.ok) {
        const saleData = await saleResponse.json()
        console.log("Sale products received:", saleData)
        setSaleProducts(saleData.slice(0, 6))
      } else {
        console.error("Failed to fetch sale products:", saleResponse.status)
      }

      // Fetch featured products
      const featuredResponse = await fetch("/api/client/products?featured=true", {
        credentials: "include",
      })

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        console.log("Featured products received:", featuredData)
        setFeaturedProducts(featuredData.slice(0, 3))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchHomepageContent = async () => {
    try {
      const response = await fetch("/api/client/homepage", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setHomepageSlides(data.slides || [])
        setHomepageSections(data.sections || {})
      }
    } catch (error) {
      console.error("Error fetching homepage content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCart = () => {
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
              break
            }
          } catch (error) {
            console.log(`Error parsing cart from ${key}:`, error)
          }
        }
      }

      setCart(loadedCart)
    } catch (error) {
      console.error("Error loading cart:", error)
      setCart([])
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    try {
      const cartKeys = ["veterinary_cart", "cart", "shop_cart"]
      cartKeys.forEach((key) => {
        localStorage.setItem(key, JSON.stringify(newCart))
      })
      setCart(newCart)
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id)

    if (existingItem) {
      // Check against the stock_quantity of the existing item in the cart
      if (existingItem.stock_quantity !== undefined && existingItem.quantity >= existingItem.stock_quantity) {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${existingItem.stock_quantity} items available in stock.`,
          variant: "destructive",
        })
        return
      }

      const updatedCart = cart.map((item) =>
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
      saveCart(updatedCart)
    } else {
      const priceToUse = product.sale_price || product.price
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: priceToUse,
        photo: product.photo_url || undefined,
        stock_quantity: product.stock_quantity, // Include stock_quantity when adding to cart
      }
      saveCart([...cart, newItem])
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    // Get the current item's stock_quantity to check against the new quantity
    const currentItem = cart.find((item) => item.product_id === productId)
    if (currentItem && currentItem.stock_quantity !== undefined && newQuantity > currentItem.stock_quantity) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${currentItem.stock_quantity} items available in stock.`,
        variant: "destructive",
      })
      return
    }

    const updatedCart = cart.map((item) => (item.product_id === productId ? { ...item, quantity: newQuantity } : item))
    saveCart(updatedCart)
  }

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter((item) => item.product_id !== productId)
    saveCart(updatedCart)

    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to proceed with checkout.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
    setIsCartOpen(false)
    router.push("/client/shop/checkout")
  }

  const handleBookAppointment = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to book an appointment.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
    router.push("/client/appointments/book")
  }

  const handleNextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % homepageSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + homepageSlides.length) % homepageSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const getInitials = () => {
    if (!userProfile) return "G"
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    }
    if (userProfile.first_name) return userProfile.first_name[0].toUpperCase()
    if (userProfile.email) return userProfile.email[0].toUpperCase()
    return "U"
  }

  const getFullName = () => {
    if (!userProfile) return "Guest"
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    return userProfile.first_name || userProfile.email || "User"
  }

  const getDiscountPercentage = (product: Product): number => {
    if (!product.is_on_sale) return 0
    const price = Number(product.price || 0)
    const discountValue = Number(product.discount_value || 0)

    if (product.discount_type === "percentage" && discountValue) {
      return discountValue
    }
    if (product.discount_type === "fixed" && discountValue) {
      return Math.round((discountValue / price) * 100)
    }
    return 0
  }

  const getSalePrice = (product: Product): number => {
    const price = Number(product.price || 0)
    const salePrice = Number(product.sale_price || 0)
    const discountValue = Number(product.discount_value || 0)

    if (salePrice) return salePrice
    if (!product.is_on_sale) return price

    if (product.discount_type === "percentage" && discountValue) {
      return price * (1 - discountValue / 100)
    }
    if (product.discount_type === "fixed" && discountValue) {
      return price - discountValue
    }
    return price
  }

  const getSavingsAmount = (product: Product): number => {
    const price = Number(product.price || 0)
    return price - getSalePrice(product)
  }

  // PWA Install Handler
  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA installation")
          toast({
            title: "App Installed!",
            description: "You can now use our app offline.",
          })
        } else {
          console.log("User dismissed PWA installation")
        }
        setDeferredPrompt(null)
        setIsInstallable(false)
      })
    } else {
      toast({
        title: "Installation Failed",
        description: "Could not initiate installation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const services = [
    {
      icon: Shield,
      title: "Veterinary Care",
      description: "Complete medical care including checkups, vaccinations, and emergency services.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      action: () => handleBookAppointment(),
    },
    {
      icon: Sparkles,
      title: "Pet Grooming",
      description: "Professional grooming services to keep your pets clean, healthy, and looking great.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      action: () => handleBookAppointment(),
    },
    {
      icon: Clock,
      title: "Pet Boarding",
      description: "Safe and comfortable boarding facilities when you need to travel.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      action: () => handleBookAppointment(),
    },
    {
      icon: Heart,
      title: "Pet Shop",
      description: "Quality pet food, toys, accessories, and health products for your pets.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      action: () => router.push("/client/shop"),
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentPromo = homepageSlides[currentSlide]
  const heroSection = homepageSections.hero
  const servicesSection = homepageSections.services
  const featuredSection = homepageSections.featured_products
  const offersSection = homepageSections.special_offers
  const actionsSection = homepageSections.quick_actions

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/client" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-gray-900">Pawpal</span>
              </Link>
              <div className="hidden md:flex space-x-8">
                <a href="#services" className="text-gray-600 hover:text-gray-900 font-medium">
                  Services
                </a>
                <a href="#products" className="text-gray-600 hover:text-gray-900 font-medium">
                  Products
                </a>
                <a href="#offers" className="text-gray-600 hover:text-gray-900 font-medium">
                  Offers
                </a>
                {/* Contact navigation link */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector("#contact")
                    element?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  Contact
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Cart Sheet */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative bg-transparent">
                    <ShoppingCart className="h-4 w-4" />
                    {getCartItemCount() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-blue-500">
                        {getCartItemCount()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({getCartItemCount()} items)</SheetTitle>
                    <SheetDescription>Review your items before checkout</SheetDescription>
                  </SheetHeader>
                  <div className="mt-8 space-y-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                        <Button className="mt-4" onClick={() => setIsCartOpen(false)} asChild>
                          <Link href="/client/shop">Browse Products</Link>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                          {cart.map((item) => (
                            <Card key={item.product_id}>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                    {item.photo ? (
                                      <img
                                        src={item.photo || "/placeholder.svg"}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover rounded"
                                      />
                                    ) : (
                                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{item.product_name}</h4>
                                    <p className="text-sm text-gray-600">₱{Number(item.price || 0).toFixed(2)}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFromCart(item.product_id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span>₱{getCartTotal().toFixed(2)}</span>
                          </div>
                          <Button className="w-full" size="lg" onClick={handleCheckout}>
                            Proceed to Checkout
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* User Menu */}
              {isLoggedIn && userProfile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-blue-500 text-white">{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-3 p-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-500 text-white text-lg">{getInitials()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-none">{getFullName()}</p>
                            <p className="text-xs text-muted-foreground mt-1">{userProfile.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 pt-2 border-t">
                          {userProfile.phone && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-2" />
                              {userProfile.phone}
                            </div>
                          )}
                          {userProfile.address && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-2" />
                              {userProfile.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/client/myactivity" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Activity
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/client/pets" className="cursor-pointer">
                        <PawPrint className="mr-2 h-4 w-4" />
                        My Pets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/client/appointments" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Appointments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/client/orders" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Carousel Banner */}
      {homepageSlides.length > 0 && currentPromo && (
        <section className="relative overflow-hidden h-[500px]">
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={getBackgroundStyle(currentPromo.background_color)}
          >
            <div className="container mx-auto px-4 h-full">
              <div className="flex items-center justify-center h-full py-12">
                <div
                  className="max-w-3xl text-center space-y-6 z-10"
                  style={getTextColorStyle(currentPromo.text_color)}
                >
                  <div className="absolute top-8 right-8 bg-red-600 text-white rounded-full w-28 h-28 flex items-center justify-center z-20 shadow-2xl animate-bounce-slow">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{currentPromo.discount_text}</div>
                      <div className="text-sm">OFF</div>
                    </div>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                    {currentPromo.title}
                  </h1>
                  <p className="text-xl md:text-3xl opacity-90 animate-fade-in-up animation-delay-200">
                    {currentPromo.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg text-lg px-10 py-7 animate-fade-in-up animation-delay-400"
                    asChild
                  >
                    <Link href={currentPromo.button_link}>
                      {currentPromo.button_text}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full transition-all duration-200 shadow-xl z-30 hover:scale-110"
            aria-label="Previous slide"
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full transition-all duration-200 shadow-xl z-30 hover:scale-110"
            aria-label="Next slide"
            disabled={isTransitioning}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
            {homepageSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "bg-white w-12 h-3 shadow-lg"
                    : "bg-white/50 hover:bg-white/70 w-3 h-3 hover:scale-110"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Hero Section */}
      {heroSection && (
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {heroSection.title.split(" ").map((word, index) =>
                  word === "Beloved" || word === "Pets" ? (
                    <span key={index} className="text-blue-500">
                      {word}{" "}
                    </span>
                  ) : (
                    <span key={index}>{word} </span>
                  ),
                )}
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">{heroSection.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                  onClick={handleBookAppointment}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-gray-300 bg-transparent"
                  onClick={() => router.push("/client/shop")}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Products
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PWA Download Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-800 text-sm px-4 py-1">
                <Smartphone className="h-4 w-4 mr-2 inline" />
                Mobile App Available
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Download Our Mobile App</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get instant access to all our services on your mobile device. Book appointments, shop products, and
                manage your pets on the go!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                <Zap className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Fast & Easy</h3>
                <p className="text-gray-600 text-center">
                  Access services quickly and efficiently right from your phone.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
                <Bell className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h3>
                <p className="text-gray-600 text-center">Receive notifications for appointments, offers, and more.</p>
              </div>
            </div>

            <div className="text-center">
              {isInstallable && (
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={handleInstallPWA}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
              )}
              {!isInstallable && (
                <p className="text-lg text-gray-700">The app is already installed or not supported on this device.</p>
              )}
              {/* Placeholder for App Store/Google Play links if not using PWA install */}
              {/* <div className="flex justify-center space-x-4 mt-8">
                <Link href="#" className="grayscale hover:grayscale-0 transition-all duration-300">
                  <Image src="/app-store-badge.png" alt="Download on the App Store" width={150} height={50} />
                </Link>
                <Link href="#" className="grayscale hover:grayscale-0 transition-all duration-300">
                  <Image src="/google-play-badge.png" alt="Get it on Google Play" width={150} height={50} />
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{servicesSection?.title || "Our Services"}</h2>
            <p className="text-xl text-gray-600">
              {servicesSection?.subtitle || "Comprehensive care for your furry friends"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="text-center group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 cursor-pointer"
                onClick={service.action}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                    <service.icon className="h-8 w-8 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <Button variant="link" className="text-blue-500 p-0">
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{featuredSection?.title || "Featured Products"}</h2>
            <p className="text-xl text-gray-600">
              {featuredSection?.subtitle || "Quality products for your pet's health and happiness"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center min-h-[200px] group-hover:bg-gray-200 transition-colors">
                    <Image
                      src={
                        product.photo_url ||
                        "/placeholder.svg?height=150&width=150&query=pet+product" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={product.name}
                      width={150}
                      height={150}
                      className="object-contain"
                    />
                  </div>
                  <Badge className="mb-2">{product.category}</Badge>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">₱{Number(product.price).toFixed(2)}</span>
                    {product.stock_quantity && product.stock_quantity > 0 ? (
                      <span className="text-xs text-green-600">{product.stock_quantity} in stock</span>
                    ) : (
                      <span className="text-xs text-red-600">Out of stock</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => addToCart(product)}
                      disabled={!product.stock_quantity || product.stock_quantity === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/client/shop?product=${product.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/client/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Special Offers Section - Enhanced Design */}
      {saleProducts.length > 0 && (
        <section
          id="offers"
          className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 mb-4 animate-bounce-slow">
                <Sparkles className="h-8 w-8 text-orange-500" />
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-6 py-2">
                  Limited Time Deals
                </Badge>
                <Sparkles className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">{offersSection?.title || "🔥 Special Offers"}</h2>
              <p className="text-xl text-gray-700">
                {offersSection?.subtitle || "Don't miss out on these amazing deals - Save big today!"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {saleProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-2xl transition-all duration-500 relative overflow-hidden border-0 bg-white hover:scale-105"
                >
                  {/* Decorative Corner Accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-400 to-transparent opacity-20 rounded-bl-full"></div>

                  {/* Animated Discount Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                      <div className="relative bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-4 border-white">
                        <div className="text-center">
                          <div className="text-2xl font-black leading-none">{getDiscountPercentage(product)}%</div>
                          <div className="text-[10px] font-bold">OFF</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Product Image with Gradient Background */}
                    <div className="bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-xl p-6 mb-6 flex items-center justify-center min-h-[220px] group-hover:from-orange-200 group-hover:via-red-200 group-hover:to-pink-200 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Image
                        src={
                          product.photo_url ||
                          "/placeholder.svg?height=180&width=180&query=pet+product" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        width={180}
                        height={180}
                        className="object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Category Badge */}
                    <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {product.category}
                    </Badge>

                    {/* Product Name */}
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] text-lg">{product.name}</h3>

                    {/* Price Section with Savings */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-black text-green-600">
                            ₱{getSalePrice(product).toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-400 line-through font-medium">
                            ₱{Number(product.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <span>💰 You save</span>
                        <span className="font-black">₱{getSavingsAmount(product).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {product.stock_quantity && product.stock_quantity <= 10 && (
                      <div className="mb-4 bg-orange-100 border border-orange-300 text-orange-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2">
                        <span className="animate-pulse">⚠️</span>
                        <span>Only {product.stock_quantity} left in stock!</span>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      size="lg"
                      onClick={() => addToCart(product)}
                      disabled={!product.stock_quantity || product.stock_quantity === 0}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View All Sale Items Button */}
            <div className="text-center mt-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-12 py-7 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <Link href="/client/shop?filter=sale">
                  View All Sale Items
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">We're here to help you and your pets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Address */}
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Visit Us</h3>
                <p className="text-gray-600 mb-4">
                  1 King Charles corner king alexander kingspoint subdivision, Novaliches, Philippines
                </p>
                <div className="text-sm text-gray-500">
                  <p className="font-medium">Hours:</p>
                  <p>Mon-Sat: 8:00 AM - 6:00 PM</p>
                  <p>Sunday: 9:00 AM - 4:00 PM</p>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Phone Number</h3>
                <p className="text-gray-600 mb-4">
                  <a href="tel:+639294944937" className="text-blue-600 hover:underline font-medium text-lg">
                    +63 929 494 4937
                  </a>
                </p>
                <p className="text-sm text-gray-500">Call us for immediate assistance or emergency services</p>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Address</h3>
                <p className="text-gray-600 mb-4">
                  <a href="mailto:peppapets.ph@gmail.com" className="text-blue-600 hover:underline font-medium">
                    peppapets.ph@gmail.com
                  </a>
                </p>
                <p className="text-sm text-gray-500">Send us your questions or appointment requests</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{actionsSection?.title || "Get Started Today"}</h2>
            <p className="text-xl text-blue-100">
              {actionsSection?.subtitle || "Everything you need for your pet's care"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              onClick={handleBookAppointment}
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-center space-y-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Book Appointment</span>
                <span className="text-sm opacity-80">Schedule a visit</span>
              </div>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <Link href={isLoggedIn ? "/client/pets/add" : "/login"} className="flex flex-col items-center space-y-3">
                <PawPrint className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Add New Pet</span>
                <span className="text-sm opacity-80">Register your pet</span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <Link href="/client/shop" className="flex flex-col items-center space-y-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Browse Shop</span>
                <span className="text-sm opacity-80">Quality products</span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <Link
                href={isLoggedIn ? "/client/myactivity" : "/login"}
                className="flex flex-col items-center space-y-3"
              >
                <ArrowRight className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">My Activity</span>
                <span className="text-sm opacity-80">View dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold">Pawpal</span>
              </div>
              <p className="text-gray-400 mb-4">Your trusted partner in pet health and wellness.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/client/appointments" className="hover:text-white transition-colors">
                    Veterinary Care
                  </Link>
                </li>
                <li>
                  <Link href="/client/appointments/book" className="hover:text-white transition-colors">
                    Pet Grooming
                  </Link>
                </li>
                <li>
                  <Link href="/client/appointments/book" className="hover:text-white transition-colors">
                    Pet Boarding
                  </Link>
                </li>
                <li>
                  <Link href="/client/shop" className="hover:text-white transition-colors">
                    Pet Shop
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/client" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/client/myactivity" className="hover:text-white transition-colors">
                    My Activity
                  </Link>
                </li>
                <li>
                  <Link href="/client/pets" className="hover:text-white transition-colors">
                    My Pets
                  </Link>
                </li>
                <li>
                  <Link href="/client/orders" className="hover:text-white transition-colors">
                    Order History
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    1 King Charles corner king alexander kingspoint subdivision, Novaliches, Philippines
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <a href="tel:+639294944937" className="hover:text-white transition-colors">
                    +63 929 494 4937
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <a href="mailto:peppapets.ph@gmail.com" className="hover:text-white transition-colors text-sm">
                    peppapets.ph@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Pawpal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button for Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-2xl bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
              {getCartItemCount()}
            </Badge>
          </Button>
        </div>
      )}

      {/* Chatbot - Available on homepage */}
      <ClientChatbot />

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
