import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const onSale = searchParams.get("onSale")
    const categoryFilter = searchParams.get("category")

    let queryString = `
      SELECT 
        id,
        name,
        description,
        price,
        stock_quantity,
        sku,
        brand,
        weight_kg,
        status,
        category,
        photo_url,
        is_on_sale,
        discount_type,
        discount_value,
        discount_start_date,
        discount_end_date,
        created_at,
        updated_at,
        CASE 
          WHEN discount_type = 'percentage' AND is_on_sale = 1 THEN price * (1 - discount_value / 100)
          WHEN discount_type = 'fixed' AND is_on_sale = 1 THEN price - discount_value
          ELSE price
        END as sale_price,
        CASE 
          WHEN discount_type = 'percentage' AND is_on_sale = 1 THEN price * (discount_value / 100)
          WHEN discount_type = 'fixed' AND is_on_sale = 1 THEN discount_value
          ELSE 0
        END as discount_amount
      FROM products
      WHERE status = 'active'
    `

    const params: any[] = []

    // if (featured === "true") {
    //   queryString += ` AND is_featured = TRUE`
    // }

    if (onSale === "true") {
      queryString += ` AND is_on_sale = TRUE`
      queryString += ` AND (discount_start_date IS NULL OR discount_start_date <= NOW())`
      queryString += ` AND (discount_end_date IS NULL OR discount_end_date >= NOW())`
    }

    if (categoryFilter) {
      queryString += ` AND category = ?`
      params.push(categoryFilter)
    }

    queryString += ` ORDER BY created_at DESC`

    const products = (await query(queryString, params)) as any[]

    const processedProducts = products.map((product) => {
      return {
        ...product,
        stock_quantity: Number(product.stock_quantity || 0),
        is_on_sale: Boolean(product.is_on_sale),
      }
    })

    return NextResponse.json(processedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
