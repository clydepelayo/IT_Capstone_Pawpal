"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Heart, ShieldCheck, Loader2, Clock, Info, Lock, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null)
  const [lockoutMinutes, setLockoutMinutes] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [remainingAttempts, setRemainingAttempts] = useState(5)
  const [failedAttempts, setFailedAttempts] = useState(0)

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutEndTime || !isLocked) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remainingMs = lockoutEndTime - now

      if (remainingMs <= 0) {
        // Lockout expired
        clearInterval(interval)
        setIsLocked(false)
        setLockoutEndTime(null)
        setLockoutMinutes(0)
        setLockoutSeconds(0)
        setFailedAttempts(0)
        setRemainingAttempts(5)
        setError("")

        // Show success message
        setTimeout(() => {
          window.location.reload()
        }, 500)
        return
      }

      // Update display with remaining time
      const totalSeconds = Math.ceil(remainingMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      setLockoutMinutes(minutes)
      setLockoutSeconds(seconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutEndTime, isLocked])

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (isLocked) {
      setError(`Account is locked. Please wait ${lockoutMinutes}:${lockoutSeconds.toString().padStart(2, "0")}`)
      return
    }

    setIsLoading(true)
    setError("")
    setDevOtp(null)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "client" }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 423 && data.locked) {
          setIsLocked(true)
          const lockedUntil = new Date(data.lockedUntil).getTime()
          setLockoutEndTime(lockedUntil)
          setError(data.message)
        } else {
          setError(data.message || "Failed to send OTP")
        }
        return
      }

      setOtpSent(true)
      setResendTimer(60)
      setError("")

      // If in development mode, show OTP
      if (data.devMode && data.otp) {
        setDevOtp(data.otp)
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      setError(`Account is locked. Please wait ${lockoutMinutes}:${lockoutSeconds.toString().padStart(2, "0")}`)
      return
    }

    if (!email || !password || !otp) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          otp,
          role: "client",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 423 && data.locked) {
          setIsLocked(true)
          const lockedUntil = new Date(data.lockedUntil).getTime()
          setLockoutEndTime(lockedUntil)
          setError(data.message)
          setFailedAttempts(data.failedAttempts || 0)
        } else {
          setError(data.message || "Login failed")
          setRemainingAttempts(data.remainingAttempts ?? 5)
          setFailedAttempts(data.failedAttempts || 0)
        }
        return
      }

      // Login successful - clear all states
      setIsLocked(false)
      setLockoutEndTime(null)
      setFailedAttempts(0)
      setRemainingAttempts(5)

      // Redirect to dashboard
      router.push("/client")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full transition-colors ${isLocked ? "bg-red-100" : "bg-blue-100"}`}>
              {isLocked ? <Lock className="h-8 w-8 text-red-600" /> : <Heart className="h-8 w-8 text-blue-600" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{isLocked ? "Account Locked" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isLocked ? "Too many failed login attempts" : "Sign in to access your pet care account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Lockout Alert with Animated Timer */}
          {isLocked && (
            <Alert variant="destructive" className="mb-4 border-2 border-red-500">
              <Clock className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold">Account Temporarily Locked</AlertTitle>
              <AlertDescription className="space-y-4">
                <div className="text-sm mt-2">
                  Too many failed login attempts detected. For security reasons, your account has been temporarily
                  locked.
                </div>

                {/* Large Countdown Timer */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-center">
                    <div className="text-xs text-red-600 font-medium mb-2 uppercase tracking-wide">Time Remaining</div>
                    <div className="text-5xl font-mono font-bold text-red-700 tracking-wider">
                      {lockoutMinutes}:{lockoutSeconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs text-red-600 mt-2">minutes : seconds</div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <RefreshCw className="h-4 w-4" />
                    <span className="font-medium">Page will automatically reload when timer expires</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Failed attempts: <strong>{failedAttempts}</strong>
                    </span>
                  </div>
                </div>

                {/* What to do next */}
                <div className="text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200">
                  <div className="font-semibold mb-1">What you can do:</div>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Wait for the timer to reach 0:00</li>
                    <li>Make sure you have the correct password</li>
                    <li>Check your email for the correct OTP</li>
                    <li>Use the "Forgot password?" link if needed</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Dev Mode OTP Display */}
          {devOtp && !isLocked && (
            <Alert className="mb-4 border-blue-500 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Development Mode - Your OTP</AlertTitle>
              <AlertDescription>
                <div className="text-3xl font-mono font-bold text-center my-3 text-blue-900 bg-blue-100 py-2 rounded">
                  {devOtp}
                </div>
                <div className="text-xs text-blue-700">Copy this code and paste it into the OTP field below</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && !isLocked && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning for remaining attempts */}
          {!isLocked && remainingAttempts <= 3 && remainingAttempts > 0 && (
            <Alert className="mb-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 font-semibold">Warning: Limited Attempts Remaining</AlertTitle>
              <AlertDescription className="text-yellow-800">
                <div className="mt-1">
                  You have <strong className="text-lg">{remainingAttempts}</strong> attempt(s) remaining before your
                  account is locked for 5 minutes.
                </div>
                <div className="text-xs mt-2 bg-yellow-100 p-2 rounded">
                  💡 Tip: Make sure your password and OTP are correct before trying again.
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isLocked}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className={`text-sm hover:underline ${isLocked ? "text-gray-400 pointer-events-none" : "text-blue-600"}`}
                  tabIndex={isLocked ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isLocked}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isLocked}
                  tabIndex={isLocked ? -1 : 0}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isLoading || isLocked}
                  maxLength={6}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={isLoading || resendTimer > 0 || isLocked || !email}
                  className="whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : resendTimer > 0 ? (
                    `${resendTimer}s`
                  ) : otpSent ? (
                    "Resend"
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
              {otpSent && !isLocked && !devOtp && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  OTP sent to your email
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !otpSent || isLocked}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : isLocked ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Account Locked
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Login with OTP
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">OR</div>
          <div className="text-sm text-center">
            Don't have an account?{" "}
            <Link
              href="/register"
              className={`hover:underline font-medium ${isLocked ? "text-gray-400 pointer-events-none" : "text-blue-600"}`}
              tabIndex={isLocked ? -1 : 0}
            >
              Create Account
            </Link>
          </div>
          <Link
            href="/"
            className={`text-sm text-center w-full ${isLocked ? "text-gray-400 pointer-events-none" : "text-gray-600 hover:text-gray-800"}`}
            tabIndex={isLocked ? -1 : 0}
          >
            ← Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
