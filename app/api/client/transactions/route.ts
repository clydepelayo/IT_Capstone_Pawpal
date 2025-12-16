import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching transactions for user:", userId)

    // Fetch user's transactions with detailed information - ensuring no duplicates
    const transactions = await query(
      `
      SELECT DISTINCT
        t.id,
        t.transaction_type,
        t.description,
        t.amount,
        t.payment_method as transaction_payment_method,
        t.status,
        t.transaction_date,
        t.reference_id,
        t.reference_type,
        t.appointment_id,
        t.order_id,
        t.created_at,
        t.updated_at,
        -- Appointment details
        a.appointment_date,
        a.status as appointment_status,
        a.payment_method as appointment_payment_method,
        s.name as service_name,
        s.price as service_price,
        p.name as pet_name,
        -- Order details
        o.id as order_id_ref,
        o.total_amount as order_total,
        o.subtotal as order_subtotal,
        o.shipping_fee as order_shipping_fee,
        o.status as order_status,
        o.payment_method as order_payment_method,
        o.shipping_address as order_shipping_address,
        o.notes as order_notes,
        o.created_at as order_date,
        -- Order items count and summary
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as order_items_count,
        (SELECT GROUP_CONCAT(CONCAT(oi2.quantity, 'x ', pr.name) SEPARATOR ', ') 
         FROM order_items oi2 
         JOIN products pr ON oi2.product_id = pr.id 
         WHERE oi2.order_id = o.id) as order_items_summary
      FROM transactions t
      LEFT JOIN appointments a ON t.appointment_id = a.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE t.user_id = ? 
        AND t.transaction_type IS NOT NULL 
        AND t.transaction_type != ''
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 100
    `,
      [userId],
    )

    console.log("Raw transactions found:", transactions.length)

    // Format the response with enhanced descriptions and ensure no duplicates
    const seenTransactions = new Set()
    const formattedTransactions = (transactions as any[])
      .filter((transaction) => {
        // Create a unique key for each transaction to prevent duplicates
        const uniqueKey = `${transaction.transaction_type}-${transaction.order_id || transaction.appointment_id}-${transaction.id}`
        if (seenTransactions.has(uniqueKey)) {
          return false
        }
        seenTransactions.add(uniqueKey)
        return true
      })
      .map((transaction) => {
        let enhancedDescription = transaction.description
        let finalPaymentMethod = transaction.transaction_payment_method

        // Ensure transaction type is not empty
        if (!transaction.transaction_type) {
          if (transaction.order_id) {
            transaction.transaction_type = "order"
          } else if (transaction.appointment_id) {
            transaction.transaction_type = "appointment"
          } else {
            transaction.transaction_type = "service"
          }
        }

        // Determine the correct payment method based on transaction type
        if (transaction.transaction_type === "appointment" && transaction.appointment_payment_method) {
          finalPaymentMethod = transaction.appointment_payment_method
        } else if (transaction.transaction_type === "order" && transaction.order_payment_method) {
          finalPaymentMethod = transaction.order_payment_method
        }

        // Enhance description based on transaction type
        if (transaction.pet_name && transaction.service_name) {
          enhancedDescription = `${transaction.service_name} for ${transaction.pet_name}`
          if (transaction.appointment_date) {
            enhancedDescription += ` on ${new Date(transaction.appointment_date).toLocaleDateString()}`
          }
        } else if (transaction.order_id_ref && transaction.order_items_count) {
          // Generate order number from order ID
          const orderNumber = `ORD-${String(transaction.order_id_ref).padStart(4, "0")}`
          enhancedDescription = `Order ${orderNumber} - ${transaction.order_items_count} item${transaction.order_items_count > 1 ? "s" : ""}`
          if (transaction.order_items_summary) {
            enhancedDescription += ` (${transaction.order_items_summary})`
          }
        }

        return {
          id: transaction.id,
          transaction_type: transaction.transaction_type,
          description: enhancedDescription,
          amount: Number.parseFloat(transaction.amount),
          payment_method: finalPaymentMethod || "cash", // Default to cash if no payment method
          status: transaction.status,
          transaction_date: transaction.transaction_date,
          reference_id: transaction.reference_id,
          reference_type: transaction.reference_type,
          appointment_id: transaction.appointment_id,
          order_id: transaction.order_id,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
          // Additional context
          service_name: transaction.service_name,
          pet_name: transaction.pet_name,
          appointment_date: transaction.appointment_date,
          appointment_status: transaction.appointment_status,
          order_number: transaction.order_id_ref ? `ORD-${String(transaction.order_id_ref).padStart(4, "0")}` : null,
          order_total: transaction.order_total ? Number.parseFloat(transaction.order_total) : null,
          order_subtotal: transaction.order_subtotal ? Number.parseFloat(transaction.order_subtotal) : null,
          order_shipping_fee: transaction.order_shipping_fee ? Number.parseFloat(transaction.order_shipping_fee) : null,
          order_status: transaction.order_status,
          order_payment_method: transaction.order_payment_method,
          order_shipping_address: transaction.order_shipping_address,
          order_notes: transaction.order_notes,
          order_date: transaction.order_date,
          order_items_count: transaction.order_items_count,
          order_items_summary: transaction.order_items_summary,
        }
      })

    console.log("Formatted transactions count:", formattedTransactions.length)

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
