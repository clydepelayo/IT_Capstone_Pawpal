import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching orders for user:", userId)

    const orders = await query(
      `
      SELECT 
        o.id,
        o.user_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.shipping_address,
        o.payment_method,
        COALESCE(o.total_amount, 0) as total_amount,
        COALESCE(o.subtotal, 0) as subtotal,
        COALESCE(o.shipping_fee, 0) as shipping_fee,
        o.status,
        o.notes,
        o.receipt_url,
        o.created_at,
        o.updated_at,
        GROUP_CONCAT(
          CONCAT(oi.quantity, 'x ', p.name, ' (₱', oi.price, ')')
          SEPARATOR ', '
        ) as items_summary,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
      [userId],
    )

    console.log("Orders found:", orders ? (orders as any[]).length : 0)

    const formattedOrders = (orders as any[]).map((order) => ({
      id: order.id,
      user_id: order.user_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: Number.parseFloat(order.total_amount),
      subtotal: Number.parseFloat(order.subtotal),
      shipping_fee: Number.parseFloat(order.shipping_fee),
      status: order.status,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      notes: order.notes,
      receipt_url: order.receipt_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items_summary: order.items_summary,
      items_count: order.items_count,
      order_number: `ORD-${String(order.id).padStart(4, "0")}`,
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      notes,
      receiptUrl,
      items,
      subtotal,
      shippingFee,
      totalAmount,
    } = body

    console.log("Creating order for user:", userId, "payment method:", paymentMethod)

    let finalCustomerName = customerName
    let finalCustomerEmail = customerEmail
    let finalCustomerPhone = customerPhone
    let finalShippingAddress = shippingAddress

    // If customer information is not provided, fetch from user profile
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      const userResult = await query(
        "SELECT first_name, last_name, email, phone, address FROM users WHERE id = ?",
        [userId]
      )
      const userData = (userResult as any[])[0]

      if (userData) {
        finalCustomerName = customerName || `${userData.first_name} ${userData.last_name}`.trim()
        finalCustomerEmail = customerEmail || userData.email
        finalCustomerPhone = customerPhone || userData.phone
        finalShippingAddress = shippingAddress || userData.address
      }
    }

    if (paymentMethod !== "cash" && !receiptUrl) {
      return NextResponse.json({ message: "Payment receipt is required" }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Order items are required" }, { status: 400 })
    }

    // Validate items and check stock
    for (const item of items) {
      const productResult = await query("SELECT id, name, price, stock_quantity FROM products WHERE id = ?", [
        item.product_id,
      ])
      const product = (productResult as any[])[0]

      if (!product) {
        return NextResponse.json({ message: `Product with ID ${item.product_id} not found` }, { status: 400 })
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` },
          { status: 400 },
        )
      }
    }

    const orderResult = await query(
      `
      INSERT INTO orders (
        user_id, 
        customer_name,
        customer_email,
        customer_phone,
        shipping_address, 
        payment_method, 
        notes,
        receipt_url,
        subtotal, 
        shipping_fee, 
        total_amount, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
    `,
      [
        userId,
        finalCustomerName,
        finalCustomerEmail,
        finalCustomerPhone,
        finalShippingAddress,
        paymentMethod,
        notes || null,
        receiptUrl || null, // Receipt is now optional for cash payments
        subtotal,
        shippingFee,
        totalAmount,
      ],
    )

    const orderId = (orderResult as any).insertId

    if (!orderId) {
      throw new Error("Failed to create order")
    }

    console.log("Order created with ID:", orderId)

    // Create order items and update product stock
    for (const item of items) {
      await query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `,
        [orderId, item.product_id, item.quantity, item.price],
      )

      // Update product stock
      await query(
        `
        UPDATE products 
        SET stock_quantity = GREATEST(0, stock_quantity - ?)
        WHERE id = ?
      `,
        [item.quantity, item.product_id],
      )
    }

    // Create transaction record
    const transactionDescription = `Order #${orderId} - ${items.length} item${items.length > 1 ? "s" : ""}`

    await query(
      `
      INSERT INTO transactions (
        user_id, 
        transaction_type, 
        reference_id, 
        amount, 
        payment_method, 
        status, 
        description, 
        transaction_date
      ) VALUES (?, 'product_purchase', ?, ?, ?, 'pending', ?, NOW())
    `,
      [userId, orderId, totalAmount, paymentMethod, transactionDescription],
    )

    console.log("Order created successfully:", orderId)

    return NextResponse.json({
      success: true,
      orderId,
      order_id: orderId,
      message: "Order placed successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
