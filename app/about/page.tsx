"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Award,
  Star,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Maria Santos",
      role: "Lead Veterinarian",
      experience: "15+ years",
      specialization: "Small Animal Medicine & Surgery",
      image: "/placeholder-oqh5q.png",
    },
    {
      name: "Dr. Juan Dela Cruz",
      role: "Senior Veterinarian",
      experience: "12+ years",
      specialization: "Emergency Care & Diagnostics",
      image: "/placeholder-ujg3t.png",
    },
    {
      name: "Sarah Johnson",
      role: "Head Groomer",
      experience: "8+ years",
      specialization: "Professional Pet Styling",
      image: "/placeholder-sdcjh.png",
    },
    {
      name: "Mike Rodriguez",
      role: "Pet Care Specialist",
      experience: "6+ years",
      specialization: "Boarding & Pet Behavior",
      image: "/placeholder-b4yyz.png",
    },
  ]

  const achievements = [
    {
      icon: Award,
      title: "Licensed Veterinary Clinic",
      description: "Fully licensed and accredited by the Philippine Veterinary Medical Association",
    },
    {
      icon: Users,
      title: "5,000+ Happy Pets",
      description: "Trusted by thousands of pet owners across Metro Manila",
    },
    {
      icon: Star,
      title: "4.9/5 Rating",
      description: "Consistently rated as one of the top pet care facilities",
    },
    {
      icon: CheckCircle,
      title: "24/7 Emergency Care",
      description: "Round-the-clock emergency services for your peace of mind",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We treat every pet with the same love and care we'd give our own family members.",
    },
    {
      icon: Shield,
      title: "Professional Excellence",
      description: "Our team maintains the highest standards of veterinary medicine and pet care.",
    },
    {
      icon: Sparkles,
      title: "Continuous Innovation",
      description: "We stay updated with the latest advances in veterinary technology and treatments.",
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Building lasting relationships with pet owners and contributing to animal welfare.",
    },
  ]

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
              <Link href="/" className="text-gray-500 hover:text-gray-900">
                Home
              </Link>
              <Link href="/#services" className="text-gray-500 hover:text-gray-900">
                Services
              </Link>
              <Link href="/pet-hotel" className="text-gray-500 hover:text-gray-900">
                Pet Hotel
              </Link>
              <Link href="/shop" className="text-gray-500 hover:text-gray-900">
                Shop
              </Link>
              <Link href="/about" className="text-blue-600 font-semibold">
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Peppa Pets</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your trusted partner in comprehensive pet care since 2015
            </p>
            <div className="flex justify-center">
              <Badge className="bg-white/20 text-white text-lg px-6 py-2">Serving Metro Manila & Beyond</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Peppa Pets began in 2015 with a vision to create a welcoming place for pets and their families. Starting as a dedicated grooming service, we quickly became known for our gentle care and attention to detail, helping pets look and feel their best.
                </p>
                <p>
                  As our community grew, we expanded to offer a comfortable pet hotel for boarding, giving pet owners peace of mind while they’re away. Our team ensures every guest enjoys a safe, relaxing, and enjoyable stay.
                </p>
                <p>
                  Today, Peppa Pets is also home to a well-stocked shop, offering a wide range of quality food, treats, toys, and accessories. We’re committed to making life better for pets and easier for owners, with friendly service and trusted products.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/#contact">
                    Visit Our Clinic
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/peppa.jpg"
                alt="Peppa Pets Clinic"
                width={600}
                height={500}
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-3xl font-bold">9+</div>
                <div className="text-sm opacity-90">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
            <p className="text-xl text-gray-600">Guiding principles that drive everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-blue-600 text-white border-0">
              <CardHeader className="text-center pb-4">
                <Heart className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg leading-relaxed opacity-90">
                  To provide exceptional veterinary care and comprehensive pet services that enhance the health,
                  happiness, and quality of life for pets and their families throughout Metro Manila.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader className="text-center pb-4">
                <Star className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <CardTitle className="text-2xl text-gray-900">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg leading-relaxed text-gray-600">
                  To be the most trusted and innovative pet care provider in the Philippines, setting the standard for
                  excellence in veterinary medicine and pet wellness services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide our daily work</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center group hover:shadow-lg transition-all duration-300 border-0 bg-blue-50"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600">Dedicated professionals committed to your pet's wellbeing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="rounded-full mx-auto object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-2">{member.experience}</p>
                  <p className="text-sm text-gray-500">{member.specialization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Achievements</h2>
            <p className="text-xl opacity-90">Recognition and milestones that make us proud</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-white text-center">
                <CardContent className="p-8">
                  <achievement.icon className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                  <h3 className="text-xl font-semibold mb-4">{achievement.title}</h3>
                  <p className="opacity-90 leading-relaxed">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Visit Us Today</h2>
            <p className="text-xl text-gray-600">We're here to serve you and your beloved pets</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 bg-blue-50">
              <CardHeader>
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-gray-900">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">+63 929 494 4937</p>
                <p className="text-sm text-gray-500 mt-2">24/7 Emergency Hotline</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-blue-50">
              <CardHeader>
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-gray-900">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">peppapets.ph@gmail.com</p>
                <p className="text-sm text-gray-500 mt-2">We respond within 24 hours</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-blue-50">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-gray-900">Visit Our Clinic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">
                  1 King Charles corner King Alexander, Kingspoint Subdivision, Novaliches, Philippines
                </p>
                <p className="text-sm text-gray-500 mt-2">Open 7 days a week</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/#contact">
                Schedule an Appointment
                <Calendar className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Pawpal</span>
              </div>
              <p className="text-gray-400">Your trusted partner in pet health and wellness.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/#services" className="hover:text-white">
                    Veterinary Care
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="hover:text-white">
                    Pet Grooming
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="hover:text-white">
                    Pet Boarding
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white">
                    Pet Shop
                  </Link>
                </li>
                <li>
                  <Link href="/pet-hotel" className="hover:text-white">
                    Pet Hotel
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Peppa Pets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
