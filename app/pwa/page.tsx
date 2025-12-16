"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Calendar, PawPrint, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PWAHome() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/client/profile", {
          credentials: "include",
        })

        if (response.ok) {
          // User is logged in, redirect to dashboard
          router.push("/pwa/dashboard")
        } else {
          // User is not logged in, stay on landing page
          setIsCheckingAuth(false)
        }
      } catch (error) {
        // Error checking auth, assume not logged in
        console.log("Not logged in, showing landing page")
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Pawpal</h1>
            <p className="text-blue-100 mt-2">Your Pet Care Companion</p>
          </div>
        </div>

        {/* Features */}
        <Card className="bg-white/95 backdrop-blur">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Appointments</h3>
                <p className="text-sm text-gray-600">Book and track your pet's veterinary visits</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Boarding Services</h3>
                <p className="text-sm text-gray-600">Reserve boarding and view stay details</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pet Records</h3>
                <p className="text-sm text-gray-600">Access your pet's health history anytime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-lg bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => router.push("/pwa/login")}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-lg bg-transparent text-white border-white hover:bg-white/10"
            onClick={() => router.push("/pwa/register")}
          >
            Create Account
          </Button>
        </div>

        {/* Install Prompt */}
        <p className="text-center text-sm text-blue-100">💡 Add to your home screen for quick access</p>
      </div>
    </div>
  )
}
