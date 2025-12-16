"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, Phone, Mail, MapPin, Clock, Send, CheckCircle, Facebook, Instagram } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    serviceType: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        serviceType: "",
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Number",
      details: "+63 929 494 4937",
      description: "Call us for immediate assistance or emergency services",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Mail,
      title: "Email Address",
      details: "peppapets.ph@gmail.com",
      description: "Send us your questions or appointment requests",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: MapPin,
      title: "Our Location",
      details: "1 King Charles corner king alexander kingspoint subdivision, Novaliches, Philippines",
      description: "Visit our clinic for comprehensive pet care services",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Sat: 8:00 AM - 6:00 PM\nSunday: 9:00 AM - 4:00 PM",
      description: "We're here when your pets need us most",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const serviceTypes = [
    "Pet Grooming",
    "Pet Hotel Booking",
    "Pet Shop Products",
    "Other Services",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Pawpal
              </Link>
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
              <Link href="/about" className="text-gray-500 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-blue-600 font-semibold">
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch with Pawpal</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            We're here to help you and your beloved pets. Reach out for appointments, inquiries, or emergency services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: +63 929 494 4937
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <a href="mailto:peppapets.ph@gmail.com">
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-xl text-gray-600">Multiple ways to reach us for your convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${info.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <info.icon className={`h-8 w-8 ${info.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
                  <p className="text-gray-900 font-medium mb-2 whitespace-pre-line">{info.details}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible. For emergencies, please call us
                directly.
              </p>

              {isSubmitted ? (
                <Card className="p-8 text-center bg-green-50 border-green-200">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-green-700">
                    Thank you for contacting us. We'll respond to your inquiry within 24 hours.
                  </p>
                </Card>
              ) : (
                <Card className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+63 XXX XXX XXXX"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a service type</option>
                        {serviceTypes.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your inquiry"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please provide details about your inquiry, including your pet's information if relevant..."
                        rows={6}
                        className="mt-1"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Pawpal?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Expert Veterinary Care</h4>
                      <p className="text-gray-600">Licensed veterinarians with years of experience</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">24/7 Emergency Services</h4>
                      <p className="text-gray-600">Always available when your pet needs urgent care</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Comprehensive Services</h4>
                      <p className="text-gray-600">From grooming to boarding, we cover all your pet's needs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Quality Products</h4>
                      <p className="text-gray-600">Premium pet food, toys, and health products</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-blue-50 border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contact</h3>
                <p className="text-gray-700 mb-4">
                  For pet emergencies outside business hours, please call our emergency hotline:
                </p>
                <div className="flex items-center space-x-3 mb-4">
                  <Phone className="h-6 w-6 text-red-600" />
                  <span className="text-xl font-bold text-red-600">+63 929 494 4937</span>
                </div>
                <p className="text-sm text-gray-600">Available 24/7 for urgent pet medical situations</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Follow Us</h3>
                <p className="text-gray-600 mb-6">
                  Stay updated with our latest news, tips, and pet care advice on social media.
                </p>
                <div className="flex space-x-4">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <a href="https://www.facebook.com/PeppaPetsPH" target="_blank" rel="noopener noreferrer">
                      <Facebook className="mr-2 h-5 w-5" />
                      Facebook
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="https://www.instagram.com/peppapets/" target="_blank" rel="noopener noreferrer">
                      <Instagram className="mr-2 h-5 w-5" />
                      Instagram
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
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
              <h3 className="font-semibold text-white mb-4">Account</h3>
              <ul className="space-y-2 text-gray-400">
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
                <li>
                  <Link href="/shop" className="hover:text-white">
                    Shop Now
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
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
            <p>&copy; 2024 Pawpal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
