"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Search, Edit, Trash2, ImageIcon, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  stock_quantity: number
  low_stock_threshold: number
  sku: string
  brand: string
  weight_kg: number
  status: string
  photo_url: string
  photo_filename: string
  photo_size: number
  photo_type: string
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const [permanentDeleteProductId, setPermanentDeleteProductId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter, statusFilter])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => product.status === statusFilter)
    }

    setFilteredProducts(filtered)
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    setIsDeleting(true)
    try {
      console.log("Soft deleting product with ID:", deleteProductId)

      const response = await fetch(`/api/admin/products/${deleteProductId}`, {
        method: "DELETE",
      })

      console.log("Delete response status:", response.status)

      const data = await response.json()
      console.log("Delete response data:", data)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product moved to inactive status",
        })
        // Refresh products list
        await fetchProducts()
        setDeleteProductId(null)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Something went wrong while deleting the product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePermanentDelete = async () => {
    if (!permanentDeleteProductId) return

    setIsDeleting(true)
    try {
      console.log("Permanently deleting product with ID:", permanentDeleteProductId)

      const response = await fetch(`/api/admin/products/${permanentDeleteProductId}/permanent`, {
        method: "DELETE",
      })

      console.log("Permanent delete response status:", response.status)

      const data = await response.json()
      console.log("Permanent delete response data:", data)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product permanently deleted from database",
        })
        // Refresh products list
        await fetchProducts()
        setPermanentDeleteProductId(null)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to permanently delete product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error permanently deleting product:", error)
      toast({
        title: "Error",
        description: "Something went wrong while permanently deleting the product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return <Badge variant="secondary">Low Stock</Badge>
    } else {
      return <Badge variant="default">In Stock</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge variant="default">Active</Badge>
    } else if (status === "inactive") {
      return <Badge variant="secondary">Inactive</Badge>
    } else if (status === "deleted") {
      return <Badge variant="destructive">Deleted</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "₱0.00"
    }
    return `₱${Number(price).toFixed(2)}`
  }

  if (isLoading) {
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
                  <BreadcrumbPage>Products</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
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
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your product inventory</p>
            </div>
            <Button asChild>
              <Link href="/admin/products/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>View and manage all products in your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found</p>
                  {products.length === 0 && (
                    <Button asChild className="mt-4">
                      <Link href="/admin/products/add">Add your first product</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              {product.photo_url ? (
                                <img
                                  src={product.photo_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                    const parent = target.parentElement
                                    if (parent) {
                                      parent.innerHTML =
                                        '<div class="text-gray-400"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
                                    }
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400">
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.brand && `${product.brand} • `}
                                {product.sku && `SKU: ${product.sku}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span>{product.stock_quantity} units</span>
                              {getStockStatus(product)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(product.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {product.status !== "deleted" && (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      console.log("Delete button clicked for product ID:", product.id)
                                      setDeleteProductId(product.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-orange-600" />
                                  </Button>
                                </>
                              )}
                              {product.status === "inactive" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    console.log("Permanent delete button clicked for product ID:", product.id)
                                    setPermanentDeleteProductId(product.id)
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Permanent
                                </Button>
                              )}
                            </div>
                          </TableCell>
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

      {/* Soft Delete Dialog */}
      <ConfirmDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => {
          console.log("ConfirmDialog onOpenChange:", open)
          if (!open) {
            setDeleteProductId(null)
          }
        }}
        title="Move to Inactive"
        description="Are you sure you want to move this product to inactive status? The product will be hidden from the shop but can be restored later."
        onConfirm={handleDeleteProduct}
        isLoading={isDeleting}
      />

      {/* Permanent Delete Dialog */}
      <ConfirmDialog
        open={permanentDeleteProductId !== null}
        onOpenChange={(open) => {
          console.log("Permanent Delete Dialog onOpenChange:", open)
          if (!open) {
            setPermanentDeleteProductId(null)
          }
        }}
        title="⚠️ Permanently Delete Product"
        description="WARNING: This will permanently delete the product from the database. This action CANNOT be undone. All product data, including sales history, will be lost forever. Are you absolutely sure?"
        onConfirm={handlePermanentDelete}
        isLoading={isDeleting}
      />
    </SidebarProvider>
  )
}
