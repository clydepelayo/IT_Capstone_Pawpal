import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching homepage content...")

    // Fetch active slides
    const slidesResult = await query(
      `SELECT * FROM homepage_slides 
       WHERE is_active = 1
       ORDER BY display_order ASC, created_at ASC`,
    )

    console.log("Slides query result:", slidesResult)
    console.log("Slides rows:", slidesResult?.rows)

    // Fetch active sections
    const sectionsResult = await query(
      `SELECT * FROM homepage_sections 
       WHERE is_active = 1
       ORDER BY section_name ASC`,
    )

    console.log("Sections query result:", sectionsResult)
    console.log("Sections rows:", sectionsResult?.rows)

    // Handle different possible result structures
    const slides = slidesResult?.rows || slidesResult || []
    const sections = sectionsResult?.rows || sectionsResult || []

    console.log("Final slides:", slides)
    console.log("Final sections:", sections)

    // Convert sections array to object for easier access
    const sectionsObj = Array.isArray(sections)
      ? sections.reduce((acc: any, section: any) => {
          acc[section.section_name] = section
          return acc
        }, {})
      : {}

    const response = {
      slides,
      sections: sectionsObj,
    }

    console.log("Sending response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching homepage content:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch homepage content",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
