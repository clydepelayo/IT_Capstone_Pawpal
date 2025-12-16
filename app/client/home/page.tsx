"use client"

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
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserProfile {
  first_name: string
  last_name: string
  email: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category_name: string
  photos: string[]
  photo_url: string | null
  discount?: number
  is_featured?: boolean
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

export default function ClientHomePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
  })
  const [topDeals, setTopDeals] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [homepageSlides, setHomepageSlides] = useState<HomepageSlide[]>([])
  const [homepageSections, setHomepageSections] = useState<Record<string, HomepageSection>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
    fetchTopDeals()
    fetchHomepageContent()
  }, [])

  useEffect(() => {
    if (homepageSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % homepageSlides.length)
      }, 5000) // Auto-advance every 5 seconds

      return () => clearInterval(interval)
    }
  }, [homepageSlides.length])

  const fetchUserData = async () => {
    try {
      const profileResponse = await fetch("/api/client/profile", {
        credentials: "include",
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchTopDeals = async () => {
    try {
      const response = await fetch("/api/client/products?featured=true", {
        credentials: "include",
      })

      if (response.ok) {
        const products = await response.json()
        const productsWithDiscounts = products.slice(0, 6).map((product: Product, index: number) => ({
          ...product,
          discount: [15, 20, 12.5, 25, 18, 30][index] || 0,
          original_price: product.price,
          sale_price: product.price * (1 - ([15, 20, 12.5, 25, 18, 30][index] || 0) / 100),
        }))
        setTopDeals(productsWithDiscounts.slice(0, 3))
        setFeaturedProducts(productsWithDiscounts.slice(3, 6))
      }
    } catch (error) {
      console.error("Error fetching top deals:", error)
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

  const getFirstName = () => {
    return userProfile.first_name || "Pet Owner"
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % homepageSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + homepageSlides.length) % homepageSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const services = [
    {
      icon: Shield,
      title: "Veterinary Care",
      description: "Complete medical care including checkups, vaccinations, and emergency services.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Sparkles,
      title: "Pet Grooming",
      description: "Professional grooming services to keep your pets clean, healthy, and looking great.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Pet Boarding",
      description: "Safe and comfortable boarding facilities when you need to travel.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      title: "Pet Shop",
      description: "Quality pet food, toys, accessories, and health products for your pets.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
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
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/client" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-gray-900">Pawpal</span>
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link href="#services" className="text-gray-600 hover:text-gray-900 font-medium">
                  Services
                </Link>
                <Link href="#about" className="text-gray-600 hover:text-gray-900 font-medium">
                  About
                </Link>
                <Link href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">
                  Contact
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/client/myactivity">My Activity</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {heroSection && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg" asChild>
                  <Link href="/client/appointments/book">Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-gray-300 bg-transparent"
                  asChild
                >
                  <Link href="#services">Our Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Promotional Carousel */}
      {homepageSlides.length > 0 && currentPromo && (
        <section className="relative overflow-hidden">
          <div className={`${currentPromo.background_color} relative transition-all duration-500 ease-in-out`}>
            <div className="container mx-auto px-4 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className={currentPromo.text_color}>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{currentPromo.title}</h1>
                  <p className="text-xl mb-8 opacity-90">{currentPromo.subtitle}</p>
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white" asChild>
                    <Link href={currentPromo.button_link}>{currentPromo.button_text}</Link>
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute -top-4 -right-4 bg-blue-900 text-white rounded-full w-24 h-24 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentPromo.discount_text}</div>
                      <div className="text-sm">OFF</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {currentPromo.image_url_1 && (
                      <Image
                        src={currentPromo.image_url_1 || "/placeholder.svg"}
                        alt="Promotional image 1"
                        width={150}
                        height={200}
                        className="rounded-lg shadow-lg"
                      />
                    )}
                    {currentPromo.image_url_2 && (
                      <Image
                        src={currentPromo.image_url_2 || "/placeholder.svg"}
                        alt="Promotional image 2"
                        width={150}
                        height={200}
                        className="rounded-lg shadow-lg mt-8"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {homepageSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
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
                className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-blue-50 shadow-sm"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className={`h-8 w-8 text-blue-500`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{featuredSection?.title || "Featured Products"}</h2>
            <p className="text-xl text-gray-600">
              {featuredSection?.subtitle || "Quality products for your pet's health and happiness"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center min-h-[200px]">
                    <Image
                      src={
                        product.photos[0] ||
                        product.photo_url ||
                        "/placeholder.svg?height=150&width=150&query=pet+product" ||
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
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">₱{product.price.toFixed(2)}</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/client/shop?product=${product.id}`}>View Details</Link>
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

      {/* Special Offers Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{offersSection?.title || "Special Offers"}</h2>
            <p className="text-xl text-gray-600">
              {offersSection?.subtitle || "Don't miss out on these amazing deals"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topDeals.map((deal, index) => (
              <Card
                key={deal.id}
                className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden border-0 bg-white shadow-sm"
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-red-500 text-white text-sm px-3 py-1">{deal.discount}% OFF</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center min-h-[200px]">
                    <Image
                      src={
                        deal.photos[0] || deal.photo_url || "/placeholder.svg?height=150&width=150&query=pet+product"
                      }
                      alt={deal.name}
                      width={150}
                      height={150}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.name}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-green-600">₱{deal.sale_price?.toFixed(2)}</span>
                    <span className="text-lg text-gray-500 line-through">₱{deal.price.toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800" asChild>
                    <Link href={`/client/shop?product=${deal.id}`}>Add to Cart</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{actionsSection?.title || "Get Started Today"}</h2>
            <p className="text-xl text-gray-300">
              {actionsSection?.subtitle || "Everything you need for your pet's care"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button asChild size="lg" className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/client/appointments/book" className="flex flex-col items-center space-y-3">
                <Calendar className="h-8 w-8" />
                <span className="font-semibold">Book Appointment</span>
                <span className="text-sm opacity-80">Schedule a visit</span>
              </Link>
            </Button>
            <Button asChild size="lg" className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/client/pets/add" className="flex flex-col items-center space-y-3">
                <PawPrint className="h-8 w-8" />
                <span className="font-semibold">Add New Pet</span>
                <span className="text-sm opacity-80">Register your pet</span>
              </Link>
            </Button>
            <Button asChild size="lg" className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/client/shop" className="flex flex-col items-center space-y-3">
                <ShoppingBag className="h-8 w-8" />
                <span className="font-semibold">Browse Shop</span>
                <span className="text-sm opacity-80">Quality products</span>
              </Link>
            </Button>
            <Button asChild size="lg" className="h-auto p-6 bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/client/myactivity" className="flex flex-col items-center space-y-3">
                <ArrowRight className="h-8 w-8" />
                <span className="font-semibold">My Activity</span>
                <span className="text-sm opacity-80">View dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-gray-900">Pawpal</span>
              </div>
              <p className="text-gray-600">Your trusted partner in pet health and wellness.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/client/appointments" className="hover:text-gray-900">
                    Veterinary Care
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Pet Grooming
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    Pet Boarding
                  </Link>
                </li>
                <li>
                  <Link href="/client/shop" className="hover:text-gray-900">
                    Pet Shop
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/client/myactivity" className="hover:text-gray-900">
                    My Activity
                  </Link>
                </li>
                <li>
                  <Link href="/client/pets" className="hover:text-gray-900">
                    My Pets
                  </Link>
                </li>
                <li>
                  <Link href="/client/orders" className="hover:text-gray-900">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link href="/client/appointments" className="hover:text-gray-900">
                    Appointments
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Pawpal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
