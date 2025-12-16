"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Check, Calendar, Clock, Scissors, Sparkles, Bath, PawPrint } from "lucide-react"
import Image from "next/image"

interface GroomingService {
  id: string
  name: string
  description: string
  prices: { [key: string]: number }
  duration: string
  icon: any
}

interface AlaCarteService {
  id: string
  name: string
  prices: { [key: string]: number }
}

export default function PetGroomingPage() {
  const [selectedPet, setSelectedPet] = useState<"cat" | "dog" | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const petTypes = [
    {
      type: "dog" as const,
      name: "Dog",
      image: "/happy-golden-retriever.png",
      description: "Professional grooming for all dog breeds",
    },
    {
      type: "cat" as const,
      name: "Cat",
      image: "/fluffy-persian-cat.jpg",
      description: "Gentle grooming services for cats",
    },
  ]

  const dogGroomingServices: GroomingService[] = [
    {
      id: "classic-grooming",
      name: "Classic Grooming",
      description: "Bath, Blow-dry, Brushing, Nail Clipping, Ear Cleaning",
      prices: { Small: 399, Medium: 499, Large: 699, "X-large": 999 },
      duration: "2-3 hours",
      icon: Bath,
    },
    {
      id: "puppy-first-groom",
      name: "Puppy's First Groom",
      description: "Gentle Bath, Light Trimming, Nail Clipping, Paw Massage",
      prices: { Small: 499, Medium: 599, Large: 699 },
      duration: "1-2 hours",
      icon: Sparkles,
    },
    {
      id: "premium-grooming",
      name: "Premium Grooming",
      description: "Basic Grooming + Haircut & Styling, Paw & Pad Trimming, Anal Gland Extraction",
      prices: { Small: 699, Medium: 999, Large: 1399, "X-large": 1799 },
      duration: "3-4 hours",
      icon: Scissors,
    },
    {
      id: "vip-grooming",
      name: "VIP Grooming Package",
      description:
        "Full Grooming + VIP Shampoo, Paw Massage, Perfume Spray, Deep Clean for Healthy Teeth & Gums, Trimmed Nails + Paw Softening Treatment, Anal Gland Extraction, Dematting, Detangling",
      prices: { Small: 1299, Medium: 1499, Large: 1899, "X-large": 2499 },
      duration: "4-5 hours",
      icon: PawPrint,
    },
  ]

  const catGroomingServices: GroomingService[] = [
    {
      id: "cat-basic-trimming",
      name: "Cat All-in-One Groom - Basic Trimming",
      description: "Calming Bath, Teeth Brushing, Nail Clipping, Nail Filing, Tear Stain Treatment",
      prices: { "All Sizes": 900 },
      duration: "1-2 hours",
      icon: Bath,
    },
    {
      id: "cat-premium-groom",
      name: "Premium Groom - Full Grooming",
      description:
        "Calming Bath, Cozy Dryer Box Session, Nail Clipping, Nail Filing, Tear Stain Treatment, Teeth Brushing",
      prices: { "All Sizes": 1100 },
      duration: "2-3 hours",
      icon: Scissors,
    },
    {
      id: "cat-vip-groom",
      name: "VIP Groom - Complete Package + Styled Groom",
      description:
        "Calming Bath & Massage, Cozy Dryer Box Session, Nail Clipping, Nail Filing, Tear Stain Treatment, Paw Moisturizing",
      prices: { "All Sizes": 1300 },
      duration: "3-4 hours",
      icon: Sparkles,
    },
  ]

  const dogAlaCarteServices: AlaCarteService[] = [
    { id: "ear-cleaning", name: "Ear Cleaning", prices: { Small: 150, Medium: 150, Large: 200, "X-large": 250 } },
    {
      id: "paw-moisturizing",
      name: "Paw Moisturizing",
      prices: { Small: 150, Medium: 150, Large: 200, "X-large": 250 },
    },
    { id: "nail-clipping", name: "Nail Clipping", prices: { Small: 150, Medium: 150, Large: 200, "X-large": 250 } },
    {
      id: "dematting",
      name: "Dematting / Deshedding",
      prices: { Small: 200, Medium: 400, Large: 600, "X-large": 800 },
    },
    { id: "face-trim", name: "Face Trim", prices: { Small: 200, Medium: 200, Large: 300, "X-large": 300 } },
    {
      id: "teeth-brushing",
      name: "Teeth Brushing & Fresh Breath Spray",
      prices: { Small: 200, Medium: 200, Large: 300, "X-large": 300 },
    },
    {
      id: "anal-gland",
      name: "Anal Gland Extraction",
      prices: { Small: 200, Medium: 200, Large: 300, "X-large": 300 },
    },
    { id: "tick-flea", name: "Tick & Flea Treatment", prices: { Small: 299, Medium: 399, Large: 499, "X-large": 599 } },
    {
      id: "bubble-bath",
      name: "Bubble Bath Spa Treatment",
      prices: { Small: 700, Medium: 900, Large: 1200, "X-large": 1500 },
    },
  ]

  const catAlaCarteServices: AlaCarteService[] = [
    { id: "cat-ear-cleaning", name: "Ear Cleaning", prices: { "Small/Medium": 200, Large: 250 } },
    { id: "cat-paw-moisturizing", name: "Paw Moisturizing", prices: { "Small/Medium": 200, Large: 250 } },
    { id: "cat-nail-clipping", name: "Nail Clipping", prices: { "Small/Medium": 200, Large: 250 } },
    { id: "cat-dematting", name: "Dematting / Deshedding", prices: { "Small/Medium": 250, Large: 350 } },
    { id: "cat-bath-blow", name: "Bath & Blow Dry", prices: { "Small/Medium": 499, Large: 699 } },
    {
      id: "cat-teeth-brushing",
      name: "Teeth Brushing & Fresh Breath Spray",
      prices: { "Small/Medium": 250, Large: 350 },
    },
    { id: "cat-anal-gland", name: "Anal Gland Extraction", prices: { "Small/Medium": 250, Large: 549 } },
    { id: "cat-tick-flea", name: "Tick & Flea Treatment", prices: { "Small/Medium": 349, Large: 650 } },
    { id: "cat-bubble-bath", name: "Bubble Bath Spa Treatment", prices: { "Small/Medium": 750, Large: 950 } },
  ]

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  const getCurrentServices = () => {
    return selectedPet === "dog" ? dogGroomingServices : catGroomingServices
  }

  const getCurrentAlaCarteServices = () => {
    return selectedPet === "dog" ? dogAlaCarteServices : catAlaCarteServices
  }

  const getSizeOptions = () => {
    if (selectedPet === "dog") {
      return ["Small", "Medium", "Large", "X-large"]
    } else if (selectedPet === "cat") {
      return ["Small/Medium", "Large"]
    }
    return []
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const getTotalPrice = () => {
    let total = 0
    const currentServices = getCurrentServices()
    const currentAlaCarteServices = getCurrentAlaCarteServices()

    selectedServices.forEach((serviceId) => {
      const service = currentServices.find((s) => s.id === serviceId)
      const alaCarteService = currentAlaCarteServices.find((s) => s.id === serviceId)

      if (service) {
        // For cat, use "All Sizes" key if selectedSize is not present in prices
        if (selectedPet === "cat") {
          total += service.prices[selectedSize] ?? service.prices["All Sizes"] ?? 0
        } else {
          total += service.prices[selectedSize] ?? 0
        }
      } else if (alaCarteService && selectedSize) {
        total += alaCarteService.prices[selectedSize] || 0
      }
    })

    return total
  }

  const handleBookAppointment = () => {
    if (!selectedPet || selectedServices.length === 0 || !selectedSize || !selectedDate || !selectedTime) {
      alert("Please complete all sections before booking")
      return
    }
    // Redirect to login page for security
    window.location.href = "/login"
  }

  // Only allow booking for tomorrow or later
  const getMinBookingDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split("T")[0]
  }

  // Only show available time slots based on selected day
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []
    const day = new Date(selectedDate).getDay()
    // 0: Sunday, 1: Monday, ..., 6: Saturday
    if (day === 2) return [] // Tuesday closed
    if ([5, 6, 0].includes(day)) {
      // Fri, Sat, Sun: 8AM-8PM
      return [
        "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
        "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
      ]
    }
    // Mon, Wed, Thu: 8AM-6PM
    return [
      "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
      "5:00 PM", "6:00 PM"
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">Pawpal</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/#services" className="text-gray-500 hover:text-gray-900">
                Services
              </Link>
              <Link href="/pet-hotel" className="text-gray-500 hover:text-gray-900">
                Pet Hotel
              </Link>
              <Link href="/pet-grooming" className="text-blue-600 font-medium">
                Pet Grooming
              </Link>
              <Link href="/shop" className="text-gray-500 hover:text-gray-900">
                Shop
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                Contact
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pet Grooming Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional grooming services to keep your pets clean, healthy, and looking their best
          </p>
        </div>
      </section>

      {/* Step 1: Pet Selection */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Choose Your Pet Type</h2>
            </div>
            <p className="text-lg text-gray-600">Select whether you're booking for a dog or cat</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {petTypes.map((pet) => (
              <Card
                key={pet.type}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPet === pet.type ? "ring-2 ring-blue-600 bg-blue-50" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPet(pet.type)}
              >
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <Image
                      src={pet.image || "/placeholder.svg"}
                      alt={pet.name}
                      width={200}
                      height={200}
                      className="rounded-full mx-auto object-cover"
                    />
                    {selectedPet === pet.type && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
                  <p className="text-gray-600">{pet.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2: Size Selection */}
      {selectedPet && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Select Pet Size</h2>
              </div>
              <p className="text-lg text-gray-600">Choose your pet's size for accurate pricing</p>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                {getSizeOptions().map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="h-16 text-lg"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Services Selection */}
      {selectedPet && selectedSize && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Select Services</h2>
              </div>
              <p className="text-lg text-gray-600">Choose from our grooming packages and add-on services</p>
            </div>

            {/* Main Grooming Packages */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Grooming Packages</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCurrentServices().map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedServices.includes(service.id) ? "ring-2 ring-blue-600 bg-blue-50" : "hover:shadow-md"
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <service.icon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        {selectedServices.includes(service.id) && (
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">
                          ₱{service.prices[selectedSize] || service.prices["All Sizes"]}
                        </span>
                        <span className="text-sm text-gray-500">{service.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Ala Carte Services */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ala Carte Services</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentAlaCarteServices().map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedServices.includes(service.id) ? "ring-2 ring-blue-600 bg-blue-50" : "hover:shadow-md"
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <span className="text-lg font-bold text-blue-600">₱{service.prices[selectedSize]}</span>
                        </div>
                        {selectedServices.includes(service.id) && (
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-8 text-center">
                <Card className="max-w-md mx-auto bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Selected Services</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                    </p>
                    <div className="text-2xl font-bold text-blue-600">Total: ₱{getTotalPrice().toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Step 4: Date & Time Selection */}
      {selectedServices.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  4
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Schedule Appointment</h2>
              </div>
              <p className="text-lg text-gray-600">Choose your preferred date and time</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Date Selection */}
              <Card className={selectedServices.length === 0 ? "opacity-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTime("") // Reset time when date changes
                    }}
                    disabled={selectedServices.length === 0}
                    min={getMinBookingDate()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50"
                  />
                  {selectedDate && new Date(selectedDate).getDay() === 2 && (
                    <div className="text-red-600 mt-2 text-sm">Sorry, we are closed on Tuesdays.</div>
                  )}
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card className={selectedServices.length === 0 ? "opacity-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Select Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {getAvailableTimeSlots().map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        disabled={selectedServices.length === 0 || new Date(selectedDate).getDay() === 2}
                        onClick={() => setSelectedTime(time)}
                        className="w-full"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                  {selectedDate && getAvailableTimeSlots().length === 0 && (
                    <div className="text-red-600 mt-2 text-sm">No available time slots for this day.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary & Confirmation */}
            {selectedPet && selectedServices.length > 0 && selectedSize && selectedDate && selectedTime && (
              <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Booking Summary</h3>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Pet & Services</h4>
                      <p className="text-gray-600 mb-2">
                        Pet Type: <span className="font-medium capitalize">{selectedPet}</span>
                      </p>
                      <p className="text-gray-600 mb-2">
                        Size: <span className="font-medium capitalize">{selectedSize}</span>
                      </p>
                      <div className="space-y-1">
                        {selectedServices.map((serviceId) => {
                          const service = getCurrentServices().find((s) => s.id === serviceId)
                          const alaCarteService = getCurrentAlaCarteServices().find((s) => s.id === serviceId)
                          return (
                            <div key={serviceId} className="flex justify-between text-sm">
                              <span>{service?.name || alaCarteService?.name}</span>
                              <span>
                                ₱{(service?.prices[selectedSize] || alaCarteService?.prices[selectedSize])?.toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Appointment Details</h4>
                      <p className="text-gray-600 mb-1">
                        Date: <span className="font-medium">{selectedDate}</span>
                      </p>
                      <p className="text-gray-600 mb-4">
                        Time: <span className="font-medium">{selectedTime}</span>
                      </p>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">Total: ₱{getTotalPrice().toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleBookAppointment} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Pawpal</span>
            </div>
            <p className="text-gray-400">Your trusted partner in pet health and wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
