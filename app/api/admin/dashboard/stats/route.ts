import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    // const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Get total users
    const totalUsersResult = await query(`
      SELECT COUNT(*) as count FROM users WHERE role = 'client'
    `)
    const totalUsers = (totalUsersResult as any[])[0]?.count || 0

    // Get total pets
    const totalPetsResult = await query(`
      SELECT COUNT(*) as count FROM pets
    `)
    const totalPets = (totalPetsResult as any[])[0]?.count || 0

    // Get today's appointments
    const todayAppointmentsResult = await query(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE DATE(appointment_date) = CURDATE()
    `)
    const todayAppointments = (todayAppointmentsResult as any[])[0]?.count || 0

    // Get pending appointments
    const pendingAppointmentsResult = await query(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE status = 'pending'
    `)
    const pendingAppointments = (pendingAppointmentsResult as any[])[0]?.count || 0

    // Get monthly revenue (current month)
    const monthlyRevenueResult = await query(`
      SELECT COALESCE(SUM(s.price), 0) as revenue
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.status = 'completed' 
      AND MONTH(a.appointment_date) = MONTH(CURDATE())
      AND YEAR(a.appointment_date) = YEAR(CURDATE())
    `)
    const monthlyRevenue = (monthlyRevenueResult as any[])[0]?.revenue || 0

    // Get low stock products (assuming stock < 10 is low)
    const lowStockResult = await query(`
      SELECT COUNT(*) as count FROM products 
      WHERE stock < 10
    `)
    const lowStockProducts = (lowStockResult as any[])[0]?.count || 0

    const stats = {
      totalUsers: Number.parseInt(totalUsers),
      totalPets: Number.parseInt(totalPets),
      todayAppointments: Number.parseInt(todayAppointments),
      pendingAppointments: Number.parseInt(pendingAppointments),
      monthlyRevenue: Number.parseFloat(monthlyRevenue),
      lowStockProducts: Number.parseInt(lowStockProducts),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({
      totalUsers: 0,
      totalPets: 0,
      todayAppointments: 0,
      pendingAppointments: 0,
      monthlyRevenue: 0,
      lowStockProducts: 0,
    })
  }
}
