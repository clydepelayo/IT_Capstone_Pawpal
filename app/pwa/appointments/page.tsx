"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Home, ArrowLeft, Search, Filter, ChevronRight } from "lucide-react"

interface Appointment {
  id: number
  pet_name: string
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
  cage_id?: number
  cage_number?: string
  check_in_date?: string
  check_out_date?: string
}

export default function PWAAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/client/appointments", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const appointmentsArray = Array.isArray(data) ? data : data.appointments || []
        setAppointments(appointmentsArray)
      } else {
        router.push("/pwa/login")
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
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
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Appointments</h1>
            <p className="text-sm text-blue-100">{filteredAppointments.length} total</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/90 backdrop-blur"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No appointments found</p>
            <Button onClick={() => router.push("/client/appointments/book")}>Book Appointment</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow"
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
                        <>
                          <span>Check-in: {formatDate(appointment.check_in_date)}</span>
                          {appointment.cage_number && <span>Cage {appointment.cage_number}</span>}
                        </>
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
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-xs text-blue-600 font-medium">Appointments</span>
        </Button>
      </div>
    </div>
  )
}
