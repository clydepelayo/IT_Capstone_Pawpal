import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    // const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const cages = await query(`
      SELECT 
        c.id as cage_id,
        c.cage_number,
        c.cage_type,
        c.capacity,
        c.description,
        c.daily_rate,
        c.status as availability_status,
        c.current_pet_id,
        c.current_appointment_id,
        c.check_in_date as current_check_in,
        c.check_out_date as current_check_out,
        
        -- Current pet and client info (if occupied)
        p.name as current_pet_name,
        p.species as current_pet_species,
        p.breed as current_pet_breed,
        CONCAT(u.first_name, ' ', u.last_name) as current_client_name,
        u.phone as current_client_phone,
        
        -- Next upcoming reservation
        cr_next.id as next_reservation_id,
        cr_next.check_in_date as next_check_in,
        cr_next.check_out_date as next_check_out,
        
        -- Next pet and client info
        p_next.name as next_pet_name,
        p_next.species as next_pet_species,
        p_next.breed as next_pet_breed,
        CONCAT(u_next.first_name, ' ', u_next.last_name) as next_client_name
        
      FROM cages c
      
      -- Current pet and client (if cage is occupied)
      LEFT JOIN pets p ON c.current_pet_id = p.id
      LEFT JOIN appointments a ON c.current_appointment_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      
      -- Next upcoming reservation
      LEFT JOIN cage_reservations cr_next ON c.id = cr_next.cage_id 
        AND cr_next.check_in_date > CURDATE()
        AND cr_next.status NOT IN ('cancelled', 'checked_out')
        AND cr_next.id = (
          SELECT MIN(cr_sub.id) 
          FROM cage_reservations cr_sub 
          WHERE cr_sub.cage_id = c.id 
          AND cr_sub.check_in_date > CURDATE()
          AND cr_sub.status NOT IN ('cancelled', 'checked_out')
        )
      LEFT JOIN appointments a_next ON cr_next.appointment_id = a_next.id
        AND a_next.status NOT IN ('cancelled', 'rejected')
      LEFT JOIN pets p_next ON a_next.pet_id = p_next.id
      LEFT JOIN users u_next ON a_next.user_id = u_next.id
      
      ORDER BY c.cage_number
    `)

    return NextResponse.json(cages)
  } catch (error) {
    console.error("Error fetching boarding cages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
