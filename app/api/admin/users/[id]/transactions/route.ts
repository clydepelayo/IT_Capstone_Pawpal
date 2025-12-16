import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Fetch user's transactions
    const transactions = await query(`SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC`, [
      userId,
    ])

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
