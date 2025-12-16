"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Edit, Trash2, Eye, Receipt, CheckCircle, X, Check, Calendar, CalendarDays, Clock3, Home, MapPin, Ruler, Bed, Utensils, Activity, Info, AlertTriangle, Shield, FileText, XCircle, CheckCheck, ImageIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Appointment {
  id: number
  user_id: number
  client_name: string
  client_email: string
  client_phone: string
  pet_names: string
  pet_species: string
  pet_breeds: string
  service_name: string
  category_name: string
  appointment_date: string
  appointment_time: string
  status: string
  service_price: string
  total_amount: string | null
  payment_method: string
  receipt_url: string
  receipt_verified?: boolean | number
  receipt_verified_at?: string
  receipt_verified_by?: number
  notes: string
  special_instructions: string
  cage_id?: number
  cage_number?: string
  cage_type?: string
  cage_location?: string
  cage_amenities?: string
  cage_rate?: number
  check_in_date?: string
  check_out_date?: string
  boarding_days?: number
  boarding_id_url?: string
  boarding_signature_url?: string
  boarding_id_verified?: boolean | number
  boarding_signature_verified?: boolean | number
  boarding_id_verified_at?: string
  boarding_signature_verified_at?: string
  boarding_id_rejection_reason?: string
  boarding_signature_rejection_reason?: string
  created_at: string
}

