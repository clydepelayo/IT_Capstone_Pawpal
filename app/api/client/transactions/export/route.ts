import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const status = searchParams.get("status") || "all"
    const type = searchParams.get("type") || "all"

    console.log("Exporting transactions for user:", userId, "Format:", format)

    // Build WHERE clause for filtering
    let whereClause = "WHERE t.user_id = ?"
    const queryParams = [userId]

    if (status !== "all") {
      whereClause += " AND t.status = ?"
      queryParams.push(status)
    }

    if (type !== "all") {
      whereClause += " AND t.transaction_type = ?"
      queryParams.push(type)
    }

    // Fetch filtered transactions
    const transactions = await query(
      `
      SELECT 
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
        -- Order items summary
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
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `,
      queryParams,
    )

    // Format the data
    const formattedTransactions = (transactions as any[]).map((transaction) => {
      let enhancedDescription = transaction.description
      let finalPaymentMethod = transaction.transaction_payment_method

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
        payment_method: finalPaymentMethod || "cash",
        status: transaction.status,
        transaction_date: transaction.transaction_date,
        reference_id: transaction.reference_id,
        reference_type: transaction.reference_type,
        order_number: transaction.order_id_ref ? `ORD-${String(transaction.order_id_ref).padStart(4, "0")}` : null,
        service_name: transaction.service_name,
        pet_name: transaction.pet_name,
        appointment_date: transaction.appointment_date,
        order_items_summary: transaction.order_items_summary,
        order_shipping_address: transaction.order_shipping_address,
        order_notes: transaction.order_notes,
      }
    })

    if (format === "json") {
      return NextResponse.json(formattedTransactions, {
        headers: {
          "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.json"`,
          "Content-Type": "application/json",
        },
      })
    }

    // CSV format
    const csvHeaders = [
      "Transaction ID",
      "Date",
      "Type",
      "Description",
      "Amount",
      "Payment Method",
      "Status",
      "Reference",
      "Order Number",
      "Service",
      "Pet",
      "Items",
      "Shipping Address",
      "Notes",
    ]

    const csvRows = formattedTransactions.map((transaction) => [
      transaction.id,
      new Date(transaction.transaction_date).toLocaleDateString(),
      transaction.transaction_type,
      `"${transaction.description.replace(/"/g, '""')}"`,
      transaction.amount,
      transaction.payment_method,
      transaction.status,
      transaction.reference_id || "",
      transaction.order_number || "",
      transaction.service_name || "",
      transaction.pet_name || "",
      transaction.order_items_summary ? `"${transaction.order_items_summary.replace(/"/g, '""')}"` : "",
      transaction.order_shipping_address ? `"${transaction.order_shipping_address.replace(/"/g, '""')}"` : "",
      transaction.order_notes ? `"${transaction.order_notes.replace(/"/g, '""')}"` : "",
    ])

    const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
        "Content-Type": "text/csv",
      },
    })
  } catch (error) {
    console.error("Error exporting transactions:", error)
    return NextResponse.json(
      {
        message: "Export failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
