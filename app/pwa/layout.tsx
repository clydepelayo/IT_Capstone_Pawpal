"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, ShoppingBag, ShoppingCart, User } from "lucide-react"
import { BadgeAPI } from "@/lib/badge"

export default function PWALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Register service worker on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/pwa/" })
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }

    // Initialize badge on app load
    const initializeBadge = async () => {
      try {
        const response = await fetch("/api/client/notifications", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          BadgeAPI.set(data.unreadCount)
        }
      } catch (error) {
        console.error("Error initializing badge:", error)
      }
    }

    initializeBadge()
  }, [])

  const isPublicRoute = pathname === "/pwa" || pathname === "/pwa/login" || pathname === "/pwa/register"

  const navItems = [
    { href: "/pwa/dashboard", icon: Home, label: "Home" },
    { href: "/pwa/appointments", icon: Calendar, label: "Appointments" },
    { href: "/pwa/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/pwa/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/pwa/profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {children}

      {/* Bottom Navigation - Only show on authenticated pages */}
      {!isPublicRoute && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
