import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import jsPDF from "jspdf"

// Helper function to determine image format from content type
function getImageFormatFromContentType(contentType: string): "JPEG" | "PNG" {
  if (contentType.includes("png")) return "PNG"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "JPEG"
  // Default to PNG
  return "PNG"
}

// Helper function to convert relative URL to absolute URL
function getAbsoluteUrl(url: string, request: NextRequest): string {
  // If already absolute, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // Build absolute URL from request
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const host = request.headers.get("host") || "localhost:3000"
  const baseUrl = `${protocol}://${host}`

  // Ensure path starts with /
  const path = url.startsWith("/") ? url : `/${url}`

  return `${baseUrl}${path}`
}

// Helper function to convert image URL to base64 (Node.js compatible)
async function getBase64ImageFromUrl(imageUrl: string): Promise<{ data: string; format: "JPEG" | "PNG" }> {
  try {
    console.log("Fetching image from URL:", imageUrl)

    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    // Get content type to determine format
    const contentType = response.headers.get("content-type") || "image/png"
    const format = getImageFormatFromContentType(contentType)

    // Convert response to array buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("Buffer size:", buffer.length, "type:", contentType)

    // Convert buffer to base64
    const base64 = buffer.toString("base64")

    // Create data URL
    const dataUrl = `data:${contentType};base64,${base64}`

    console.log("Successfully converted to base64, format:", format)

    return { data: dataUrl, format }
  } catch (error) {
    console.error("Error converting image to base64:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    console.log("=== Generating boarding contract for appointment:", appointmentId, "===")

    // Fetch appointment details with all related information
    const appointmentData = await query(
      `SELECT 
        a.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.phone as user_phone,
        u.address as user_address,
        GROUP_CONCAT(p.name SEPARATOR ', ') as pet_names,
        GROUP_CONCAT(CONCAT(p.species, ' - ', p.breed) SEPARATOR ', ') as pet_details,
        s.name as service_name,
        s.description as service_description,
        s.price as service_price,
        c.cage_number,
        c.cage_type,
        c.daily_rate,
        c.description as cage_description
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN appointment_pets ap ON a.id = ap.appointment_id
      LEFT JOIN pets p ON ap.pet_id = p.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN cages c ON a.cage_id = c.id
      WHERE a.id = ? AND a.user_id = ?
      GROUP BY a.id`,
      [appointmentId, userId],
    )

    if (!appointmentData || appointmentData.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointmentData[0]

    console.log("Appointment boarding_id_url:", appointment.boarding_id_url)
    console.log("Appointment boarding_signature_url:", appointment.boarding_signature_url)

    // Convert images to base64 if they exist
    let idImage: { data: string; format: "JPEG" | "PNG" } | null = null
    let signatureImage: { data: string; format: "JPEG" | "PNG" } | null = null

    if (appointment.boarding_id_url) {
      try {
        console.log("=== Converting ID image to base64 ===")
        const absoluteIdUrl = getAbsoluteUrl(appointment.boarding_id_url, request)
        console.log("Absolute ID URL:", absoluteIdUrl)
        idImage = await getBase64ImageFromUrl(absoluteIdUrl)
        console.log("✓ ID image converted successfully")
      } catch (error) {
        console.error("✗ Failed to convert ID image:", error)
      }
    } else {
      console.log("No ID URL found in appointment")
    }

    if (appointment.boarding_signature_url) {
      try {
        console.log("=== Converting signature image to base64 ===")
        const absoluteSignatureUrl = getAbsoluteUrl(appointment.boarding_signature_url, request)
        console.log("Absolute signature URL:", absoluteSignatureUrl)
        signatureImage = await getBase64ImageFromUrl(absoluteSignatureUrl)
        console.log("✓ Signature image converted successfully")
      } catch (error) {
        console.error("✗ Failed to convert signature image:", error)
      }
    } else {
      console.log("No signature URL found in appointment")
    }

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("PAWPAL VETERINARY CLINIC", pageWidth / 2, yPos, { align: "center" })
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Hotel Boarding Service Agreement", pageWidth / 2, yPos, { align: "center" })
    yPos += 15

    // Reservation Details Box
    doc.setFillColor(240, 240, 240)
    doc.rect(15, yPos, pageWidth - 30, 50, "F")
    yPos += 8

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("RESERVATION DETAILS", 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Reservation ID: ${appointment.id}`, 20, yPos)
    doc.text(`Date Booked: ${new Date(appointment.created_at).toLocaleDateString()}`, 120, yPos)
    yPos += 6

    doc.text(`Check-in Date: ${new Date(appointment.check_in_date).toLocaleDateString()}`, 20, yPos)
    doc.text(`Check-out Date: ${new Date(appointment.check_out_date).toLocaleDateString()}`, 120, yPos)
    yPos += 6

    doc.text(`Boarding Duration: ${appointment.boarding_days} days`, 20, yPos)
    doc.text(`Status: ${appointment.status.toUpperCase()}`, 120, yPos)
    yPos += 15

    // Owner Information
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("OWNER INFORMATION", 20, yPos)
    yPos += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Name: ${appointment.user_first_name} ${appointment.user_last_name}`, 20, yPos)
    yPos += 6
    doc.text(`Email: ${appointment.user_email}`, 20, yPos)
    yPos += 6
    doc.text(`Phone: ${appointment.user_phone || "N/A"}`, 20, yPos)
    yPos += 6
    doc.text(`Address: ${appointment.user_address || "N/A"}`, 20, yPos)
    yPos += 12

    // Pet Information
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("PET INFORMATION", 20, yPos)
    yPos += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Pet(s): ${appointment.pet_names || "N/A"}`, 20, yPos)
    yPos += 6
    doc.text(`Details: ${appointment.pet_details || "N/A"}`, 20, yPos)
    yPos += 12

    // Boarding Details
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("BOARDING DETAILS", 20, yPos)
    yPos += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Service: ${appointment.service_name}`, 20, yPos)
    yPos += 6
    doc.text(`Cage Number: ${appointment.cage_number}`, 20, yPos)
    doc.text(`Cage Type: ${appointment.cage_type}`, 120, yPos)
    yPos += 6
    doc.text(`Daily Rate: ₱${Number.parseFloat(appointment.cage_rate).toFixed(2)}`, 20, yPos)
    yPos += 12

    // Financial Summary
    doc.setFillColor(240, 240, 240)
    doc.rect(15, yPos, pageWidth - 30, 25, "F")
    yPos += 8

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("FINANCIAL SUMMARY", 20, yPos)
    yPos += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const serviceAmount = appointment.service_amount || appointment.service_price
    doc.text(`Service Fee: ₱${Number.parseFloat(serviceAmount).toFixed(2)}`, 20, yPos)
    yPos += 6
    const boardingFee = appointment.boarding_days * Number.parseFloat(appointment.cage_rate)
    doc.text(
      `Boarding Fee (${appointment.boarding_days} days × ₱${Number.parseFloat(appointment.cage_rate).toFixed(2)}): ₱${boardingFee.toFixed(2)}`,
      20,
      yPos,
    )
    yPos += 6
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL AMOUNT: ₱${Number.parseFloat(appointment.payment_amount).toFixed(2)}`, 20, yPos)
    doc.text(`Payment Method: ${appointment.payment_method.toUpperCase()}`, 120, yPos)
    yPos += 15

    // Check if we need a new page for signatures
    if (yPos > pageHeight - 100) {
      doc.addPage()
      yPos = 20
    }

    // ID Section
    if (idImage) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("OWNER IDENTIFICATION", 20, yPos)
      yPos += 8

      try {
        console.log("Adding ID image to PDF with format:", idImage.format)
        // Add ID image - using base64 data with detected format
        doc.addImage(idImage.data, idImage.format, 20, yPos, 80, 50)
        yPos += 55

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        const idStatus = appointment.boarding_id_verified ? "✓ Verified" : "⊗ Pending Verification"
        doc.text(idStatus, 20, yPos)
        yPos += 10
        console.log("✓ ID image added to PDF successfully")
      } catch (error) {
        console.error("✗ Error adding ID image to PDF:", error)
        doc.setFont("helvetica", "italic")
        doc.setFontSize(9)
        doc.text("ID image could not be added to PDF", 20, yPos)
        yPos += 15
      }
    } else if (appointment.boarding_id_url) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("OWNER IDENTIFICATION", 20, yPos)
      yPos += 8

      doc.setFont("helvetica", "italic")
      doc.setFontSize(9)
      doc.text("ID image could not be loaded", 20, yPos)
      yPos += 15
    }

    // Signature Section
    if (signatureImage) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("OWNER SIGNATURE", 20, yPos)
      yPos += 8

      try {
        console.log("Adding signature image to PDF with format:", signatureImage.format)
        // Add signature image - using base64 data with detected format
        doc.addImage(signatureImage.data, signatureImage.format, 20, yPos, 80, 30)
        yPos += 35

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        const sigStatus = appointment.boarding_signature_verified ? "✓ Verified" : "⊗ Pending Verification"
        doc.text(sigStatus, 20, yPos)
        yPos += 5

        doc.text(`Signed on: ${new Date(appointment.created_at).toLocaleDateString()}`, 20, yPos)
        yPos += 10
        console.log("✓ Signature image added to PDF successfully")
      } catch (error) {
        console.error("✗ Error adding signature image to PDF:", error)
        doc.setFont("helvetica", "italic")
        doc.setFontSize(9)
        doc.text("Signature image could not be added to PDF", 20, yPos)
        yPos += 15
      }
    } else if (appointment.boarding_signature_url) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("OWNER SIGNATURE", 20, yPos)
      yPos += 8

      doc.setFont("helvetica", "italic")
      doc.setFontSize(9)
      doc.text("Signature image could not be loaded", 20, yPos)
      yPos += 15
    }

    // Terms Agreement
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("TERMS & CONDITIONS AGREEMENT", 20, yPos)
    yPos += 6

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const termsText =
      "By signing this document, the owner acknowledges that they have read, understood, and agreed to all Hotel Boarding Terms & Conditions of Pawpal Veterinary Clinic. The owner confirms that all information provided is accurate and complete."
    const splitTerms = doc.splitTextToSize(termsText, pageWidth - 40)
    doc.text(splitTerms, 20, yPos)
    yPos += splitTerms.length * 4 + 10

    // Footer
    doc.setDrawColor(0)
    doc.setLineWidth(0.5)
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30)

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text(
      "This is a computer-generated document and serves as confirmation of your boarding reservation.",
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    )
    doc.text("Pawpal Veterinary Clinic - For inquiries: 0929-494-4937", pageWidth / 2, pageHeight - 15, {
      align: "center",
    })

    // Generate PDF as base64
    const pdfBase64 = doc.output("dataurlstring")

    console.log("=== PDF generated successfully ===")

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `Boarding_Contract_${appointment.id}_${new Date().getTime()}.pdf`,
    })
  } catch (error) {
    console.error("=== ERROR generating boarding contract ===", error)
    return NextResponse.json(
      {
        error: "Failed to generate boarding contract",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
