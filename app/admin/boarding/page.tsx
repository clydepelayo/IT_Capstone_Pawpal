"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Plus, Edit, Calendar, MapPin, PawPrint, Home, Phone, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BoardingCage {
  cage_id: number
  cage_number: string
  cage_type: string
  size_category: string
  location: string
  amenities: string
  daily_rate: string
  capacity: number
  description: string
  is_active: number
  availability_status: "available" | "occupied" | "reserved"

  // Current occupancy
  current_reservation_id?: number
  current_check_in?: string
  current_check_out?: string
  current_instructions?: string
  current_pet_name?: string
  current_pet_species?: string
  current_pet_breed?: string
  current_client_name?: string
  current_client_phone?: string

  // Next reservation
  next_reservation_id?: number
  next_check_in?: string
  next_check_out?: string
  next_pet_name?: string
  next_pet_species?: string
  next_pet_breed?: string
  next_client_name?: string
}

export default function AdminBoardingCages() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [cages, setCages] = useState<BoardingCage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCage, setSelectedCage] = useState<BoardingCage | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCages()
  }, [])

  const fetchCages = async () => {
    try {
      const response = await fetch("/api/admin/boarding", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched boarding cages:", data)
        // Ensure data is always an array
        setCages(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch cages:", response.status)
        setCages([]) // Set to empty array on error
        toast({
          title: "Error",
          description: "Failed to fetch boarding cages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching cages:", error)
      setCages([]) // Set to empty array on error
      toast({
        title: "Error",
        description: "Something went wrong while fetching cages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openDetailDialog = (cage: BoardingCage) => {
    setSelectedCage(cage)
    setIsDetailDialogOpen(true)
  }

  const filteredCages = Array.isArray(cages)
    ? cages.filter((cage) => {
        const matchesSearch =
          cage.cage_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.cage_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.current_pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.current_client_name?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || cage.availability_status === statusFilter
        const matchesType = typeFilter === "all" || cage.size_category === typeFilter

        return matchesSearch && matchesStatus && matchesType
      })
    : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "occupied":
        return "destructive"
      case "reserved":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getCageTypeEmoji = (sizeCategory: string) => {
    switch (sizeCategory?.toLowerCase()) {
      case "small":
        return "🐱"
      case "medium":
        return "🐕"
      case "large":
        return "🐕‍🦺"
      case "extra_large":
        return "🐺"
      default:
        return "🏠"
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const parseAmenities = (amenitiesString: string) => {
    if (!amenitiesString) return []
    try {
      return JSON.parse(amenitiesString)
    } catch {
      return amenitiesString.split(",").map((a) => a.trim())
    }
  }

  // Safe calculation of statistics with fallbacks
  const totalCages = Array.isArray(cages) ? cages.length : 0
  const availableCages = Array.isArray(cages) ? cages.filter((c) => c.availability_status === "available").length : 0
  const occupiedCages = Array.isArray(cages) ? cages.filter((c) => c.availability_status === "occupied").length : 0
  const reservedCages = Array.isArray(cages) ? cages.filter((c) => c.availability_status === "reserved").length : 0

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
                <BreadcrumbPage>Boarding Cages</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Boarding Cages</h1>
              <p className="text-gray-600">Manage cage availability and current occupancy</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cages</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{availableCages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{occupiedCages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reserved</CardTitle>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{reservedCages || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Cages */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Cages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cages, pets, or clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra_large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cages Grid */}
          {isLoading ? (
            <div className="text-center py-8">Loading cages...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCages.map((cage) => (
                <Card key={cage.cage_id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCageTypeEmoji(cage.size_category)}</span>
                        <div>
                          <CardTitle className="text-lg">{cage.cage_number}</CardTitle>
                          <CardDescription className="text-sm">
                            {cage.size_category?.replace("_", " ").charAt(0).toUpperCase() +
                              cage.size_category?.replace("_", " ").slice(1)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(cage.availability_status)} className="text-xs">
                        {cage.availability_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Daily Rate:</p>
                        <p className="text-lg font-bold">
                          ₱{Number.parseFloat(cage.daily_rate || "0").toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Capacity:</p>
                        <p className="font-semibold">
                          {cage.capacity || 0} pet{cage.capacity > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Current Occupancy */}
                    {cage.availability_status === "occupied" && cage.current_pet_name && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <p className="font-medium text-red-700 text-sm">Currently Occupied</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p>
                            <strong>Pet:</strong> {cage.current_pet_name} ({cage.current_pet_species})
                          </p>
                          <p>
                            <strong>Client:</strong> {cage.current_client_name}
                          </p>
                          <p>
                            <strong>Until:</strong> {formatDate(cage.current_check_out)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Next Reservation */}
                    {cage.availability_status === "reserved" && cage.next_pet_name && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <p className="font-medium text-yellow-700 text-sm">Next Reservation</p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p>
                            <strong>Pet:</strong> {cage.next_pet_name} ({cage.next_pet_species})
                          </p>
                          <p>
                            <strong>Client:</strong> {cage.next_client_name}
                          </p>
                          <p>
                            <strong>Check-in:</strong> {formatDate(cage.next_check_in)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Available Status */}
                    {cage.availability_status === "available" && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="font-medium text-green-700 text-sm">Available for Booking</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-600">{cage.description}</p>

                    <div className="flex gap-2 pt-2">
                     
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredCages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No cages found matching your criteria.</p>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Cage Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Cage {selectedCage?.cage_number} Details
            </DialogTitle>
            <DialogDescription>Complete information and occupancy details for this cage</DialogDescription>
          </DialogHeader>

          {selectedCage && (
            <div className="space-y-6">
              {/* Cage Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getCageTypeEmoji(selectedCage.size_category)}</span>
                    Cage Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cage Number</p>
                      <p className="text-lg font-semibold">{selectedCage.cage_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type & Size</p>
                      <p className="text-sm">{selectedCage.cage_type}</p>
                      <Badge variant="outline" className="mt-1">
                        {selectedCage.size_category?.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedCage.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Daily Rate</p>
                      <p className="text-lg font-bold">
                        ₱{Number.parseFloat(selectedCage.daily_rate || "0").toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Capacity</p>
                      <p className="text-sm">
                        {selectedCage.capacity || 0} pet{selectedCage.capacity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge variant={getStatusColor(selectedCage.availability_status)}>
                        {selectedCage.availability_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {parseAmenities(selectedCage.amenities).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm text-gray-600">{selectedCage.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Occupancy */}
              {selectedCage.availability_status === "occupied" && selectedCage.current_pet_name && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Current Occupancy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <PawPrint className="h-4 w-4" />
                          Pet Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-semibold">{selectedCage.current_pet_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Species & Breed</p>
                            <p className="text-sm">
                              {selectedCage.current_pet_species} - {selectedCage.current_pet_breed}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Client Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-semibold">{selectedCage.current_client_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedCage.current_client_phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-in Date</p>
                          <p className="text-sm font-semibold text-green-600">
                            {formatDate(selectedCage.current_check_in)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-out Date</p>
                          <p className="text-sm font-semibold text-red-600">
                            {formatDate(selectedCage.current_check_out)}
                          </p>
                        </div>
                      </div>
                      {selectedCage.current_instructions && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-500">Special Instructions</p>
                          <div className="bg-blue-50 p-3 rounded-lg mt-1">
                            <p className="text-sm">{selectedCage.current_instructions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Reservation */}
              {selectedCage.next_pet_name && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      Next Reservation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <PawPrint className="h-4 w-4" />
                          Pet Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-semibold">{selectedCage.next_pet_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Species & Breed</p>
                            <p className="text-sm">
                              {selectedCage.next_pet_species} - {selectedCage.next_pet_breed}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Client Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="font-semibold">{selectedCage.next_client_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-in Date</p>
                          <p className="text-sm font-semibold text-green-600">
                            {formatDate(selectedCage.next_check_in)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-out Date</p>
                          <p className="text-sm font-semibold text-red-600">
                            {formatDate(selectedCage.next_check_out)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available Status */}
              {selectedCage.availability_status === "available" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Available for Booking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      This cage is currently available and ready for new bookings. No current or upcoming reservations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
