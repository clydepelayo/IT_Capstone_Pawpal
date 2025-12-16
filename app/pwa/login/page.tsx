"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Loader2, Mail, Lock, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function PWALogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutEnd, setLockoutEnd] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<string>("")
  const router = useRouter()

  // Check for existing lockout in localStorage
  useEffect(() => {
    const storedLockout = localStorage.getItem("pwa_login_lockout")
    if (storedLockout) {
      const lockoutData = JSON.parse(storedLockout)
      const lockoutEndTime = new Date(lockoutData.lockoutEnd)

      if (lockoutEndTime > new Date()) {
        setIsLocked(true)
        setLockoutEnd(lockoutEndTime)
        setFailedAttempts(lockoutData.attempts)
      } else {
        // Lockout expired, clear it
        localStorage.removeItem("pwa_login_lockout")
      }
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!isLocked || !lockoutEnd) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = lockoutEnd.getTime() - now.getTime()

      if (diff <= 0) {
        // Lockout expired
        setIsLocked(false)
        setLockoutEnd(null)
        setFailedAttempts(0)
        setRemainingTime("")
        localStorage.removeItem("pwa_login_lockout")
        clearInterval(interval)
      } else {
        // Calculate remaining time
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setRemainingTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocked, lockoutEnd])

  const handleLockout = (attempts: number) => {
    const lockoutEndTime = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    setIsLocked(true)
    setLockoutEnd(lockoutEndTime)
    setFailedAttempts(attempts)

    // Store in localStorage
    localStorage.setItem(
      "pwa_login_lockout",
      JSON.stringify({
        lockoutEnd: lockoutEndTime.toISOString(),
        attempts,
      }),
    )
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      setError(`Account is locked. Please wait ${remainingTime} before trying again.`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "client" }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setShowOtpInput(true)
        setFailedAttempts(0) // Reset on success
        localStorage.removeItem("pwa_login_lockout")
      } else {
        const newAttempts = data.failedAttempts || failedAttempts + 1
        setFailedAttempts(newAttempts)

        if (response.status === 423 || newAttempts >= 5) {
          // Account locked
          handleLockout(newAttempts)
          setError(data.message || `Too many failed attempts. Account locked for 5 minutes.`)
        } else {
          const remaining = 5 - newAttempts
          setError(
            data.message ||
              `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`,
          )
        }
      }
    } catch (error) {
      setError("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      setError(`Account is locked. Please wait ${remainingTime} before trying again.`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          otp,
          role: "client",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear lockout on success
        localStorage.removeItem("pwa_login_lockout")
        router.push("/pwa/dashboard")
      } else {
        const newAttempts = data.failedAttempts || failedAttempts + 1
        setFailedAttempts(newAttempts)

        if (response.status === 423 || newAttempts >= 5) {
          // Account locked
          handleLockout(newAttempts)
          setError(data.message || `Too many failed attempts. Account locked for 5 minutes.`)
        } else {
          const remaining = 5 - newAttempts
          setError(
            data.message || `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`,
          )
        }
      }
    } catch (error) {
      setError("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col p-4">
      {/* Header */}
      <div className="pt-4 pb-8">
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to manage your pet appointments</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Lockout Alert */}
            {isLocked && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <Clock className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900">
                  <div className="font-semibold">Account Temporarily Locked</div>
                  <div className="text-sm mt-1">
                    Too many failed attempts. Please wait <strong>{remainingTime}</strong> before trying again.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && !isLocked && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Failed Attempts Warning */}
            {failedAttempts > 0 && failedAttempts < 5 && !isLocked && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  {5 - failedAttempts} attempt{5 - failedAttempts !== 1 ? "s" : ""} remaining before 5-minute lockout
                </AlertDescription>
              </Alert>
            )}

            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || isLocked}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || isLocked}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading || isLocked}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : isLocked ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Locked ({remainingTime})
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    We've sent a 6-digit code to <strong>{email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                    disabled={isLoading || isLocked}
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading || isLocked}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : isLocked ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Locked ({remainingTime})
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowOtpInput(false)
                    setOtp("")
                    setError("")
                  }}
                  disabled={isLoading || isLocked}
                >
                  Use Different Email
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/pwa/register" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
