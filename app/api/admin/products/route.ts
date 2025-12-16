import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const products = await query(
      `SELECT * FROM products 
       WHERE status != 'deleted' 
       ORDER BY created_at DESC`,
    )

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
      status = "active",
      photo_url,
      is_on_sale = false,
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

    // Check if SKU already exists (if provided)
    if (sku) {
      const existingSku = await query("SELECT id FROM products WHERE sku = ? AND status != 'deleted'", [sku])
      if (existingSku.length > 0) {
        return NextResponse.json({ message: "SKU already exists" }, { status: 400 })
      }
    }

    const result = await query(
      `INSERT INTO products 
       (name, description, category, price, stock_quantity, low_stock_threshold, sku, brand, weight_kg, status, photo_url, 
        is_on_sale, discount_type, discount_value, discount_start_date, discount_end_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ],
    )

    const newProduct = await query("SELECT * FROM products WHERE id = ?", [result.insertId])

    return NextResponse.json(newProduct[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
