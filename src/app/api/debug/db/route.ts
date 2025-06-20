import { NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1 as test, NOW() as timestamp`)
    
    return NextResponse.json({
      status: "✅ Database Connected",
      result: result.rows[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: "❌ Database Error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
