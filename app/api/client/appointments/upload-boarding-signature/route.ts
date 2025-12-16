import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("signature") as File
    const appointmentId = formData.get("appointmentId") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "boarding-signatures")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `signature-${appointmentId}-${timestamp}.${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save file path to database
    const signatureUrl = `/uploads/boarding-signatures/${filename}`
    await query("UPDATE appointments SET boarding_signature_url = ? WHERE id = ?", [signatureUrl, appointmentId])

    return NextResponse.json({
      success: true,
      signatureUrl: signatureUrl,
      message: "Signature uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading signature:", error)
    return NextResponse.json({ error: "Failed to upload signature" }, { status: 500 })
  }
}
