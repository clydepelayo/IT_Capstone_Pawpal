"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowLeft, User, PawPrint, Calendar, Receipt, Mail, Phone, MapPin } from "lucide-react"

export default function UserDetails() {
  const params = useParams()
  const userId = params.id
  const [user, setUser] = useState<any>(null)
  const [pets, setPets] = useState([])
  const [appointments, setAppointments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      // Fetch user details
      const userResponse = await fetch(`/api/admin/users/${userId}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }

      // Fetch user's pets
      const petsResponse = await fetch(`/api/admin/users/${userId}/pets`)
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData)
      }

      // Fetch user's appointments
      const appointmentsResponse = await fetch(`/api/admin/users/${userId}/appointments`)
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)
      }

      // Fetch user's transactions
      const transactionsResponse = await fetch(`/api/admin/users/${userId}/transactions`)
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">Loading user details...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!user) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">User not found</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
                <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {user.first_name} {user.last_name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{user.address}</p>
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5" />
                  Pets ({pets.length})
                </CardTitle>
                <CardDescription>Registered pets</CardDescription>
              </CardHeader>
              <CardContent>
                {pets.length > 0 ? (
                  <div className="space-y-3">
                    {pets.slice(0, 5).map((pet: any) => (
                      <div key={pet.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {pet.species} • {pet.breed}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {pet.species}
                        </Badge>
                      </div>
                    ))}
                    {pets.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">+{pets.length - 5} more pets</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No pets registered</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest appointments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appointment: any) => (
                    <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="text-gray-500 text-center py-4">No recent activity</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Appointments
              </CardTitle>
              <CardDescription>Complete appointment history</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Pet</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
                        <TableCell>{appointment.pet_name}</TableCell>
                        <TableCell>{appointment.service_name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {appointment.total_amount ? `₱${appointment.total_amount.toLocaleString()}` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              )}
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>Payment records</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.transaction_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>₱{transaction.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
