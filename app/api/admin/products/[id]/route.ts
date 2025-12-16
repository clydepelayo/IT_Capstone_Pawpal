import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number.parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const products = await query("SELECT * FROM products WHERE id = ?", [productId])

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(products[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number.parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      price,
      stock_quantity,
      low_stock_threshold,
      sku,
      brand,
      weight_kg,
      status,
      photo_url,
      is_on_sale,
      discount_type,
      discount_value,
      discount_start_date,
      discount_end_date,
    } = body

    // Validation
    if (
      !name ||
      !category ||
      price === undefined ||
      stock_quantity === undefined ||
      low_stock_threshold === undefined
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (price < 0 || stock_quantity < 0 || low_stock_threshold < 0) {
      return NextResponse.json({ message: "Price and quantities must be non-negative" }, { status: 400 })
    }

    // Validate discount values
    if (is_on_sale && discount_value) {
      if (discount_type === "percentage" && (discount_value < 0 || discount_value > 100)) {
        return NextResponse.json({ message: "Percentage discount must be between 0 and 100" }, { status: 400 })
      }
      if (discount_type === "fixed" && discount_value < 0) {
        return NextResponse.json({ message: "Fixed discount must be non-negative" }, { status: 400 })
      }
    }

    // Check if product exists
    const existingProduct = await query("SELECT * FROM products WHERE id = ?", [productId])
    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check if SKU already exists for other products (if provided and changed)
    if (sku && sku !== existingProduct[0].sku) {
      const existingSku = await query("SELECT id FROM products WHERE sku = ? AND id != ?", [sku, productId])
      if (Array.isArray(existingSku) && existingSku.length > 0) {
        return NextResponse.json({ message: "SKU already exists" }, { status: 400 })
      }
    }

    await query(
      `UPDATE products 
       SET name = ?, description = ?, category = ?, price = ?, stock_quantity = ?, 
           low_stock_threshold = ?, sku = ?, brand = ?, weight_kg = ?, status = ?, 
           photo_url = ?, is_on_sale = ?, discount_type = ?, discount_value = ?, 
           discount_start_date = ?, discount_end_date = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        description,
        category,
        price,
        stock_quantity,
        low_stock_threshold,
        sku,
        brand,
        weight_kg,
        status,
        photo_url,
        is_on_sale,
        discount_type,
        discount_value,
        discount_start_date,
        discount_end_date,
        productId,
      ],
    )

    const updatedProduct = await query("SELECT * FROM products WHERE id = ?", [productId])

    return NextResponse.json(updatedProduct[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number.parseInt(id)

    console.log("DELETE request received for product ID:", productId)

    if (isNaN(productId)) {
      console.log("Invalid product ID:", id)
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists and is not already deleted
    const existingProduct = await query("SELECT * FROM products WHERE id = ?", [productId])

    console.log("Existing product query result:", existingProduct)

    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      console.log("Product not found")
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check current status
    const currentStatus = existingProduct[0].status
    console.log("Current product status:", currentStatus)

    if (currentStatus === "deleted" || currentStatus === "inactive") {
      console.log("Product is already inactive or deleted")
      return NextResponse.json({ message: "Product is already inactive" }, { status: 400 })
    }

    // Soft delete - mark as inactive instead of deleted
    const result = await query("UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = ?", [productId])

    console.log("Update query result:", result)

    // Verify the update
    const updatedProduct = await query("SELECT * FROM products WHERE id = ?", [productId])
    console.log("Updated product:", updatedProduct)

    return NextResponse.json({
      message: "Product moved to inactive status",
      success: true,
      productId: productId,
      newStatus: "inactive",
    })
  } catch (error) {
    console.error("Error updating product status:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
