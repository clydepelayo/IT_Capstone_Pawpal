"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

interface Service {
  id: number
  name: string
  description: string
  category_id: number
  price: number
  duration_minutes: number
  status: string
}

interface Category {
  id: number
  name: string
  color: string
  is_active: boolean
}

export default function EditService({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const serviceId = resolvedParams.id
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    duration_minutes: "",
    status: "active",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingService, setIsLoadingService] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchService()
    fetchCategories()
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`)
      const data = await response.json()

      if (data.success && data.service) {
        const service: Service = data.service
        setFormData({
          name: service.name || "",
          description: service.description || "",
          category_id: service.category_id?.toString() || "",
          price: service.price?.toString() || "",
          duration_minutes: service.duration_minutes?.toString() || "",
          status: service.status || "active",
        })
      } else {
        console.error("Service fetch error:", data)
        toast({
          title: "Error",
          description: data.error || "Failed to fetch service details",
          variant: "destructive",
        })
        router.push("/admin/services")
      }
    } catch (error) {
      console.error("Error fetching service:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching service details",
        variant: "destructive",
      })
      router.push("/admin/services")
    } finally {
      setIsLoadingService(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories?status=active")
      const data = await response.json()

      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories)
      } else {
        console.error("Categories data is not an array:", data)
        setCategories([])
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category_id: Number.parseInt(formData.category_id),
          price: Number.parseFloat(formData.price),
          duration_minutes: Number.parseInt(formData.duration_minutes),
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Service updated successfully",
          description: `${formData.name} has been updated.`,
        })
        router.push("/admin/services")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update service.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoadingService) {
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
                  <BreadcrumbLink href="/admin/services">Services</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Service</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading service...</p>
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
                <BreadcrumbLink href="/admin/services">Services</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Service</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/services">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
              <p className="text-gray-600">Update service information</p>
            </div>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
              <CardDescription>Update the service details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., General Consultation"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleChange("category_id", value)}
                      disabled={isLoadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the service..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₱) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      placeholder="30"
                      value={formData.duration_minutes}
                      onChange={(e) => handleChange("duration_minutes", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Updating Service..." : "Update Service"}
                  </Button>
                  <Button asChild type="button" variant="outline" className="flex-1 bg-transparent">
                    <Link href="/admin/services">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
