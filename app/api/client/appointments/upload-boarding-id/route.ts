import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("id") as File
    const appointmentId = formData.get("appointmentId") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "boarding-ids")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `id-${appointmentId}-${timestamp}.${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save file path to database
    const idUrl = `/uploads/boarding-ids/${filename}`
    await query("UPDATE appointments SET boarding_id_url = ? WHERE id = ?", [idUrl, appointmentId])

    return NextResponse.json({
      success: true,
      idUrl: idUrl,
      message: "ID uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading ID:", error)
    return NextResponse.json({ error: "Failed to upload ID" }, { status: 500 })
  }
}
