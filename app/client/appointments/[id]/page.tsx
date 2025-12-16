"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  FileText,
  DollarSign,
  X,
  MapPin,
  Home,
  CalendarDays,
  Timer,
  Bed,
  Utensils,
  Play,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface AppointmentDetails {
  id: number
  appointment_date: string
  appointment_time: string
  status: string
  notes: string
  created_at: string
  service_name: string
  service_description: string
  duration_minutes: number
  service_price: number
  pet_name: string
  species: string
  breed: string
  birth_date: string
  gender: string
  payment_amount: number,
  weight_kg: number
  color: string
  calculated_age: {
    years: number
    months: number
    display: string
  }
  // Boarding specific fields
  is_boarding?: boolean
  check_in_date?: string
  check_out_date?: string
  boarding_instructions?: string
  cage_id?: number
  cage_number?: string
  cage_type?: string
  cage_size_category?: string
  cage_location?: string
  cage_daily_rate?: number
  cage_amenities?: string
  boarding_duration_days?: number
  boarding_duration_hours?: number
  total_boarding_cost?: number
}

interface AppointmentPageProps {
  params: Promise<{ id: string }>
}

export default function AppointmentPage({ params }: AppointmentPageProps) {
  const resolvedParams = use(params)
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { toast } = useToast()

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
      } else if (response.status === 404) {
        toast({
          title: "Appointment not found",
          description: "The appointment you're looking for doesn't exist",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointment details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointment:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching appointment details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!appointment) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/client/appointments/${appointment.id}/cancel`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        })
        fetchAppointment() // Refresh appointment data
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to cancel appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Something went wrong while cancelling the appointment",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const canCancelAppointment = (appointment: AppointmentDetails) => {
    if (appointment.status !== "pending") return false

    const appointmentDateTime =
      appointment.is_boarding && appointment.check_in_date
        ? new Date(`${appointment.check_in_date}T${appointment.appointment_time}`)
        : new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)

    const now = new Date()
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursDifference > 24
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      confirmed: { color: "bg-blue-100 text-blue-800", icon: Calendar },
      completed: { color: "bg-green-100 text-green-800", icon: Calendar },
      cancelled: { color: "bg-red-100 text-red-800", icon: X },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getServiceTypeBadge = (isBoarding: boolean) => {
    if (isBoarding) {
      return (
        <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <Home className="h-3 w-3" />
          Boarding Service
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Appointment
      </Badge>
    )
  }

  const getCageTypeEmoji = (cageType: string) => {
    switch (cageType?.toLowerCase()) {
      case "small":
        return "🐱"
      case "medium":
        return "🐕"
      case "large":
        return "🐕‍🦺"
      case "extra large":
        return "🐺"
      default:
        return "🏠"
    }
  }

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case "dog":
        return "🐕"
      case "cat":
        return "🐱"
      case "bird":
        return "🐦"
      case "rabbit":
        return "🐰"
      case "hamster":
        return "🐹"
      case "fish":
        return "🐠"
      default:
        return "🐾"
    }
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
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "₱0.00"
    }
    return `₱${Number(price).toFixed(2)}`
  }

  const parseAmenities = (amenities: string) => {
    if (!amenities) return []
    try {
      return JSON.parse(amenities)
    } catch {
      return amenities.split(",").map((a) => a.trim())
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "bed":
        return <Bed className="h-3 w-3" />
      case "food":
        return <Utensils className="h-3 w-3" />
      case "play area":
        return <Play className="h-3 w-3" />
      case "climate control":
        return <Shield className="h-3 w-3" />
      default:
        return <Shield className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/client/appointments">Appointments</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Appointment Details</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading appointment details...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!appointment) {
    return (
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/client/appointments">Appointments</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Appointment Details</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="text-center py-8">
              <p className="text-gray-500">Appointment not found</p>
              <Button asChild className="mt-4">
                <Link href="/client/appointments">Back to Appointments</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/client/appointments">Appointments</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{appointment.is_boarding ? "Boarding Details" : "Appointment Details"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/client/appointments">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Appointments
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {appointment.is_boarding ? "Boarding Details" : "Appointment Details"}
                  </h1>
                  {getServiceTypeBadge(appointment.is_boarding || false)}
                </div>
                <p className="text-gray-600">
                  {appointment.is_boarding
                    ? "View your pet boarding reservation information"
                    : "View your appointment information"}
                </p>
              </div>
            </div>
            {canCancelAppointment(appointment) && (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <X className="h-4 w-4 mr-2" />
                Cancel {appointment.is_boarding ? "Boarding" : "Appointment"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment/Boarding Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {appointment.is_boarding ? <Home className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  {appointment.is_boarding ? "Boarding Information" : "Appointment Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(appointment.status)}
                </div>

                {appointment.is_boarding ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-green-600" />
                          Check-in Date
                        </span>
                        <p className="font-medium text-green-700">
                          {appointment.check_in_date ? formatDate(appointment.check_in_date) : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">{formatTime(appointment.appointment_time)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-red-600" />
                          Check-out Date
                        </span>
                        <p className="font-medium text-red-700">
                          {appointment.check_out_date ? formatDate(appointment.check_out_date) : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          Duration
                        </span>
                        <p className="font-medium">{appointment.boarding_duration_days || 0} days</p>
                        <p className="text-sm text-gray-600">
                          ({appointment.boarding_duration_hours || 0} total hours)
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Booked on</span>
                        <p className="font-medium">{formatDate(appointment.created_at)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm text-gray-500">Date</span>
                      <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Time</span>
                      <p className="font-medium">{formatTime(appointment.appointment_time)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Duration</span>
                      <p className="font-medium">
                        {appointment.duration_minutes ? `${appointment.duration_minutes} minutes` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Booked on</span>
                      <p className="font-medium">{formatDate(appointment.created_at)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Service</span>
                  <p className="font-medium">{appointment.service_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="text-sm text-gray-600">{appointment.service_description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-500">Service Cost</span>
                  <p className="font-medium text-green-600">{formatPrice(appointment.service_price)}</p>
                </div>

                {appointment.is_boarding && appointment.total_boarding_cost && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-500">Boarding Cost</span>
                    <p className="font-medium text-purple-600">{formatPrice(appointment.total_boarding_cost)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {appointment.cage_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Cage Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCageTypeEmoji(appointment.cage_type || "")}</span>
                    <div>
                      <p className="font-medium">Cage {appointment.cage_number}</p>
                      <p className="text-sm text-gray-500 capitalize">{appointment.cage_size_category} Size</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Type</span>
                      <p className="font-medium capitalize">{appointment.cage_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Daily Rate</span>
                      <p className="font-medium text-green-600">
                        {appointment.cage_daily_rate ? formatPrice(appointment.cage_daily_rate) : "N/A"}
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Pet Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Pet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSpeciesIcon(appointment.species)}</span>
                  <div>
                    <p className="font-medium">{appointment.pet_name}</p>
                    <p className="text-sm text-gray-500">{appointment.breed || "Mixed breed"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Species</span>
                    <p className="font-medium capitalize">{appointment.species}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Gender</span>
                    <p className="font-medium capitalize">{appointment.gender}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Age</span>
                    <p className="font-medium">{appointment.calculated_age.display}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Weight</span>
                    <p className="font-medium">{appointment.weight_kg} kg</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Color</span>
                  <p className="font-medium">{appointment.color || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className={appointment.is_boarding ? "lg:col-span-2" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">
                    {appointment.is_boarding ? "Boarding Instructions" : "Notes"}
                  </span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">
                    {appointment.is_boarding
                      ? appointment.boarding_instructions || "No special boarding instructions provided"
                      : appointment.notes || "No additional notes provided"}
                  </p>
                </div>

                {appointment.is_boarding ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Service Amount</h4>
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(appointment.service_price)}</p>
                    </div>

                    {appointment.total_boarding_cost && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Boarding Amount</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatPrice(appointment.total_boarding_cost)}
                        </p>
                        <p className="text-sm text-purple-700 mt-1">
                          {appointment.boarding_duration_days} days × {formatPrice(appointment.cage_daily_rate || 0)}
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-green-50 rounded-lg md:col-span-2">
                      <h4 className="font-medium text-green-900 mb-2">Total Amount</h4>
                      <p className="text-3xl font-bold text-green-600">
                        {formatPrice(appointment.payment_amount || 0)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Service Amount</h4>
                    <p className="text-3xl font-bold text-blue-600">{formatPrice(appointment.service_price)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={`Cancel ${appointment.is_boarding ? "Boarding" : "Appointment"}`}
        description={`Are you sure you want to cancel this ${appointment.is_boarding ? "boarding reservation" : "appointment"}? This action cannot be undone.`}
        onConfirm={handleCancelAppointment}
        isLoading={isCancelling}
      />
    </SidebarProvider>
  )
}
