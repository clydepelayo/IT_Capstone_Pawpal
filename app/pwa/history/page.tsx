"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Home, ArrowLeft, ChevronRight, History } from "lucide-react"

interface Appointment {
  id: number
  pet_name: string
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
  cage_id?: number
  check_in_date?: string
}

export default function PWAHistoryPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/client/appointments", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const appointmentsArray = Array.isArray(data) ? data : data.appointments || []
        const completed = appointmentsArray.filter(
          (apt: Appointment) => apt.status === "completed" || apt.status === "cancelled",
        )
        setAppointments(completed)
      } else {
        router.push("/pwa/login")
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">History</h1>
            <p className="text-sm text-blue-100">{appointments.length} past appointments</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointment history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="border-l-4 border-l-gray-300 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/pwa/appointments/${appointment.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {appointment.cage_id ? (
                        <>
                          <Home className="w-4 h-4 text-purple-600" />
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            Boarding
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Appointment
                          </Badge>
                        </>
                      )}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{appointment.service_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">🐾 {appointment.pet_name}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-gray-500">
                      {appointment.cage_id && appointment.check_in_date ? (
                        <span>Check-in: {formatDate(appointment.check_in_date)}</span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(appointment.appointment_date)}
                          </span>
                          <span>{formatTime(appointment.appointment_time)}</span>
                        </>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2"
          onClick={() => router.push("/pwa/dashboard")}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 h-auto py-2"
          onClick={() => router.push("/pwa/appointments")}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Appointments</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
          <History className="w-5 h-5 text-blue-600" />
          <span className="text-xs text-blue-600 font-medium">History</span>
        </Button>
      </div>
    </div>
  )
}
