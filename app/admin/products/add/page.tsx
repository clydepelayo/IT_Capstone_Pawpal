"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { ArrowLeft, Plus, Upload, LinkIcon, X, ImageIcon, Percent, Tag, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoMethod, setPhotoMethod] = useState<"url" | "upload">("url")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock_quantity: "",
    low_stock_threshold: "",
    sku: "",
    brand: "",
    weight_kg: "",
    status: "active",
    photo_url: "",
    is_on_sale: false,
    discount_type: "percentage",
    discount_value: "",
    discount_start_date: "",
    discount_end_date: "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Update photo preview when URL changes
    if (field === "photo_url" && typeof value === "string" && value) {
      setPhotoPreview(value)
    }
  }

  const calculateDiscountedPrice = () => {
    const price = Number.parseFloat(formData.price) || 0
    const discountValue = Number.parseFloat(formData.discount_value) || 0

    if (!formData.is_on_sale || discountValue === 0) {
      return price
    }

    if (formData.discount_type === "percentage") {
      return price - (price * discountValue) / 100
    } else {
      return Math.max(0, price - discountValue)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setPhotoPreview(data.url)
        setFormData((prev) => ({
          ...prev,
          photo_url: data.url,
        }))
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload image")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const clearPhoto = () => {
    setPhotoPreview(null)
    setFormData((prev) => ({
      ...prev,
      photo_url: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity),
          low_stock_threshold: Number.parseInt(formData.low_stock_threshold),
          sku: formData.sku || null,
          brand: formData.brand || null,
          weight_kg: formData.weight_kg ? Number.parseFloat(formData.weight_kg) : null,
          status: formData.status,
          photo_url: formData.photo_url || null,
          is_on_sale: formData.is_on_sale,
          discount_type: formData.is_on_sale ? formData.discount_type : null,
          discount_value:
            formData.is_on_sale && formData.discount_value ? Number.parseFloat(formData.discount_value) : null,
          discount_start_date:
            formData.is_on_sale && formData.discount_start_date ? formData.discount_start_date : null,
          discount_end_date: formData.is_on_sale && formData.discount_end_date ? formData.discount_end_date : null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product created successfully",
        })
        router.push("/admin/products")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to create product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: "Something went wrong while creating the product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const discountedPrice = calculateDiscountedPrice()
  const originalPrice = Number.parseFloat(formData.price) || 0

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
                <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product for your inventory</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Fill in the details for the new product</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Section */}
                <div className="space-y-4">
                  <Label>Product Photo</Label>
                  <div className="flex gap-4 mb-4">
                    <Button
                      type="button"
                      variant={photoMethod === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPhotoMethod("url")}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Photo URL
                    </Button>
                    <Button
                      type="button"
                      variant={photoMethod === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPhotoMethod("upload")}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {photoMethod === "url" ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter photo URL"
                        value={formData.photo_url}
                        onChange={(e) => handleInputChange("photo_url", e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Enter a direct link to an image (jpg, png, gif, webp)</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {isUploading && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Upload an image file (max 5MB, jpg/png/gif/webp). File will be saved to server.
                      </p>
                    </div>
                  )}

                  {photoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={() => {
                          setPhotoPreview(null)
                          toast({
                            title: "Invalid image",
                            description: "Could not load the image. Please check the URL or try a different image.",
                            variant: "destructive",
                          })
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={clearPhoto}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {!photoPreview && (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No photo</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="toys">Toys</SelectItem>
                        <SelectItem value="hygiene">Hygiene</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="Enter SKU (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₱) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                      placeholder="0.00 (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="low_stock_threshold">Low Stock Threshold *</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={(e) => handleInputChange("low_stock_threshold", e.target.value)}
                      placeholder="5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description (optional)"
                    rows={4}
                  />
                </div>

                {/* Discount Section */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Discount Settings</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="is_on_sale" className="text-sm font-normal">
                          Enable Discount
                        </Label>
                        <Switch
                          id="is_on_sale"
                          checked={formData.is_on_sale}
                          onCheckedChange={(checked) => handleInputChange("is_on_sale", checked)}
                        />
                      </div>
                    </div>
                    <CardDescription>Set up promotional pricing for this product</CardDescription>
                  </CardHeader>
                  {formData.is_on_sale && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount_type">Discount Type</Label>
                          <Select
                            value={formData.discount_type}
                            onValueChange={(value) => handleInputChange("discount_type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                <div className="flex items-center gap-2">
                                  <Percent className="h-4 w-4" />
                                  Percentage (%)
                                </div>
                              </SelectItem>
                              <SelectItem value="fixed">
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  Fixed Amount (₱)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount_value">
                            Discount Value {formData.discount_type === "percentage" ? "(%)" : "(₱)"}
                          </Label>
                          <Input
                            id="discount_value"
                            type="number"
                            step="0.01"
                            min="0"
                            max={formData.discount_type === "percentage" ? "100" : undefined}
                            value={formData.discount_value}
                            onChange={(e) => handleInputChange("discount_value", e.target.value)}
                            placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 100"}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount_start_date">Start Date (Optional)</Label>
                          <Input
                            id="discount_start_date"
                            type="datetime-local"
                            value={formData.discount_start_date}
                            onChange={(e) => handleInputChange("discount_start_date", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount_end_date">End Date (Optional)</Label>
                          <Input
                            id="discount_end_date"
                            type="datetime-local"
                            value={formData.discount_end_date}
                            onChange={(e) => handleInputChange("discount_end_date", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Price Preview */}
                      {formData.price && formData.discount_value && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Price Preview:</p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold text-blue-600">₱{discountedPrice.toFixed(2)}</span>
                            <span className="text-lg text-gray-400 line-through">₱{originalPrice.toFixed(2)}</span>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              {formData.discount_type === "percentage"
                                ? `${formData.discount_value}% OFF`
                                : `₱${formData.discount_value} OFF`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Customers will save ₱{(originalPrice - discountedPrice).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/products">Cancel</Link>
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
