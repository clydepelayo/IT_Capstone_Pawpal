import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/cookie
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total pets
    const petsResult = (await query("SELECT COUNT(*) as count FROM pets WHERE user_id = ?", [userId])) as any[]
    const totalPets = petsResult[0]?.count || 0

    // Get total appointments
    const totalAppointmentsResult = (await query("SELECT COUNT(*) as count FROM appointments WHERE user_id = ?", [
      userId,
    ])) as any[]
    const totalAppointments = totalAppointmentsResult[0]?.count || 0

    // Get boarding reservations count
    const boardingResult = (await query(
      `SELECT COUNT(*) as count FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND s.category = 'boarding'`,
      [userId],
    )) as any[]
    const boardingReservations = boardingResult[0]?.count || 0

    // Get completed appointments
    const completedResult = (await query(
      "SELECT COUNT(*) as count FROM appointments WHERE user_id = ? AND status = 'completed'",
      [userId],
    )) as any[]
    const completedAppointments = completedResult[0]?.count || 0

    // Get pending appointments
    const pendingResult = (await query(
      "SELECT COUNT(*) as count FROM appointments WHERE user_id = ? AND status = 'pending'",
      [userId],
    )) as any[]
    const pendingAppointments = pendingResult[0]?.count || 0

    // Get upcoming appointments (pending or confirmed)
    const upcomingResult = (await query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE user_id = ? AND status IN ('pending', 'confirmed') 
       AND appointment_date >= NOW()`,
      [userId],
    )) as any[]
    const upcomingAppointments = upcomingResult[0]?.count || 0

    // Get appointments this month
    const thisMonthResult = (await query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE user_id = ? AND YEAR(appointment_date) = YEAR(NOW()) 
       AND MONTH(appointment_date) = MONTH(NOW())`,
      [userId],
    )) as any[]
    const thisMonthAppointments = thisMonthResult[0]?.count || 0

    // Get appointments in upcoming week
    const upcomingWeekResult = (await query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE user_id = ? AND appointment_date >= NOW() 
       AND appointment_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)`,
      [userId],
    )) as any[]
    const upcomingWeekAppointments = upcomingWeekResult[0]?.count || 0

    // Get total spent this year (from completed appointments and orders)
    const appointmentSpentResult = (await query(
      `SELECT COALESCE(SUM(s.price), 0) as total FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'completed' 
       AND YEAR(a.appointment_date) = YEAR(NOW())`,
      [userId],
    )) as any[]
    const appointmentSpent = Number.parseFloat(appointmentSpentResult[0]?.total) || 0

    const orderSpentResult = (await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders
       WHERE user_id = ? AND status IN ('completed', 'delivered')
       AND YEAR(created_at) = YEAR(NOW())`,
      [userId],
    )) as any[]
    const orderSpent = Number.parseFloat(orderSpentResult[0]?.total) || 0

    const totalSpent = appointmentSpent + orderSpent

    // Get all-time total spent
    const allTimeAppointmentSpentResult = (await query(
      `SELECT COALESCE(SUM(s.price), 0) as total FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'completed'`,
      [userId],
    )) as any[]
    const allTimeAppointmentSpent = Number.parseFloat(allTimeAppointmentSpentResult[0]?.total) || 0

    const allTimeOrderSpentResult = (await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders
       WHERE user_id = ? AND status IN ('completed', 'delivered')`,
      [userId],
    )) as any[]
    const allTimeOrderSpent = Number.parseFloat(allTimeOrderSpentResult[0]?.total) || 0

    const allTimeTotalSpent = allTimeAppointmentSpent + allTimeOrderSpent

    // Calculate average cost per appointment
    const averageCost = completedAppointments > 0 ? allTimeAppointmentSpent / completedAppointments : 0

    // Get most used service
    const mostUsedServiceResult = (await query(
      `SELECT s.name, COUNT(*) as count FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'completed'
       GROUP BY s.id, s.name
       ORDER BY count DESC
       LIMIT 1`,
      [userId],
    )) as any[]
    const mostUsedService = mostUsedServiceResult[0]?.name || "None"

    // Get most used payment method
    const mostUsedPaymentResult = (await query(
      `SELECT payment_method, COUNT(*) as count FROM appointments
       WHERE user_id = ? AND status = 'completed' AND payment_method IS NOT NULL
       GROUP BY payment_method
       ORDER BY count DESC
       LIMIT 1`,
      [userId],
    )) as any[]
    const mostUsedPayment = mostUsedPaymentResult[0]?.payment_method || "Not specified"

    return NextResponse.json({
      // Original stats
      totalPets,
      upcomingAppointments,
      completedAppointments,
      totalSpent,

      // New enhanced stats
      totalAppointments,
      boardingReservations,
      pendingAppointments,
      thisMonthAppointments,
      upcomingWeekAppointments,
      allTimeTotalSpent,
      averageCost,
      mostUsedService,
      mostUsedPayment,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
