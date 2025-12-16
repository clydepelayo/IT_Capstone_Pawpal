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
  Tag,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Download,
  Smartphone,
  Zap,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { ClientChatbot } from "@/components/client-chatbot"

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number // Changed from stock to stock_quantity to match database
  category: string // Changed from category_name to category
  photo_url: string | null // Removed photos array, only using photo_url from database
  discount_type?: string | null
  discount_value?: number | null
  is_on_sale?: boolean
  sale_price?: number
  discount_amount?: number
  discount_percentage?: number
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

const getBackgroundStyle = (colorClass: string): React.CSSProperties => {
  if (colorClass.includes("gradient")) {
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

export default function HomePage() {
  const router = useRouter()
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [homepageSlides, setHomepageSlides] = useState<HomepageSlide[]>([])
  const [homepageSections, setHomepageSections] = useState<Record<string, HomepageSection>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchHomepageContent()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

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

  const fetchProducts = async () => {
    try {
      const saleResponse = await fetch("/api/client/products?onSale=true", {
        credentials: "include",
      })

      if (saleResponse.ok) {
        const saleData = await saleResponse.json()
        console.log("Sale products fetched:", saleData)
        setSaleProducts(saleData.slice(0, 6))
      }

      const featuredResponse = await fetch("/api/client/products?featured=true", {
        credentials: "include",
      })

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
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
        const uniqueSlides = Array.from(
          new Map((data.slides || []).map((slide: HomepageSlide) => [slide.id, slide])).values(),
        )
        setHomepageSlides(uniqueSlides as HomepageSlide[])
        setHomepageSections(data.sections || {})
      }
    } catch (error) {
      console.error("Error fetching homepage content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginRequired = (actionName: string, redirectUrl: string) => {
    toast({
      title: "Login Required",
      description: `Please login to ${actionName}.`,
      variant: "destructive",
    })
    sessionStorage.setItem("redirectAfterLogin", redirectUrl)
    router.push("/login")
  }

  const handleNextSlide = () => {
    if (isTransitioning || homepageSlides.length === 0) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % homepageSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrevSlide = () => {
    if (isTransitioning || homepageSlides.length === 0) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + homepageSlides.length) % homepageSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || homepageSlides.length === 0) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const getDiscountPercentage = (product: Product): number => {
    const price = Number(product.price)
    const salePrice = product.sale_price ? Number(product.sale_price) : 0
    const discountValue = product.discount_value ? Number(product.discount_value) : 0
    const discountAmount = product.discount_amount ? Number(product.discount_amount) : 0

    if (product.discount_percentage && product.discount_percentage > 0) {
      return Math.round(product.discount_percentage)
    }

    if (product.discount_type === "percentage" && discountValue) {
      return Math.round(discountValue)
    }

    if (salePrice && price > 0 && salePrice < price) {
      return Math.round(((price - salePrice) / price) * 100)
    }

    if (discountAmount && price > 0) {
      return Math.round((discountAmount / price) * 100)
    }

    if (product.discount_type === "fixed" && discountValue && price > 0) {
      return Math.round((discountValue / price) * 100)
    }

    return 0
  }

  const getSalePrice = (product: Product): number => {
    const price = Number(product.price)
    const salePrice = product.sale_price ? Number(product.sale_price) : 0
    const discountValue = product.discount_value ? Number(product.discount_value) : 0

    if (salePrice && salePrice > 0) {
      return salePrice
    }

    if (product.discount_type === "percentage" && discountValue) {
      return price * (1 - discountValue / 100)
    }

    if (product.discount_type === "fixed" && discountValue) {
      return price - discountValue
    }

    return price
  }

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Already Installed",
        description: "The app is already installed or not available for installation on this device.",
      })
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast({
        title: "Success!",
        description: "Pawpal has been installed on your device.",
      })
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  const services = [
    {
      icon: Shield,
      title: "Veterinary Care",
      description: "Complete medical care including checkups, vaccinations, and emergency services.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      link: "/client/appointments/book",
    },
    {
      icon: Sparkles,
      title: "Pet Grooming",
      description: "Professional grooming services to keep your pets clean, healthy, and looking great.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      link: "/client/appointments/book",
    },
    {
      icon: Clock,
      title: "Pet Boarding",
      description: "Safe and comfortable boarding facilities when you need to travel.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      link: "/client/appointments/book",
    },
    {
      icon: Heart,
      title: "Pet Shop",
      description: "Quality pet food, toys, accessories, and health products for your pets.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      link: "/client/shop",
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
              <Link href="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-gray-900">Pawpal</span>
              </Link>
              <div className="hidden md:flex space-x-8">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector("#services")
                    element?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  Services
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector("#products")
                    element?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  Products
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector("#offers")
                    element?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  Offers
                </button>
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
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Carousel Banner */}
      {homepageSlides.length > 0 && currentPromo && (
        <section className="relative overflow-hidden h-[500px]">
          <div
            key={currentPromo.id}
            className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={getBackgroundStyle(currentPromo.background_color)}
          >
            <div className="container mx-auto px-4 h-full">
              <div className="flex items-center justify-center h-full py-12">
                <div
                  className="max-w-3xl text-center space-y-6 z-10"
                  style={getTextColorStyle(currentPromo.text_color)}
                >
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                    {currentPromo.title}
                  </h1>
                  <p className="text-xl md:text-3xl opacity-90 animate-fade-in-up animation-delay-200">
                    {currentPromo.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg text-lg px-10 py-7 animate-fade-in-up animation-delay-400"
                    onClick={() => handleLoginRequired("shop", currentPromo.button_link || "/client/shop")}
                  >
                    {currentPromo.button_text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

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

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
            {homepageSlides.map((slide, index) => (
              <button
                key={slide.id}
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
                  onClick={() => handleLoginRequired("book an appointment", "/client/appointments/book")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-gray-300 bg-transparent"
                  onClick={() => handleLoginRequired("shop products", "/client/shop")}
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
              {/* Features */}
              <div className="space-y-4">
                <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
                        <p className="text-gray-600">
                          Instant loading and smooth performance, even on slow connections
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Bell className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Push Notifications</h3>
                        <p className="text-gray-600">Get notified about appointments, orders, and special offers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Smartphone className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Works Offline</h3>
                        <p className="text-gray-600">Access your pet records and history even without internet</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Download Card */}
              <div className="flex items-center justify-center">
                <Card className="w-full border-2 border-gray-200 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Heart className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Pawpal App</h3>
                    <p className="text-gray-600 mb-6">Your Pet Care Companion</p>

                    {isInstallable ? (
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg shadow-lg"
                        onClick={handleInstallPWA}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Install App Now
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg shadow-lg"
                          asChild
                        >
                          <Link href="/pwa">
                            <Smartphone className="mr-2 h-5 w-5" />
                            Open Mobile App
                          </Link>
                        </Button>
                        <p className="text-sm text-gray-500">
                          Or visit <span className="font-mono bg-gray-100 px-2 py-1 rounded">pawpal.com/pwa</span> on
                          your mobile device
                        </p>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Compatible with:</p>
                      <div className="flex justify-center space-x-4">
                        <Badge variant="secondary">iOS Safari</Badge>
                        <Badge variant="secondary">Android Chrome</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* How to Install Instructions */}
            <Card className="bg-white/50 backdrop-blur">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-center mb-6">How to Install on Your Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        iOS
                      </span>
                      iPhone & iPad
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                      <li>Open this page in Safari</li>
                      <li>Tap the Share button (square with arrow)</li>
                      <li>Scroll and tap "Add to Home Screen"</li>
                      <li>Tap "Add" to confirm</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center">
                      <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                        And
                      </span>
                      Android
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                      <li>Open this page in Chrome</li>
                      <li>Tap the menu (three dots)</li>
                      <li>Tap "Add to Home screen" or "Install app"</li>
                      <li>Tap "Install" to confirm</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      {saleProducts.length > 0 && (
        <section id="offers" className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <Tag className="h-10 w-10 text-orange-500 animate-bounce" />
                <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {offersSection?.title || "Special Offers"}
                </h2>
                <Tag className="h-10 w-10 text-orange-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <p className="text-2xl text-gray-700 font-medium">
                {offersSection?.subtitle || "🔥 Limited Time Deals - Don't Miss Out!"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {saleProducts.map((product) => {
                const discountPercent = getDiscountPercentage(product)
                const salePrice = getSalePrice(product)

                return (
                  <Card
                    key={product.id}
                    className="group hover:shadow-2xl transition-all duration-300 relative overflow-hidden border-2 border-orange-200 hover:border-orange-400 bg-white"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-full shadow-2xl animate-pulse">
                        <div className="px-4 py-3 text-center">
                          <div className="text-2xl font-black">{discountPercent}%</div>
                          <div className="text-xs font-bold">OFF</div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-6 flex items-center justify-center min-h-[240px] group-hover:from-orange-100 group-hover:to-red-100 transition-all duration-300">
                        <div className="relative">
                          <Image
                            src={
                              product.photo_url ||
                              "/placeholder.svg?height=200&width=200&query=pet+product" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={product.name}
                            width={200}
                            height={200}
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      <Badge className="mb-3 bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300">
                        {product.category}
                      </Badge>

                      <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2 min-h-[3.5rem] group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>

                      <div className="mb-5">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-4xl font-black text-green-600">₱{salePrice.toFixed(2)}</span>
                          <span className="text-xl text-gray-400 line-through font-semibold">
                            ₱{Number(product.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          You save ₱{(Number(product.price) - salePrice).toFixed(2)}!
                        </div>
                      </div>

                      {product.stock_quantity && product.stock_quantity < 10 && product.stock_quantity > 0 && (
                        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm font-bold text-center">
                            ⚠️ Only {product.stock_quantity} left in stock!
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                          size="lg"
                          onClick={() => handleLoginRequired("add items to cart", "/client/shop")}
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>

                    <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-br-full" />
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
                onClick={() => handleLoginRequired("view all sale items", "/client/shop")}
              >
                <Sparkles className="mr-2 h-6 w-6" />
                View All Sale Items
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
          </div>
        </section>
      )}

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
                onClick={() => handleLoginRequired(`access ${service.title}`, service.link)}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                    <service.icon className="h-8 w-8 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                  <Button variant="link" className="text-blue-500 p-0 pointer-events-none">
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
                      onClick={() => handleLoginRequired("add items to cart", "/client/shop")}
                      disabled={!product.stock_quantity || product.stock_quantity === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleLoginRequired("view product details", `/client/shop`)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleLoginRequired("view all products", "/client/shop")}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
              onClick={() => handleLoginRequired("book an appointment", "/client/appointments/book")}
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
              onClick={() => handleLoginRequired("add a pet", "/client/pets")}
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-center space-y-3">
                <PawPrint className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Add New Pet</span>
                <span className="text-sm opacity-80">Register your pet</span>
              </div>
            </Button>
            <Button
              onClick={() => handleLoginRequired("browse the shop", "/client/shop")}
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-center space-y-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Browse Shop</span>
                <span className="text-sm opacity-80">Quality products</span>
              </div>
            </Button>
            <Button
              onClick={() => handleLoginRequired("view your activity", "/client/myactivity")}
              size="lg"
              className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-center space-y-3">
                <ArrowRight className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">My Activity</span>
                <span className="text-sm opacity-80">View dashboard</span>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">We're here to help you and your pets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

      {/* Call to Action Banner */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of pet owners who trust Pawpal for their pet care needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg" asChild>
                <Link href="/register">
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg bg-transparent"
                asChild
              >
                <Link href="/login">Login to Your Account</Link>
              </Button>
            </div>
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
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector("#services")
                      element?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Veterinary Care
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector("#services")
                      element?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Pet Grooming
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector("#services")
                      element?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Pet Boarding
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLoginRequired("browse shop", "/client/shop")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Pet Shop
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector("#services")
                      element?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector("#products")
                      element?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.querySelector("#contact")
                      element?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contact
                  </button>
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

      <ClientChatbot isAuthenticated={false} />

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
