import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pawpal",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true,
  ssl: false,
}

let pool: mysql.Pool | null = null

function createPool() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: 5, // Reduced from 10 to prevent too many connections
        queueLimit: 0,
        acquireTimeout: 30000,
        timeout: 30000,
        idleTimeout: 300000, // 5 minutes
        maxIdle: 5, // Maximum idle connections in pool
      })

      // Test the pool connection
      pool.on("connection", (connection) => {
        console.log("Database connected as id " + connection.threadId)
      })

      pool.on("error", (err) => {
        console.error("Database pool error:", err)
        if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
          console.log("Recreating database pool...")
          pool?.end()
          pool = null
          createPool()
        }
      })

      pool.on("release", (connection) => {
        console.log("Connection %d released", connection.threadId)
      })
    } catch (error) {
      console.error("Failed to create database pool:", error)
      throw error
    }
  }
  return pool
}

export async function getConnection() {
  try {
    const poolConnection = createPool()
    const connection = await poolConnection.getConnection()

    // Set connection timeout
    await connection.execute("SET SESSION wait_timeout = 300")
    await connection.execute("SET SESSION interactive_timeout = 300")

    return connection
  } catch (error) {
    console.error("Database connection failed:", error)
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function query(sql: string, params: any[] = []) {
  let connection: mysql.PoolConnection | null = null
  try {
    console.log("Executing query:", sql.substring(0, 100) + "...")
    console.log("With params:", params)

    connection = await getConnection()
    const [results] = await connection.execute(sql, params)

    console.log("Query executed successfully")
    return results
  } catch (error) {
    console.error("Database query error:", error)
    console.error("SQL:", sql.substring(0, 200) + "...")
    console.error("Params:", params)
    throw error
  } finally {
    if (connection) {
      try {
        connection.release()
        console.log("Connection released successfully")
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError)
      }
    }
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database pool...")
  if (pool) {
    await pool.end()
    pool = null
  }
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Closing database pool...")
  if (pool) {
    await pool.end()
    pool = null
  }
  process.exit(0)
})

export default createPool()
