"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeSidebar } from "@/components/employee-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Plus, Edit, Trash2, HomeIcon } from "lucide-react"
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
}

export default function EmployeeBoardingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [cages, setCages] = useState<BoardingCage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCage, setSelectedCage] = useState<BoardingCage | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [newCage, setNewCage] = useState({
    cage_number: "",
    cage_type: "Standard",
    size_category: "medium",
    daily_rate: "",
    capacity: "1",
    description: "",
  })

  const [editCage, setEditCage] = useState({
    cage_number: "",
    cage_type: "Standard",
    size_category: "medium",
    daily_rate: "",
    capacity: "1",
    description: "",
  })

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
        setCages(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch cages:", response.status)
        setCages([])
        toast({
          title: "Error",
          description: "Failed to fetch boarding cages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching cages:", error)
      setCages([])
      toast({
        title: "Error",
        description: "Something went wrong while fetching cages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCage = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/cages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cage_number: newCage.cage_number,
          cage_type: newCage.cage_type,
          capacity: Number.parseInt(newCage.capacity),
          description: newCage.description,
          daily_rate: Number.parseFloat(newCage.daily_rate),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cage created successfully",
        })
        setIsAddDialogOpen(false)
        setNewCage({
          cage_number: "",
          cage_type: "Standard",
          size_category: "medium",
          daily_rate: "",
          capacity: "1",
          description: "",
        })
        fetchCages()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create cage",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating cage:", error)
      toast({
        title: "Error",
        description: "Something went wrong while creating cage",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCage = (cage: BoardingCage) => {
    setSelectedCage(cage)
    setEditCage({
      cage_number: cage.cage_number,
      cage_type: cage.cage_type,
      size_category: cage.size_category,
      daily_rate: cage.daily_rate,
      capacity: cage.capacity.toString(),
      description: cage.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCage = async () => {
    if (!selectedCage) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/cages/${selectedCage.cage_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cage_number: editCage.cage_number,
          cage_type: editCage.cage_type,
          capacity: Number.parseInt(editCage.capacity),
          description: editCage.description,
          daily_rate: Number.parseFloat(editCage.daily_rate),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cage updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedCage(null)
        fetchCages()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update cage",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating cage:", error)
      toast({
        title: "Error",
        description: "Something went wrong while updating cage",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = (cage: BoardingCage) => {
    setSelectedCage(cage)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteCage = async () => {
    if (!selectedCage) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/cages/${selectedCage.cage_id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cage deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setSelectedCage(null)
        fetchCages()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete cage",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting cage:", error)
      toast({
        title: "Error",
        description: "Something went wrong while deleting cage",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCages = Array.isArray(cages)
    ? cages.filter((cage) => {
        const matchesSearch =
          cage.cage_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.cage_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.description?.toLowerCase().includes(searchTerm.toLowerCase())

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

  const getSizeCategoryLabel = (sizeCategory: string) => {
    switch (sizeCategory?.toLowerCase()) {
      case "small":
        return "Small"
      case "medium":
        return "Medium"
      case "large":
        return "Large"
      case "extra_large":
        return "Extra Large"
      default:
        return sizeCategory || "N/A"
    }
  }

  const totalCages = Array.isArray(cages) ? cages.length : 0
  const availableCages = Array.isArray(cages) ? cages.filter((c) => c.availability_status === "available").length : 0
  const occupiedCages = Array.isArray(cages) ? cages.filter((c) => c.availability_status === "occupied").length : 0
  const reservedCages = Array.isArray(cages) ? cages.filter((c) => c.availability_status === "reserved").length : 0

  return (
    <SidebarProvider>
      <EmployeeSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/employee/appointments">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Boarding Cages</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Boarding Cages</h1>
              <p className="text-gray-600">Manage cage availability and current occupancy</p>
            </div>
            <Button className="flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Cage
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Cages</CardTitle>
                <HomeIcon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{availableCages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Occupied</CardTitle>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{occupiedCages || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Reserved</CardTitle>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{reservedCages || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Section */}
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCages.map((cage) => (
                <Card key={cage.cage_id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <HomeIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg font-bold">{cage.cage_number}</CardTitle>
                          <CardDescription className="text-xs">
                            {getSizeCategoryLabel(cage.size_category)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(cage.availability_status)} className="text-xs">
                        {cage.availability_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Daily Rate:</p>
                        <p className="text-base font-bold">
                          ₱{Number.parseFloat(cage.daily_rate || "0").toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Capacity:</p>
                        <p className="text-sm font-semibold">
                          {cage.capacity || 0} pet{cage.capacity > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {cage.availability_status === "available" && (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="font-medium text-green-700 text-xs">Available for Booking</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 line-clamp-2">{cage.description || "No description"}</p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleEditCage(cage)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(cage)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredCages.length === 0 && (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No cages found matching your criteria.</p>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Add Cage Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Cage</DialogTitle>
            <DialogDescription>Create a new boarding cage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cage_number">Cage Number *</Label>
              <Input
                id="cage_number"
                value={newCage.cage_number}
                onChange={(e) => setNewCage({ ...newCage, cage_number: e.target.value })}
                placeholder="C001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cage_type">Cage Type *</Label>
              <Select value={newCage.cage_type} onValueChange={(value) => setNewCage({ ...newCage, cage_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_category">Size Category *</Label>
              <Select
                value={newCage.size_category}
                onValueChange={(value) => setNewCage({ ...newCage, size_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra_large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_rate">Daily Rate (₱) *</Label>
              <Input
                id="daily_rate"
                type="number"
                step="0.01"
                value={newCage.daily_rate}
                onChange={(e) => setNewCage({ ...newCage, daily_rate: e.target.value })}
                placeholder="500.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                value={newCage.capacity}
                onChange={(e) => setNewCage({ ...newCage, capacity: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCage.description}
                onChange={(e) => setNewCage({ ...newCage, description: e.target.value })}
                placeholder="Small cage suitable for cats and small dogs"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddCage} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Cage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cage Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cage</DialogTitle>
            <DialogDescription>Update cage information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_cage_number">Cage Number *</Label>
              <Input
                id="edit_cage_number"
                value={editCage.cage_number}
                onChange={(e) => setEditCage({ ...editCage, cage_number: e.target.value })}
                placeholder="C001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_cage_type">Cage Type *</Label>
              <Select
                value={editCage.cage_type}
                onValueChange={(value) => setEditCage({ ...editCage, cage_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_size_category">Size Category *</Label>
              <Select
                value={editCage.size_category}
                onValueChange={(value) => setEditCage({ ...editCage, size_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra_large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_daily_rate">Daily Rate (₱) *</Label>
              <Input
                id="edit_daily_rate"
                type="number"
                step="0.01"
                value={editCage.daily_rate}
                onChange={(e) => setEditCage({ ...editCage, daily_rate: e.target.value })}
                placeholder="500.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_capacity">Capacity *</Label>
              <Input
                id="edit_capacity"
                type="number"
                value={editCage.capacity}
                onChange={(e) => setEditCage({ ...editCage, capacity: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editCage.description}
                onChange={(e) => setEditCage({ ...editCage, description: e.target.value })}
                placeholder="Cage description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCage} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Cage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cage</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete cage <strong>{selectedCage?.cage_number}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCage} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Cage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
