import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("receipt") as File
    const type = formData.get("type") as string // "order" or "update"
    const orderId = formData.get("orderId") as string

    console.log("Upload receipt request:", { userId, type, orderId, fileName: file?.name })

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "receipts")
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log("Uploads directory ready:", uploadsDir)
    } catch (error) {
      console.log("Directory already exists or error creating:", error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const fileName = `receipt_${type}_${orderId || userId}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    console.log("Saving file to:", filePath)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const receiptUrl = `/uploads/receipts/${fileName}`

    console.log("Receipt uploaded successfully:", receiptUrl)

    // Return the receipt URL (don't update database here - let the caller do it)
    return NextResponse.json({
      success: true,
      receiptUrl,
      message: "Receipt uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading receipt:", error)
    return NextResponse.json(
      {
        message: "Failed to upload receipt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
