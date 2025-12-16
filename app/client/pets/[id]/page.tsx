"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { ArrowLeft, Edit, Calendar, ShoppingBag, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Pet {
  id: number
  name: string
  species: string
  breed: string
  birth_date: string
  gender: string
  weight_kg: number
  color: string
  microchip_id: string
  medical_notes: string
  created_at: string
}

interface Appointment {
  id: number
  service_name: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string
}

interface Transaction {
  id: number
  transaction_type: string
  amount: number
  description: string
  transaction_date: string
  status: string
}

interface PetPageProps {
  params: Promise<{ id: string }>
}

const calculateAge = (birthDate: string) => {
  if (!birthDate) return "Unknown"

  const today = new Date()
  const birth = new Date(birthDate)

  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (today.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  if (years === 0 && months === 0) return "Newborn"
  if (years === 0) return `${months} month${months > 1 ? "s" : ""}`
  if (months === 0) return `${years} year${years > 1 ? "s" : ""}`
  return `${years}y ${months}m`
}

export default function PetPage({ params }: PetPageProps) {
  const resolvedParams = use(params)
  const [pet, setPet] = useState<Pet | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPetData()
  }, [resolvedParams.id])

  const fetchPetData = async () => {
    try {
      // Fetch pet details
      const petResponse = await fetch(`/api/client/pets/${resolvedParams.id}`, {
        credentials: "include",
      })
      if (petResponse.ok) {
        const petData = await petResponse.json()
        setPet(petData)
      }

      // Fetch appointments
      const appointmentsResponse = await fetch(`/api/client/pets/${resolvedParams.id}/appointments`, {
        credentials: "include",
      })
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)
      }

      // Fetch transactions
      const transactionsResponse = await fetch(`/api/client/pets/${resolvedParams.id}/transactions`, {
        credentials: "include",
      })
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error("Error fetching pet data:", error)
      toast({
        title: "Error",
        description: "Failed to load pet information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-red-100 text-red-800",
    }
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatPrice = (amount: number | string | null | undefined) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (numAmount === null || numAmount === undefined || isNaN(numAmount)) {
      return "₱0.00"
    }
    return `₱${numAmount.toFixed(2)}`
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
                  <BreadcrumbLink href="/client/pets">My Pets</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pet Details</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading pet details...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!pet) {
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
                  <BreadcrumbLink href="/client/pets">My Pets</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pet Details</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="text-center py-8">
              <p className="text-gray-500">Pet not found</p>
              <Button asChild className="mt-4">
                <Link href="/client/pets">Back to Pets</Link>
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
                <BreadcrumbLink href="/client/pets">My Pets</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pet.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/client/pets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pets
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getSpeciesIcon(pet.species)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <p className="text-gray-600">
                  {pet.breed} • {calculateAge(pet.birth_date)}
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <Button asChild>
                <Link href={`/client/pets/${pet.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Pet
                </Link>
              </Button>
            </div>
          </div>

          {/* Pet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Pet Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="text-sm text-gray-500">Species</span>
                  <p className="font-medium">{pet.species}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Breed</span>
                  <p className="font-medium">{pet.breed || "Mixed"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Gender</span>
                  <p className="font-medium">{pet.gender}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Age</span>
                  <p className="font-medium">{calculateAge(pet.birth_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Birth Date</span>
                  <p className="font-medium">{formatDate(pet.birth_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Weight</span>
                  <p className="font-medium">{pet.weight_kg} kg</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Color</span>
                  <p className="font-medium">{pet.color}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Microchip</span>
                  <p className="font-medium font-mono text-xs">{pet.microchip_id || "Not registered"}</p>
                </div>
              </div>
              {pet.medical_notes && (
                <div className="mt-6">
                  <span className="text-sm text-gray-500">Medical Notes</span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{pet.medical_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Appointments
              </CardTitle>
              <CardDescription>Latest appointments for {pet.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.slice(0, 5).map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{appointment.service_name}</TableCell>
                          <TableCell>{formatDate(appointment.appointment_date)}</TableCell>
                          <TableCell>{appointment.appointment_time}</TableCell>
                          <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">{appointment.notes || "No notes"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Financial history for {pet.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.transaction_type}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell>{formatPrice(transaction.amount)}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