export default function AdminAppointments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<Appointment | null>(null)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [selectedBoardingDetails, setSelectedBoardingDetails] = useState<Appointment | null>(null)
  const [isBoardingDialogOpen, setIsBoardingDialogOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Appointment | null>(null)
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [verifyingDocument, setVerifyingDocument] = useState<"id" | "signature" | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<Appointment | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/admin/appointments", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId)
    const isBoardingService = appointment?.cage_id
    const isCashPayment = appointment?.payment_method?.toLowerCase() === "cash"

    if (
      newStatus === "in_progress" &&
      isBoardingService &&
      appointment?.boarding_id_url &&
      appointment?.boarding_signature_url &&
      (!appointment?.boarding_id_verified || !appointment?.boarding_signature_verified)
    ) {
      toast({
        title: "Documents Not Verified",
        description: "Please verify both ID and signature documents before marking as in progress.",
        variant: "destructive",
      })
      return
    }

    if (
      !isCashPayment &&
      (newStatus === "in_progress" || newStatus === "completed") &&
      !appointment?.receipt_verified
    ) {
      toast({
        title: "Receipt Not Verified",
        description: "Please verify the payment receipt before marking as in progress or completed.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Status updated",
          description: "Appointment status has been updated successfully.",
        })
        fetchAppointments()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update appointment status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const verifyReceipt = async (appointmentId: number, isApproved: boolean) => {
    setIsVerifying(true)

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}/verify-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ approved: isApproved }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: isApproved ? "Receipt approved" : "Receipt rejected",
          description: isApproved
            ? "Receipt has been verified and appointment marked as paid."
            : "Receipt has been rejected and appointment status updated.",
        })

        if (selectedReceipt) {
          setSelectedReceipt({
            ...selectedReceipt,
            // Check isApproved to update receipt_verified field
            receipt_verified: isApproved,
            receipt_verified_at: new Date().toISOString(),
            // Assuming receipt_verified_by would come from user context, setting to null for now
            receipt_verified_by: null,
            status: isApproved ? "paid" : "pending payment",
          })
        }

        setIsReceiptDialogOpen(false)
        setSelectedReceipt(null)
        await fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to verify receipt.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying receipt:", error)
      toast({
        title: "Error",
        description: "Something went wrong while verifying receipt.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyDocument = async (documentType: "id" | "signature", approved: boolean) => {
    if (!selectedDocuments) return

    if (!approved && !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the document",
        variant: "destructive",
      })
      return
    }

    setVerifyingDocument(documentType)

    try {
      const response = await fetch(`/api/admin/appointments/${selectedDocuments.id}/verify-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          documentType,
          approved,
          rejectionReason: !approved ? rejectionReason : null,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: `${documentType === "id" ? "ID" : "Signature"} ${approved ? "Verified" : "Rejected"}`,
          description: approved
            ? `The ${documentType === "id" ? "ID document" : "signature"} has been verified successfully.`
            : `The ${documentType === "id" ? "ID document" : "signature"} has been rejected. Appointment status changed to rejected.`,
          variant: approved ? "default" : "destructive",
        })

        // Refresh appointments list
        await fetchAppointments()

        // Fetch the updated appointment to refresh the dialog
        const updatedResponse = await fetch("/api/admin/appointments", {
          credentials: "include",
        })

        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json()
          const updatedAppointment = updatedData.find((apt: Appointment) => apt.id === selectedDocuments.id)

          if (updatedAppointment) {
            setSelectedDocuments(updatedAppointment)
          }
        }

        setRejectionReason("")

        if (!approved) {
          setTimeout(() => {
            setIsDocumentsDialogOpen(false)
            setSelectedDocuments(null)
          }, 2000)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to verify document.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying document:", error)
      toast({
        title: "Error",
        description: "Something went wrong while verifying document.",
        variant: "destructive",
      })
    } finally {
      setVerifyingDocument(null)
    }
  }

  const deleteAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Appointment deleted",
          description: "Appointment has been deleted successfully.",
        })
        fetchAppointments()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete appointment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const openReceiptDialog = (appointment: Appointment) => {
    setSelectedReceipt(appointment)
    setIsReceiptDialogOpen(true)
  }

  const openBoardingDialog = (appointment: Appointment) => {
    setSelectedBoardingDetails(appointment)
    setIsBoardingDialogOpen(true)
  }

  const openDocumentsDialog = (appointment: Appointment) => {
    setSelectedDocuments(appointment)
    setIsDocumentsDialogOpen(true)
    setRejectionReason("")
  }

  const fetchAppointmentDetails = async (appointmentId: number) => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}/details`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedAppointmentDetails(data)
        setIsDetailsDialogOpen(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointment details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching appointment details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.cage_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined
    const matchesServiceType =
      serviceTypeFilter === "all" ||
      (serviceTypeFilter === "boarding" && isBoardingService) ||
      (serviceTypeFilter === "appointment" && !isBoardingService)

    return matchesSearch && matchesStatus && matchesServiceType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "pending payment":
        return "destructive"
      case "paid":
        return "default"
      case "cancelled":
        return "destructive"
      case "rejected":
        return "destructive"
      case "in_progress":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "pending payment":
        return "Pending Payment"
      case "in_progress":
        return "In Progress"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getServiceTypeBadge = (appointment: Appointment) => {
    const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined

    if (isBoardingService) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <Home className="h-3 w-3" />
          Boarding
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Appointment
      </Badge>
    )
  }

  const getDocumentVerificationBadge = (appointment: Appointment) => {
    const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined
    if (!isBoardingService) return null

    if (appointment.status === "rejected") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    }

    if (!appointment.boarding_id_url || !appointment.boarding_signature_url) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          No Documents
        </Badge>
      )
    }

    const idVerified = appointment.boarding_id_verified === true || appointment.boarding_id_verified === 1
    const signatureVerified =
      appointment.boarding_signature_verified === true || appointment.boarding_signature_verified === 1
    const idRejected = appointment.boarding_id_verified === false || appointment.boarding_id_verified === 0
    const signatureRejected =
      appointment.boarding_signature_verified === false || appointment.boarding_signature_verified === 0

    if (idVerified && signatureVerified) {
      return (
        <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
          <CheckCheck className="h-3 w-3" />
          Verified
        </Badge>
      )
    }

    if (
      (idRejected && appointment.boarding_id_rejection_reason) ||
      (signatureRejected && appointment.boarding_signature_rejection_reason)
    ) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock3 className="h-3 w-3" />
        Pending Review
      </Badge>
    )
  }

  const getIndividualDocumentBadge = (verified: boolean | number | undefined, hasRejectionReason: boolean) => {
    // Check if verified (can be boolean true or number 1)
    if (verified === true || verified === 1) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    }

    // Check if rejected (verified is false/0 or has rejection reason)
    if (verified === false || verified === 0 || hasRejectionReason) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    }

    // Otherwise pending
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        <Clock3 className="h-3 w-3 mr-1" />
        Pending Review
      </Badge>
    )
  }

  const getCageTypeIcon = (type: string): string => {
    const icons = {
      small: "🐱",
      medium: "🐕",
      large: "🐕‍🦺",
      extra_large: "🐺",
    }
    return icons[type as keyof typeof icons] || "🏠"
  }

  const getCageTypeLabel = (type: string): string => {
    const labels = {
      small: "Small",
      medium: "Medium",
      large: "Large",
      extra_large: "Extra Large",
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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

  const calculateStayDuration = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

    return {
      days: diffDays,
      hours: diffHours,
      totalHours: diffHours,
    }
  }

  const canVerifyReceipt = (appointment: Appointment) => {
    return appointment.receipt_url && !appointment.receipt_verified
  }

  const getModalActionButtons = () => {
    if (!selectedReceipt) return null

    const isVerified = selectedReceipt.receipt_verified === true || selectedReceipt.receipt_verified === 1
    const hasReceipt = selectedReceipt.receipt_url

    if (isVerified) {
      return (
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
            Close
          </Button>
          <Button variant="default" disabled>
            <Check className="h-4 w-4 mr-2" />
            Already Verified
          </Button>
        </DialogFooter>
      )
    }

    if (!hasReceipt) {
      return (
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
            Close
          </Button>
          <Button variant="secondary" disabled>
            No Receipt to Verify
          </Button>
        </DialogFooter>
      )
    }

    return (
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)} disabled={isVerifying}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => selectedReceipt && verifyReceipt(selectedReceipt.id, false)}
          disabled={isVerifying}
        >
          <X className="h-4 w-4 mr-2" />
          Reject Receipt
        </Button>
        <Button onClick={() => selectedReceipt && verifyReceipt(selectedReceipt.id, true)} disabled={isVerifying}>
          <Check className="h-4 w-4 mr-2" />
          {isVerifying ? "Verifying..." : "Approve & Mark as Paid"}
        </Button>
      </DialogFooter>
    )
  }

  const getAppointmentStats = () => {
    const total = appointments.length
    const pending = appointments.filter((a) => a.status === "pending").length
    const pendingPayment = appointments.filter((a) => a.status === "pending payment").length
    const confirmed = appointments.filter((a) => a.status === "confirmed").length
    const completed = appointments.filter((a) => a.status === "completed").length
    const rejected = appointments.filter((a) => a.status === "rejected").length
    const boarding = appointments.filter((a) => a.cage_id !== null && a.cage_id !== undefined).length

    return { total, pending, pendingPayment, confirmed, completed, rejected, boarding }
  }

  const formatAmount = (amount: string | null, servicePrice: string) => {
    if (amount && amount !== null) {
      return `₱${Number.parseFloat(amount).toLocaleString()}`
    } else if (servicePrice && servicePrice !== null) {
      return `₱${Number.parseFloat(servicePrice).toLocaleString()}`
    }
    return "₱0.00"
  }

  const stats = getAppointmentStats()

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Appointments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600">Manage all clinic appointments and boarding reservations</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Boarding</CardTitle>
                <Home className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.boarding}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock3 className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayment}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search appointments, clients, pets, or cage numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="boarding">Boarding</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="pending payment">Pending Payment</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Appointments & Boarding Reservations</CardTitle>
              <CardDescription>
                {filteredAppointments.length} of {appointments.length} appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Client & Pet</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date/Duration</TableHead>
                        <TableHead>Cage Details</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => {
                        const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined
                        const duration =
                          isBoardingService && appointment.check_in_date && appointment.check_out_date
                            ? calculateStayDuration(appointment.check_in_date, appointment.check_out_date)
                            : null

                        return (
                          <TableRow key={appointment.id} className="hover:bg-muted/50">
                            <TableCell>{getServiceTypeBadge(appointment)}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{appointment.client_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {appointment.pet_names} ({appointment.pet_species})
                                </div>
                                <div className="text-xs text-muted-foreground">{appointment.client_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{appointment.service_name}</div>
                                <div className="text-sm text-muted-foreground">{appointment.category_name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {isBoardingService && appointment.check_in_date && appointment.check_out_date ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <CalendarDays className="h-3 w-3 text-green-600" />
                                    <span className="font-medium">In: {formatDate(appointment.check_in_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <CalendarDays className="h-3 w-3 text-red-600" />
                                    <span className="font-medium">Out: {formatDate(appointment.check_out_date)}</span>
                                  </div>
                                  {duration && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock3 className="h-3 w-3" />
                                      <span>
                                        {duration.days} days ({duration.totalHours}h total)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div>{formatDate(appointment.appointment_date)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatTime(appointment.appointment_time)}
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isBoardingService && appointment.cage_number ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-lg">{getCageTypeIcon(appointment.cage_type || "")}</span>
                                    <span className="font-medium">Cage {appointment.cage_number}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {getCageTypeLabel(appointment.cage_type || "")} Size
                                  </div>
                                  {appointment.cage_rate && (
                                    <div className="text-xs font-medium text-green-600">
                                      ₱{Number(appointment.cage_rate).toFixed(2)}/day
                                    </div>
                                  )}
                                  {appointment.cage_location && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="h-2 w-2" />
                                      <span>{appointment.cage_location}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isBoardingService ? (
                                <div className="space-y-2">
                                  {getDocumentVerificationBadge(appointment)}
                                  {appointment.boarding_id_url && appointment.boarding_signature_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDocumentsDialog(appointment)}
                                      className="w-full"
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Review
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={appointment.status}
                                onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <Badge variant={getStatusColor(appointment.status)}>
                                    {formatStatus(appointment.status)}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="pending payment">Pending Payment</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>{formatAmount(appointment.total_amount, appointment.service_price)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {appointment.receipt_url ? (
                                  <div className="flex items-center gap-2">
                                    <Receipt
                                      className={`h-4 w-4 ${appointment.receipt_verified ? "text-green-600" : "text-blue-600"}`}
                                    />
                                    <Button variant="ghost" size="sm" onClick={() => openReceiptDialog(appointment)}>
                                      {appointment.receipt_verified ? "Verified" : "View"}
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">No receipt</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => fetchAppointmentDetails(appointment.id)}
                                  disabled={isLoadingDetails}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {isBoardingService && appointment.cage_id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openBoardingDialog(appointment)}
                                    title="Boarding Details"
                                  >
                                    <Info className="h-4 w-4 text-purple-600" />
                                  </Button>
                                )}
                                {canVerifyReceipt(appointment) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openReceiptDialog(appointment)}
                                    title="Verify Receipt"
                                  >
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => deleteAppointment(appointment.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!isLoading && filteredAppointments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No appointments found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReceipt?.receipt_verified ? "Payment Receipt (Verified)" : "Verify Payment Receipt"}
            </DialogTitle>
            <DialogDescription>
              {selectedReceipt?.receipt_verified
                ? `Payment receipt for ${selectedReceipt?.client_name}'s appointment has been verified`
                : `Review the payment receipt for ${selectedReceipt?.client_name}'s appointment`}
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Client</p>
                  <p className="text-sm">{selectedReceipt.client_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pet</p>
                  <p className="text-sm">{selectedReceipt.pet_names}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Service</p>
                  <p className="text-sm">{selectedReceipt.service_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm">{formatAmount(selectedReceipt.total_amount, selectedReceipt.service_price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm">{selectedReceipt.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <Badge variant={getStatusColor(selectedReceipt.status)}>{formatStatus(selectedReceipt.status)}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Payment Receipt</p>
                <div className="border rounded-lg p-4 bg-white">
                  {selectedReceipt.receipt_url ? (
                    <Image
                      src={selectedReceipt.receipt_url || "/placeholder.svg"}
                      alt="Payment Receipt"
                      width={600}
                      height={400}
                      className="max-w-full h-auto rounded-lg"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                      <p className="text-gray-500">No receipt uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {getModalActionButtons()}
        </DialogContent>
      </Dialog>

      <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Verify Boarding Documents - {selectedDocuments?.client_name}
            </DialogTitle>
            <DialogDescription>
              Review and verify the ID and signature documents for {selectedDocuments?.pet_name}'s boarding reservation
            </DialogDescription>
          </DialogHeader>

          {selectedDocuments && (
            <div className="space-y-6">
              {selectedDocuments.status === "rejected" && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Appointment Rejected</p>
                        <p className="text-sm text-red-700">
                          This appointment has been rejected due to document issues. The client needs to resubmit.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Client & Reservation Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client Name</p>
                    <p className="text-sm font-semibold">{selectedDocuments.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm">{selectedDocuments.client_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pet Name</p>
                    <p className="text-sm font-semibold">{selectedDocuments.pet_names}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cage</p>
                    <p className="text-sm">
                      {getCageTypeIcon(selectedDocuments.cage_type || "")} Cage {selectedDocuments.cage_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-in</p>
                    <p className="text-sm">
                      {selectedDocuments.check_in_date && formatDate(selectedDocuments.check_in_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-out</p>
                    <p className="text-sm">
                      {selectedDocuments.check_out_date && formatDate(selectedDocuments.check_out_date)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Valid Government-Issued ID
                    </CardTitle>
                    {getIndividualDocumentBadge(
                      selectedDocuments.boarding_id_verified,
                      !!selectedDocuments.boarding_id_rejection_reason,
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDocuments.boarding_id_url ? (
                    <>
                      <div className="border rounded-lg p-4 bg-white">
                        <Image
                          src={selectedDocuments.boarding_id_url || "/placeholder.svg"}
                          alt="Valid ID"
                          width={800}
                          height={600}
                          className="max-w-full h-auto rounded-lg"
                          style={{ objectFit: "contain" }}
                        />
                      </div>

                      {selectedDocuments.boarding_id_rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{selectedDocuments.boarding_id_rejection_reason}</p>
                        </div>
                      )}

                      {selectedDocuments.boarding_id_verified !== true &&
                        selectedDocuments.boarding_id_verified !== 1 &&
                        selectedDocuments.status !== "rejected" && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="id-rejection">Rejection Reason (if rejecting)</Label>
                              <Textarea
                                id="id-rejection"
                                placeholder="Enter reason if rejecting the ID..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => verifyDocument("id", false)}
                                disabled={verifyingDocument !== null}
                                className="flex-1"
                              >
                                <X className="h-4 w-4 mr-2" />
                                {verifyingDocument === "id" ? "Rejecting..." : "Reject ID"}
                              </Button>
                              <Button
                                onClick={() => verifyDocument("id", true)}
                                disabled={verifyingDocument !== null}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {verifyingDocument === "id" ? "Approving..." : "Approve ID"}
                              </Button>
                            </div>
                          </div>
                        )}

                      {(selectedDocuments.boarding_id_verified === true ||
                        selectedDocuments.boarding_id_verified === 1) &&
                        selectedDocuments.boarding_id_verified_at && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-700">
                              ✅ Verified on {formatDate(selectedDocuments.boarding_id_verified_at)}
                            </p>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No ID uploaded</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Client Signature
                    </CardTitle>
                    {getIndividualDocumentBadge(
                      selectedDocuments.boarding_signature_verified,
                      !!selectedDocuments.boarding_signature_rejection_reason,
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDocuments.boarding_signature_url ? (
                    <>
                      <div className="border rounded-lg p-4 bg-white">
                        <Image
                          src={selectedDocuments.boarding_signature_url || "/placeholder.svg"}
                          alt="Signature"
                          width={800}
                          height={400}
                          className="max-w-full h-auto rounded-lg"
                          style={{ objectFit: "contain" }}
                        />
                      </div>

                      {selectedDocuments.boarding_signature_rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">
                            {selectedDocuments.boarding_signature_rejection_reason}
                          </p>
                        </div>
                      )}

                      {selectedDocuments.boarding_signature_verified !== true &&
                        selectedDocuments.boarding_signature_verified !== 1 &&
                        selectedDocuments.status !== "rejected" && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="signature-rejection">Rejection Reason (if rejecting)</Label>
                              <Textarea
                                id="signature-rejection"
                                placeholder="Enter reason if rejecting the signature..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => verifyDocument("signature", false)}
                                disabled={verifyingDocument !== null}
                                className="flex-1"
                              >
                                <X className="h-4 w-4 mr-2" />
                                {verifyingDocument === "signature" ? "Rejecting..." : "Reject Signature"}
                              </Button>
                              <Button
                                onClick={() => verifyDocument("signature", true)}
                                disabled={verifyingDocument !== null}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {verifyingDocument === "signature" ? "Approving..." : "Approve Signature"}
                              </Button>
                            </div>
                          </div>
                        )}

                      {(selectedDocuments.boarding_signature_verified === true ||
                        selectedDocuments.boarding_signature_verified === 1) &&
                        selectedDocuments.boarding_signature_verified_at && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-700">
                              ✅ Verified on {formatDate(selectedDocuments.boarding_signature_verified_at)}
                            </p>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No signature uploaded</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(selectedDocuments.boarding_id_verified === true || selectedDocuments.boarding_id_verified === 1) &&
                (selectedDocuments.boarding_signature_verified === true ||
                  selectedDocuments.boarding_signature_verified === 1) && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">All Documents Verified</p>
                          <p className="text-sm text-green-700">
                            Both ID and signature have been verified. This boarding reservation can now proceed to "In
                            Progress" status.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocumentsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBoardingDialogOpen} onOpenChange={setIsBoardingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-600" />
              Boarding Details - {selectedBoardingDetails?.pet_name}
            </DialogTitle>
            <DialogDescription>Complete information about the boarding reservation</DialogDescription>
          </DialogHeader>

          {selectedBoardingDetails && (
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Stay Duration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Check-in</div>
                      <div className="text-lg font-semibold text-green-600">
                        {selectedBoardingDetails.check_in_date && formatDate(selectedBoardingDetails.check_in_date)}{" "}
                        9:00 AM
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Check-out</div>
                      <div className="text-lg font-semibold text-red-600">
                        {selectedBoardingDetails.check_out_date && formatDate(selectedBoardingDetails.check_out_date)}{" "}
                        5:00 PM
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {selectedBoardingDetails.check_in_date && selectedBoardingDetails.check_out_date && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {(() => {
                        const duration = calculateStayDuration(
                          selectedBoardingDetails.check_in_date!,
                          selectedBoardingDetails.check_out_date!,
                        )
                        return (
                          <>
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-blue-600">{duration.days}</div>
                              <div className="text-sm text-muted-foreground">Days</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-purple-600">{duration.totalHours}</div>
                              <div className="text-sm text-muted-foreground">Total Hours</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-green-600">
                                ₱
                                {selectedBoardingDetails.cage_rate
                                  ? (Number(selectedBoardingDetails.cage_rate) * duration.days).toFixed(2)
                                  : "0.00"}
                              </div>
                              <div className="text-sm text-muted-foreground">Boarding Cost</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Cage Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Cage Number</div>
                      <div className="text-xl font-bold flex items-center gap-2">
                        {getCageTypeIcon(selectedBoardingDetails.cage_type || "")}
                        Cage {selectedBoardingDetails.cage_number}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Size Category</div>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        <Ruler className="h-4 w-4 mr-1" />
                        {getCageTypeLabel(selectedBoardingDetails.cage_type || "")}
                      </Badge>
                    </div>
                  </div>

                  {selectedBoardingDetails.cage_location && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Location</div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedBoardingDetails.cage_location}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Daily Rate</div>
                    <div className="text-lg font-semibold text-green-600">
                      ₱{Number(selectedBoardingDetails.cage_rate || 0).toFixed(2)} per day
                    </div>
                  </div>

                  {selectedBoardingDetails.cage_amenities && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedBoardingDetails.cage_amenities.split(",").map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {amenity.trim().toLowerCase().includes("bed") && <Bed className="h-3 w-3" />}
                            {amenity.trim().toLowerCase().includes("food") && <Utensils className="h-3 w-3" />}
                            {amenity.trim().toLowerCase().includes("play") && <Activity className="h-3 w-3" />}
                            {amenity.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedBoardingDetails.special_instructions && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Special Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm">{selectedBoardingDetails.special_instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBoardingDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Appointment Details - {selectedAppointmentDetails?.pet_name}
            </DialogTitle>
            <DialogDescription>Complete information about the appointment</DialogDescription>
          </DialogHeader>

          {selectedAppointmentDetails && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-sm font-semibold">{selectedAppointmentDetails.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm">{selectedAppointmentDetails.client_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm">{selectedAppointmentDetails.client_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge variant={getStatusColor(selectedAppointmentDetails.status)}>
                      {formatStatus(selectedAppointmentDetails.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pet Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pet Name</p>
                    <p className="text-sm font-semibold">{selectedAppointmentDetails.pet_names}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Species</p>
                    <p className="text-sm">{selectedAppointmentDetails.pet_species}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Breed</p>
                    <p className="text-sm">{selectedAppointmentDetails.pet_breeds}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Service</p>
                      <p className="text-sm font-semibold">{selectedAppointmentDetails.service_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="text-sm">{selectedAppointmentDetails.category_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Service Type</p>
                      {getServiceTypeBadge(selectedAppointmentDetails)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatAmount(
                          selectedAppointmentDetails.total_amount,
                          selectedAppointmentDetails.service_price,
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedAppointmentDetails.cage_id ? (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-3">Appointment Duration</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Check-in</p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatDate(selectedAppointmentDetails.check_in_date || "")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Check-out</p>
                            <p className="text-sm font-semibold text-red-600">
                              {formatDate(selectedAppointmentDetails.check_out_date || "")}
                            </p>
                          </div>
                        </div>
                        {selectedAppointmentDetails.check_in_date && selectedAppointmentDetails.check_out_date && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="h-4 w-4" />
                            <span>
                              {
                                calculateStayDuration(
                                  selectedAppointmentDetails.check_in_date,
                                  selectedAppointmentDetails.check_out_date,
                                )?.days
                              }{" "}
                              days total
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date</p>
                          <p className="text-sm">{formatDate(selectedAppointmentDetails.appointment_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Time</p>
                          <p className="text-sm">{formatTime(selectedAppointmentDetails.appointment_time)}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {selectedAppointmentDetails.cage_id && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Cage Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Cage Number</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCageTypeIcon(selectedAppointmentDetails.cage_type || "")}</span>
                          <span className="font-semibold">Cage {selectedAppointmentDetails.cage_number}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Size</p>
                        <Badge variant="outline">{getCageTypeLabel(selectedAppointmentDetails.cage_type || "")}</Badge>
                      </div>
                      {selectedAppointmentDetails.cage_location && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{selectedAppointmentDetails.cage_location}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Daily Rate</p>
                        <p className="text-sm font-semibold text-green-600">
                          ₱{Number(selectedAppointmentDetails.cage_rate || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {selectedAppointmentDetails.cage_amenities && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointmentDetails.cage_amenities.split(",").map((amenity, index) => (
                            <Badge key={index} variant="secondary">
                              {amenity.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedAppointmentDetails.payment_method && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                        <p className="text-sm">{selectedAppointmentDetails.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Status</p>
                        <Badge variant={getStatusColor(selectedAppointmentDetails.status)}>
                          {formatStatus(selectedAppointmentDetails.status)}
                        </Badge>
                      </div>
                    </div>
                    {selectedAppointmentDetails.receipt_url && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Receipt</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReceiptDialog(selectedAppointmentDetails)}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {(selectedAppointmentDetails.notes || selectedAppointmentDetails.special_instructions) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAppointmentDetails.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <p className="text-sm">{selectedAppointmentDetails.notes}</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointmentDetails.special_instructions && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Special Instructions</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm">{selectedAppointmentDetails.special_instructions}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedAppointmentDetails.cage_id &&
                (selectedAppointmentDetails.boarding_id_url || selectedAppointmentDetails.boarding_signature_url) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Boarding Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Document Verification Status</p>
                          {getDocumentVerificationBadge(selectedAppointmentDetails)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDocumentsDialog(selectedAppointmentDetails)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Review Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
