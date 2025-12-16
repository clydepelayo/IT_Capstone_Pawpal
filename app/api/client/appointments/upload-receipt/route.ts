import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import fs from "fs"
import { join } from "path"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("receipt") as File
    const appointmentId = formData.get("appointmentId") as string

    if (!file || !appointmentId) {
      return NextResponse.json({ message: "Missing file or appointment ID" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large" }, { status: 400 })
    }

    const appointmentCheck = await query(
      "SELECT id FROM appointments WHERE id = ? AND user_id = ?",
      [appointmentId, userId]
    )

    if (!appointmentCheck.length) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 })
    }

    const uploadsDir = join(process.cwd(), "public", "uploads", "receipts")
    await mkdir(uploadsDir, { recursive: true })

    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `receipt_${appointmentId}_${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // ✅ FIX: Set proper file permissions so Nginx can read it
    fs.chmodSync(filepath, 0o775)

    const receiptUrl = `/uploads/receipts/${filename}`
    await query(
      "UPDATE appointments SET receipt_url = ?, updated_at = NOW() WHERE id = ?",
      [receiptUrl, appointmentId]
    )

    console.log("Receipt uploaded successfully:", receiptUrl)

    return NextResponse.json({
      message: "Receipt uploaded successfully",
      receiptUrl: receiptUrl,
    })
  } catch (error) {
    console.error("Error uploading receipt:", error)
    return NextResponse.json(
      {
        message: "Failed to upload receipt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
