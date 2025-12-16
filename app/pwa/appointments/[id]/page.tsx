"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, Home, MapPin, FileText, PhilippinePeso, Heart, CalendarDays, Timer, CheckCircle2, XCircle } from 'lucide-react'

interface AppointmentDetails {
  id: number
  appointment_date: string
  appointment_time: string
  status: string
  notes: string
  service_name: string
  service_description: string
  service_price: number
  pet_names: string
  pet_species: string
  pet_breeds: string
  pet_genders: string
  pet_weights: string
  pet_ages_display: string
  is_boarding?: boolean
  check_in_date?: string
  check_out_date?: string
  boarding_instructions?: string
  cage_id?: number
  cage_number?: string
  cage_type?: string
  cage_location?: string
  cage_daily_rate?: number
  boarding_duration_days?: number
  total_boarding_cost?: number
  boarding_id_verified?: boolean | number
  boarding_signature_verified?: boolean | number
  boarding_id_rejection_reason?: string
  boarding_signature_rejection_reason?: string
}

interface AppointmentPageProps {
  params: Promise<{ id: string }>
}

export default function PWAAppointmentDetails({ params }: AppointmentPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAppointment()
  }, [resolvedParams.id])

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/client/appointments/${resolvedParams.id}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
      } else {
        router.push("/pwa/login")
      }
    } catch (error) {
      console.error("Error fetching appointment:", error)
    } finally {
      setIsLoading(false)
    }
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

  const getDocumentStatus = () => {
    if (!appointment?.is_boarding) return null

    if (appointment.status === "rejected") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
          <XCircle className="h-3 w-3" />
          Documents Rejected
        </Badge>
      )
    }

    const idVerified = appointment.boarding_id_verified === true || appointment.boarding_id_verified === 1
    const signatureVerified =
      appointment.boarding_signature_verified === true || appointment.boarding_signature_verified === 1

    if (idVerified && signatureVerified) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" />
          Documents Verified
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
        <Clock className="h-3 w-3" />
        Under Review
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatPrice = (amount: any): string => {
    // Convert to number and handle invalid values
    const numAmount = Number(amount)
    if (isNaN(numAmount)) {
      return "₱0.00"
    }
    return `₱${numAmount.toFixed(2)}`
  }

  const getSpeciesIcon = (species: string) => {
    const firstSpecies = species.split(',')[0].trim()
    switch (firstSpecies.toLowerCase()) {
      case "dog":
        return "🐕"
      case "cat":
        return "🐱"
      case "bird":
        return "🐦"
      case "rabbit":
        return "🐰"
      default:
        return "🐾"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Appointment not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const serviceCost = Number(appointment.service_price) || 0
  const boardingCost = Number(appointment.total_boarding_cost) || 0
  const totalCost = serviceCost + boardingCost

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {appointment.is_boarding ? "Boarding Details" : "Appointment Details"}
            </h1>
            <p className="text-sm text-blue-100">#{appointment.id}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={getStatusColor(appointment.status)}>{appointment.status.toUpperCase()}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {appointment.is_boarding ? <Home className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Service</p>
              <p className="font-semibold">{appointment.service_name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-sm">{appointment.service_description}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service Cost</span>
              <span className="font-semibold text-green-600">{formatPrice(serviceCost)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Date/Time or Boarding Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {appointment.is_boarding ? "Boarding Schedule" : "Appointment Schedule"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointment.is_boarding ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-green-600" />
                      Check-in
                    </p>
                    <p className="font-semibold text-sm text-green-700">
                      {appointment.check_in_date ? formatDate(appointment.check_in_date) : "N/A"}
                    </p>
                    <p className="text-xs text-gray-600">{formatTime(appointment.appointment_time)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-red-600" />
                      Check-out
                    </p>
                    <p className="font-semibold text-sm text-red-700">
                      {appointment.check_out_date ? formatDate(appointment.check_out_date) : "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <span className="font-semibold text-blue-700">{appointment.boarding_duration_days || 0} days</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{formatDate(appointment.appointment_date)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold">{formatTime(appointment.appointment_time)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cage Info (Boarding only) */}
        {appointment.is_boarding && appointment.cage_id && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5" />
                Cage Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Cage {appointment.cage_number}</p>
                  <p className="text-sm text-gray-600 capitalize">{appointment.cage_type?.replace("_", " ")}</p>
                </div>
                <span className="text-2xl">
                  {appointment.cage_type === "small"
                    ? "🐱"
                    : appointment.cage_type === "medium"
                      ? "🐕"
                      : appointment.cage_type === "large"
                        ? "🐕‍🦺"
                        : "🏠"}
                </span>
              </div>
              <Separator />
              {appointment.cage_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{appointment.cage_location}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <span className="text-sm font-medium">Daily Rate</span>
                <span className="font-semibold text-green-600">{formatPrice(appointment.cage_daily_rate || 0)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pet Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Pet Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointment.pet_names && appointment.pet_names.trim() !== '' ? (
              appointment.pet_names.split(', ').map((petName, index) => {
                const species = appointment.pet_species?.split(', ')[index] || ''
                const breed = appointment.pet_breeds?.split(', ')[index] || 'Mixed breed'
                const gender = appointment.pet_genders?.split(', ')[index] || ''
                const weight = appointment.pet_weights?.split(', ')[index] || ''
                const age = appointment.pet_ages_display?.split(', ')[index] || ''
                
                return (
                  <div key={index}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getSpeciesIcon(species)}</span>
                      <div>
                        <p className="font-semibold text-lg">{petName}</p>
                        <p className="text-sm text-gray-600">{breed}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Species</p>
                        <p className="font-medium capitalize">{species}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Gender</p>
                        <p className="font-medium capitalize">{gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Age</p>
                        <p className="font-medium">{age}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Weight</p>
                        <p className="font-medium">{weight} kg</p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No pet information available</p>
            )}
          </CardContent>
        </Card>

        {/* Document Status (Boarding only) */}
        {appointment.is_boarding && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getDocumentStatus()}
              {appointment.status === "rejected" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  {appointment.boarding_id_rejection_reason && (
                    <div>
                      <p className="text-sm font-medium text-red-900">📄 ID Rejection:</p>
                      <p className="text-sm text-red-700">{appointment.boarding_id_rejection_reason}</p>
                    </div>
                  )}
                  {appointment.boarding_signature_rejection_reason && (
                    <div>
                      <p className="text-sm font-medium text-red-900">✍️ Signature Rejection:</p>
                      <p className="text-sm text-red-700">{appointment.boarding_signature_rejection_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {appointment.is_boarding ? "Boarding Instructions" : "Notes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-gray-50 p-3 rounded-lg">
              {appointment.is_boarding
                ? appointment.boarding_instructions || "No special instructions"
                : appointment.notes || "No additional notes"}
            </p>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Amount</p>
                <p className="text-3xl font-bold">{formatPrice(totalCost)}</p>
              </div>
              <PhilippinePeso className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
