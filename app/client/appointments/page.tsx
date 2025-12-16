"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Calendar, Clock, Search, Eye, Home, CalendarDays, XCircle, CheckCircle2, AlertTriangle, Upload, FileText, Shield, File } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"


interface Appointment {
  id: number
  pet_names: string
  pet_species?: string
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string
  created_at: string
  cage_id?: number
  cage_number?: string
  cage_type?: string
  check_in_date?: string
  check_out_date?: string
  boarding_days?: number
  boarding_id_url?: string
  boarding_signature_url?: string
  boarding_id_verified?: boolean | number
  boarding_signature_verified?: boolean | number
  boarding_id_rejection_reason?: string
  boarding_signature_rejection_reason?: string
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReuploadDialog, setShowReuploadDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/client/appointments", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        let appointmentsArray: Appointment[] = []

        if (Array.isArray(data)) {
          appointmentsArray = data
        } else if (data.appointments && Array.isArray(data.appointments)) {
          appointmentsArray = data.appointments
        } else if (data.data && Array.isArray(data.data)) {
          appointmentsArray = data.data
        } else {
          console.error("Unexpected data format:", data)
          appointmentsArray = []
        }

        setAppointments(appointmentsArray)
      } else {
        console.error("Failed to fetch appointments")
        setAppointments([])
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReuploadDocuments = async () => {
    if (!selectedAppointment) return

    if (!idFile && !signatureFile) {
      alert("Please select at least one document to upload")
      return
    }

    setIsUploading(true)

    try {
      const resetResponse = await fetch(`/api/client/appointments/${selectedAppointment.id}/reupload-documents`, {
        method: "POST",
        credentials: "include",
      })

      if (!resetResponse.ok) {
        const error = await resetResponse.json()
        throw new Error(error.message || "Failed to reset verification status")
      }

      if (idFile) {
        const idFormData = new FormData()
        idFormData.append("id", idFile)
        idFormData.append("appointmentId", selectedAppointment.id.toString())

        const idResponse = await fetch("/api/client/appointments/upload-boarding-id", {
          method: "POST",
          credentials: "include",
          body: idFormData,
        })

        if (!idResponse.ok) {
          throw new Error("Failed to upload ID")
        }
      }

      if (signatureFile) {
        const signatureFormData = new FormData()
        signatureFormData.append("signature", signatureFile)
        signatureFormData.append("appointmentId", selectedAppointment.id.toString())

        const signatureResponse = await fetch("/api/client/appointments/upload-boarding-signature", {
          method: "POST",
          credentials: "include",
          body: signatureFormData,
        })

        if (!signatureResponse.ok) {
          throw new Error("Failed to upload signature")
        }
      }

      alert(
        "Documents uploaded successfully! Your appointment status has been changed to pending and will be reviewed by our admin team.",
      )

      setShowReuploadDialog(false)
      setSelectedAppointment(null)
      setIdFile(null)
      setSignatureFile(null)
      await fetchAppointments()
    } catch (error) {
      console.error("Error re-uploading documents:", error)
      alert(error instanceof Error ? error.message : "Failed to upload documents")
    } finally {
      setIsUploading(false)
    }
  }

  const openReuploadDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowReuploadDialog(true)
    setIdFile(null)
    setSignatureFile(null)
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.pet_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.cage_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getServiceTypeBadge = (appointment: Appointment) => {
    const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined

    if (isBoardingService) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          <Home className="h-3 w-3 mr-1" />
          Boarding
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800">
        <Calendar className="h-3 w-3 mr-1" />
        Appointment
      </Badge>
    )
  }

  const getDocumentStatusBadgeAndAction = (appointment: Appointment) => {
    const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined
    if (!isBoardingService) {
      return (
        <div className="flex items-center justify-center text-muted-foreground">
          <span className="text-sm">N/A</span>
        </div>
      )
    }

    if (appointment.status === "rejected") {
      const hasIdRejection = appointment.boarding_id_rejection_reason
      const hasSignatureRejection = appointment.boarding_signature_rejection_reason

      if (hasIdRejection || hasSignatureRejection) {
        return (
          <div className="space-y-2">
            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
              <XCircle className="h-3 w-3" />
              Rejected
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openReuploadDialog(appointment)}
              className="w-full flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Upload className="h-3 w-3" />
              Re-upload
            </Button>
          </div>
        )
      }
    }

    if (!appointment.boarding_id_url || !appointment.boarding_signature_url) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Missing
        </Badge>
      )
    }

    const idVerified = appointment.boarding_id_verified === true || appointment.boarding_id_verified === 1
    const signatureVerified =
      appointment.boarding_signature_verified === true || appointment.boarding_signature_verified === 1

    if (idVerified && signatureVerified) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Under Review
      </Badge>
    )
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

  const getCageTypeIcon = (type: string): string => {
    const icons = {
      small: "🐱",
      medium: "🐕",
      large: "🐕‍🦺",
      extra_large: "🐺",
    }
    return icons[type as keyof typeof icons] || "🏠"
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    boarding: appointments.filter((a) => a.cage_id !== null && a.cage_id !== undefined).length,
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-8">Loading appointments...</div>
      </div>
    )
  }

  return (
    <>
    <SidebarProvider>
      <ClientSidebar/>
      <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
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
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">View and manage your veterinary appointments and boarding reservations</p>
          </div>
          <Button asChild>
            <Link href="/client/appointments/book">Book New Appointment</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boarding Stays</CardTitle>
              <Home className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.boarding}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search appointments, pets, or cage numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointments & Boarding Reservations</CardTitle>
            <CardDescription>
              {filteredAppointments.length} of {appointments.length} appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Pet & Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Cage Details</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-gray-500">No appointments found.</p>
                        <Button asChild className="mt-4">
                          <Link href="/client/appointments/book">Book Your First Appointment</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => {
                      const isBoardingService = appointment.cage_id !== null && appointment.cage_id !== undefined

                      return (
                        <TableRow key={appointment.id} className="hover:bg-muted/50">
                          <TableCell>{getServiceTypeBadge(appointment)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{appointment.pet_names || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{appointment.service_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isBoardingService && appointment.check_in_date && appointment.check_out_date ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <CalendarDays className="h-3 w-3 text-green-600" />
                                  <span className="text-xs">In: {formatDate(appointment.check_in_date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <CalendarDays className="h-3 w-3 text-red-600" />
                                  <span className="text-xs">Out: {formatDate(appointment.check_out_date)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-sm">{formatDate(appointment.appointment_date)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(appointment.appointment_time)}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isBoardingService && appointment.cage_number ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <span>{getCageTypeIcon(appointment.cage_type || "")}</span>
                                  <span>Cage {appointment.cage_number}</span>
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {appointment.cage_type?.replace("_", " ")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isBoardingService && appointment.boarding_days ? (
                              <div className="text-sm">
                                <div className="font-medium">{appointment.boarding_days} days</div>
                                <div className="text-xs text-muted-foreground">
                                  {appointment.boarding_days * 24} hours
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getDocumentStatusBadgeAndAction(appointment)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/client/appointments/${appointment.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              {isBoardingService && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/client/appointments/${appointment.id}`}>
                                    <Shield className="h-4 w-4 mr-1" />
                                    Details
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showReuploadDialog} onOpenChange={setShowReuploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Re-upload Boarding Documents
            </DialogTitle>
            <DialogDescription>
              Your previous documents were rejected. Please upload new documents for review.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {(selectedAppointment.boarding_id_rejection_reason ||
                selectedAppointment.boarding_signature_rejection_reason) && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Rejection Reasons:</p>
                      {selectedAppointment.boarding_id_rejection_reason && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">ID Document:</p>
                          <p className="text-sm mt-1">{selectedAppointment.boarding_id_rejection_reason}</p>
                        </div>
                      )}
                      {selectedAppointment.boarding_signature_rejection_reason && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Signature:</p>
                          <p className="text-sm mt-1">{selectedAppointment.boarding_signature_rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id-reupload" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Valid Government-Issued ID
                    {selectedAppointment.boarding_id_rejection_reason && (
                      <span className="text-red-600 text-xs">(Rejected - Upload new)</span>
                    )}
                  </Label>
                  <Input
                    id="id-reupload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {idFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-700">
                        Selected: {idFile.name} ({(idFile.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature-reupload" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Signature
                    {selectedAppointment.boarding_signature_rejection_reason && (
                      <span className="text-red-600 text-xs">(Rejected - Upload new)</span>
                    )}
                  </Label>
                  <Input
                    id="signature-reupload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {signatureFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-700">
                        Selected: {signatureFile.name} ({(signatureFile.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> After uploading new documents, your appointment status will change to
                    "Pending" and will be reviewed by our admin team. You will receive a notification once the review is
                    complete.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReuploadDialog(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleReuploadDocuments} disabled={isUploading || (!idFile && !signatureFile)}>
              {isUploading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </SidebarInset>
      </SidebarProvider>
    </>
  )
}
