import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number.parseInt(id)

    console.log("PERMANENT DELETE request received for product ID:", productId)

    if (isNaN(productId)) {
      console.log("Invalid product ID:", id)
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = await query("SELECT * FROM products WHERE id = ?", [productId])

    console.log("Existing product for permanent delete:", existingProduct)

    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      console.log("Product not found")
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    const currentStatus = existingProduct[0].status
    console.log("Current product status:", currentStatus)

    // Only allow permanent delete if product is inactive
    if (currentStatus !== "inactive") {
      console.log("Product must be inactive before permanent deletion. Current status:", currentStatus)
      return NextResponse.json(
        { message: "Product must be moved to inactive status before permanent deletion" },
        { status: 400 },
      )
    }

    // Permanently delete from database
    const result = await query("DELETE FROM products WHERE id = ?", [productId])

    console.log("Permanent delete query result:", result)

    return NextResponse.json({
      message: "Product permanently deleted from database",
      success: true,
      productId: productId,
    })
  } catch (error) {
    console.error("Error permanently deleting product:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
