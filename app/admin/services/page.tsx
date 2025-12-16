"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Heart, Home, Calendar, User, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration_minutes: number
  category_id: number
  category_name: string
  category_color: string
  status: string
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  color: string
  is_active: boolean
}

interface Cage {
  id: number
  cage_number: string
  cage_type: string
  capacity: number
  description: string
  daily_rate: number
  status: string
  current_pet_name?: string
  owner_first_name?: string
  owner_last_name?: string
  appointment_date?: string
  appointment_time?: string
  check_in_date?: string
  check_out_date?: string
  created_at: string
  updated_at: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cages, setCages] = useState<Cage[]>([])
  const [loading, setLoading] = useState(true)
  const [cagesLoading, setCagesLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cageStatusFilter, setCageStatusFilter] = useState("all")
  const [cageTypeFilter, setCageTypeFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [cageDialogOpen, setCageDialogOpen] = useState(false)
  const [editCageDialogOpen, setEditCageDialogOpen] = useState(false)
  const [newCage, setNewCage] = useState({
    cage_number: "",
    cage_type: "small",
    capacity: 1,
    description: "",
    daily_rate: "",
  })
  const [editCage, setEditCage] = useState({
    id: 0,
    cage_number: "",
    cage_type: "small",
    capacity: 1,
    description: "",
    daily_rate: "",
  })
  const [cageToDelete, setCageToDelete] = useState<Cage | null>(null)
  const [cageDeleteDialogOpen, setCageDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/services?${params}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setServices(Array.isArray(data.services) ? data.services : [])
      } else {
        console.error("Services fetch error:", data)
        setServices([])
        toast({
          title: "Error",
          description: data.error || "Failed to fetch services",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([])
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories?status=active")
      const data = await response.json()

      if (response.ok && data.success && Array.isArray(data.categories)) {
        setCategories(data.categories)
      } else {
        console.error("Categories fetch error:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const fetchCages = async () => {
    try {
      const params = new URLSearchParams()
      if (cageStatusFilter !== "all") params.append("status", cageStatusFilter)
      if (cageTypeFilter !== "all") params.append("type", cageTypeFilter)

      const response = await fetch(`/api/admin/cages?${params}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setCages(Array.isArray(data.cages) ? data.cages : [])
      } else {
        console.error("Cages fetch error:", data)
        setCages([])
        toast({
          title: "Error",
          description: data.error || "Failed to fetch cages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching cages:", error)
      setCages([])
      toast({
        title: "Error",
        description: "Failed to fetch cages",
        variant: "destructive",
      })
    } finally {
      setCagesLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchServices()
  }, [search, categoryFilter, statusFilter])

  useEffect(() => {
    fetchCages()
  }, [cageStatusFilter, cageTypeFilter])

  const handleDeleteService = async () => {
    if (!serviceToDelete) return

    try {
      const response = await fetch(`/api/admin/services/${serviceToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Service deleted successfully",
        })
        fetchServices()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete service",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  const handleCreateCage = async () => {
    try {
      const response = await fetch("/api/admin/cages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cage_number: newCage.cage_number,
          cage_type: newCage.cage_type,
          capacity: Number.parseInt(newCage.capacity.toString()),
          description: newCage.description,
          daily_rate: Number.parseFloat(newCage.daily_rate),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Cage created successfully",
        })
        setCageDialogOpen(false)
        setNewCage({
          cage_number: "",
          cage_type: "small",
          capacity: 1,
          description: "",
          daily_rate: "",
        })
        fetchCages()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create cage",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating cage:", error)
      toast({
        title: "Error",
        description: "Failed to create cage",
        variant: "destructive",
      })
    }
  }

  const handleEditService = (serviceId: number) => {
    router.push(`/admin/services/${serviceId}/edit`)
  }

  const handleEditCage = (cage: Cage) => {
    setEditCage({
      id: cage.id,
      cage_number: cage.cage_number,
      cage_type: cage.cage_type,
      capacity: cage.capacity,
      description: cage.description || "",
      daily_rate: cage.daily_rate.toString(),
    })
    setEditCageDialogOpen(true)
  }

  const handleUpdateCage = async () => {
    try {
      const response = await fetch(`/api/admin/cages/${editCage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cage_number: editCage.cage_number,
          cage_type: editCage.cage_type,
          capacity: Number.parseInt(editCage.capacity.toString()),
          description: editCage.description,
          daily_rate: Number.parseFloat(editCage.daily_rate),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Cage updated successfully",
        })
        setEditCageDialogOpen(false)
        setEditCage({
          id: 0,
          cage_number: "",
          cage_type: "small",
          capacity: 1,
          description: "",
          daily_rate: "",
        })
        fetchCages()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update cage",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating cage:", error)
      toast({
        title: "Error",
        description: "Failed to update cage",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCage = (cage: Cage) => {
    setCageToDelete(cage)
    setCageDeleteDialogOpen(true)
  }

  const handleConfirmDeleteCage = async () => {
    if (!cageToDelete) return

    try {
      const response = await fetch(`/api/admin/cages/${cageToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Cage deleted successfully",
        })
        fetchCages()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete cage",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting cage:", error)
      toast({
        title: "Error",
        description: "Failed to delete cage",
        variant: "destructive",
      })
    } finally {
      setCageDeleteDialogOpen(false)
      setCageToDelete(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const getCageStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "reserved":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCageTypeIcon = (type: string) => {
    switch (type) {
      case "small":
        return "🐱"
      case "medium":
        return "🐕"
      case "large":
        return "🐕‍🦺"
      case "extra_large":
        return "🐕‍🦺🐕‍🦺"
      default:
        return "🏠"
    }
  }

  const openDeleteDialog = (service: Service) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  if (loading) {
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
                  <BreadcrumbPage>Services</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading services...</p>
              </div>
            </div>
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
                <BreadcrumbPage>Services & Cages</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Services & Cage Management</h1>
              <p className="text-gray-600">Manage veterinary services and boarding cages</p>
            </div>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="cages" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Boarding Cages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Veterinary Services</h2>
                <Link href="/admin/services/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </Link>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Filter Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search services..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Heart className="h-8 w-8 text-gray-400" />
                              <p className="text-gray-500">No services found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{service.name}</div>
                                {service.description && (
                                  <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {service.category_name ? (
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: service.category_color }}
                                  />
                                  {service.category_name}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">No category</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{formatPrice(service.price)}</TableCell>
                            <TableCell>{formatDuration(service.duration_minutes)}</TableCell>
                            <TableCell>
                              <Badge variant={service.status === "active" ? "default" : "secondary"}>
                                {service.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(service.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditService(service.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openDeleteDialog(service)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cages" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Boarding Cages</h2>
                <Dialog open={cageDialogOpen} onOpenChange={setCageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cage
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Cage</DialogTitle>
                      <DialogDescription>Create a new boarding cage for pets</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cage_number">Cage Number *</Label>
                          <Input
                            id="cage_number"
                            placeholder="e.g., C001"
                            value={newCage.cage_number}
                            onChange={(e) => setNewCage({ ...newCage, cage_number: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cage_type">Cage Type *</Label>
                          <Select
                            value={newCage.cage_type}
                            onValueChange={(value) => setNewCage({ ...newCage, cage_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">🐱 Small (Cats, Small Dogs)</SelectItem>
                              <SelectItem value="medium">🐕 Medium (Medium Dogs)</SelectItem>
                              <SelectItem value="large">🐕‍🦺 Large (Large Dogs)</SelectItem>
                              <SelectItem value="extra_large">🐕‍🦺🐕‍🦺 Extra Large (Multiple Pets)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacity *</Label>
                          <Input
                            id="capacity"
                            type="number"
                            min="1"
                            value={newCage.capacity}
                            onChange={(e) => setNewCage({ ...newCage, capacity: Number.parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="daily_rate">Daily Rate (₱) *</Label>
                          <Input
                            id="daily_rate"
                            type="number"
                            step="0.01"
                            placeholder="500.00"
                            value={newCage.daily_rate}
                            onChange={(e) => setNewCage({ ...newCage, daily_rate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the cage features..."
                          value={newCage.description}
                          onChange={(e) => setNewCage({ ...newCage, description: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateCage} className="flex-1">
                          Create Cage
                        </Button>
                        <Button variant="outline" onClick={() => setCageDialogOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Filter Cages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Select value={cageStatusFilter} onValueChange={setCageStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={cageTypeFilter} onValueChange={setCageTypeFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by type" />
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

              {cagesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading cages...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cages.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <Home className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No cages found</p>
                      <p className="text-gray-400 text-sm">Add your first boarding cage to get started</p>
                    </div>
                  ) : (
                    cages.map((cage) => (
                      <Card key={cage.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getCageTypeIcon(cage.cage_type)}</span>
                              <div>
                                <CardTitle className="text-lg">{cage.cage_number}</CardTitle>
                                <p className="text-sm text-gray-500 capitalize">{cage.cage_type.replace("_", " ")}</p>
                              </div>
                            </div>
                            <Badge className={getCageStatusColor(cage.status)}>{cage.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Daily Rate:</span>
                            <span className="font-semibold">{formatPrice(cage.daily_rate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Capacity:</span>
                            <span className="font-semibold">
                              {cage.capacity} pet{cage.capacity > 1 ? "s" : ""}
                            </span>
                          </div>

                          {cage.status === "occupied" && cage.current_pet_name && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Currently Occupied</span>
                              </div>
                              <p className="text-sm text-red-700">
                                Pet: <span className="font-medium">{cage.current_pet_name}</span>
                              </p>
                              {cage.owner_first_name && (
                                <p className="text-sm text-red-700">
                                  Owner:{" "}
                                  <span className="font-medium">
                                    {cage.owner_first_name} {cage.owner_last_name}
                                  </span>
                                </p>
                              )}
                              {cage.check_in_date && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3 text-red-600" />
                                  <span className="text-xs text-red-600">
                                    Since: {new Date(cage.check_in_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {cage.status === "reserved" && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Reserved</span>
                              </div>
                            </div>
                          )}

                          {cage.status === "maintenance" && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-800">Under Maintenance</span>
                              </div>
                            </div>
                          )}

                          {cage.description && <p className="text-sm text-gray-600 line-clamp-2">{cage.description}</p>}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => handleEditCage(cage)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteCage(cage)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      {/* Edit Cage Modal */}
      <Dialog open={editCageDialogOpen} onOpenChange={setEditCageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cage</DialogTitle>
            <DialogDescription>Update cage information and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_cage_number">Cage Number *</Label>
                <Input
                  id="edit_cage_number"
                  placeholder="e.g., C001"
                  value={editCage.cage_number}
                  onChange={(e) => setEditCage({ ...editCage, cage_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cage_type">Cage Type *</Label>
                <Select
                  value={editCage.cage_type}
                  onValueChange={(value) => setEditCage({ ...editCage, cage_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">🐱 Small (Cats, Small Dogs)</SelectItem>
                    <SelectItem value="medium">🐕 Medium (Medium Dogs)</SelectItem>
                    <SelectItem value="large">🐕‍🦺 Large (Large Dogs)</SelectItem>
                    <SelectItem value="extra_large">🐕‍🦺🐕‍🦺 Extra Large (Multiple Pets)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_capacity">Capacity *</Label>
                <Input
                  id="edit_capacity"
                  type="number"
                  min="1"
                  value={editCage.capacity}
                  onChange={(e) => setEditCage({ ...editCage, capacity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_daily_rate">Daily Rate (₱) *</Label>
                <Input
                  id="edit_daily_rate"
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  value={editCage.daily_rate}
                  onChange={(e) => setEditCage({ ...editCage, daily_rate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                placeholder="Describe the cage features..."
                value={editCage.description}
                onChange={(e) => setEditCage({ ...editCage, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateCage} className="flex-1">
                Update Cage
              </Button>
              <Button variant="outline" onClick={() => setEditCageDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteService}
      />

      <ConfirmDialog
        open={cageDeleteDialogOpen}
        onOpenChange={setCageDeleteDialogOpen}
        title="Remove Cage"
        description={`Are you sure you want to remove cage "${cageToDelete?.cage_number}"? This action cannot be undone and will affect any existing reservations.`}
        onConfirm={handleConfirmDeleteCage}
      />
    </SidebarProvider>
  )
}
