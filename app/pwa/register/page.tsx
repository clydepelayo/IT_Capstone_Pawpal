"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Loader2, User, Mail, Phone, Lock, MapPin, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  address?: string
}

export default function PWARegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    // Philippine phone number format: 09xxxxxxxxx or +639xxxxxxxxx
    const phoneRegex = /^(\+639|09)\d{9}$/
    return phoneRegex.test(phone.replace(/\s+/g, ""))
  }

  const validatePassword = (password: string): boolean => {
    // At least 8 characters
    return password.length >= 8
  }

  const validateName = (name: string): boolean => {
    // Only letters, spaces, hyphens, and apostrophes allowed
    const nameRegex = /^[a-zA-Z\s\-']+$/
    return nameRegex.test(name)
  }

  const getPasswordStrength = (password: string): { text: string; color: string } => {
    if (password.length === 0) return { text: "", color: "" }
    if (password.length < 6) return { text: "Weak", color: "text-red-600" }
    if (password.length < 8) return { text: "Fair", color: "text-orange-600" }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { text: "Good", color: "text-yellow-600" }
    return { text: "Strong", color: "text-green-600" }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters"
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = "First name can only contain letters"
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters"
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = "Last name can only contain letters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Philippine phone number (e.g., 09xxxxxxxxx)"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.length < 10) {
      newErrors.address = "Please enter a complete address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let sanitizedValue = value

    // Sanitize name fields - only allow letters, spaces, hyphens, and apostrophes
    if (field === "firstName" || field === "lastName") {
      sanitizedValue = value.replace(/[^a-zA-Z\s\-']/g, "")
    }

    // Sanitize phone field - only allow numbers, +, and spaces
    if (field === "phone") {
      sanitizedValue = value.replace(/[^\d+\s]/g, "")
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")
    setSuccessMessage("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\s+/g, ""),
          password: formData.password,
          address: formData.address.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage("Registration successful! Redirecting to login...")
        setTimeout(() => {
          router.push("/pwa/login")
        }, 2000)
      } else {
        setServerError(data.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      setServerError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col p-4">
      {/* Header */}
      <div className="pt-4 pb-8">
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Registration Card */}
      <div className="flex-1 flex items-center justify-center pb-20">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Join Pawpal to care for your pets</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                <p className="text-xs text-gray-500">Letters only (spaces and hyphens allowed)</p>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                <p className="text-xs text-gray-500">Letters only (spaces and hyphens allowed)</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09123456789"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                <p className="text-xs text-gray-500">Numbers only (e.g., 09123456789)</p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Complete Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St, Barangay, City, Province"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {formData.password && (
                  <p className={`text-sm ${passwordStrength.color}`}>Password strength: {passwordStrength.text}</p>
                )}
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/pwa/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
