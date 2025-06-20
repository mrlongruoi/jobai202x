import { NextResponse } from "next/server"
import { inngest } from "@/services/inngest/client"

export async function POST() {
  try {
    console.log("🧪 Testing Inngest organization events...")
      // Test organization.created event
    const orgEvent = await inngest.send({
      name: "clerk/organization.created",
      data: {
        data: {
          id: "org_test_" + Date.now(),
          name: "Test Organization",
          image_url: "https://example.com/image.jpg",          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as any, // eslint-disable-line
        raw: JSON.stringify({}),
        headers: {},
      },
    } as any) // eslint-disable-line
    
    // Test organizationMembership.created event
    const memberEvent = await inngest.send({
      name: "clerk/organizationMembership.created", 
      data: {
        data: {
          public_user_data: {
            user_id: "user_test_" + Date.now()
          },
          organization: {            id: "org_test_" + Date.now()
          }
        } as any, // eslint-disable-line
        raw: JSON.stringify({}),
        headers: {},
      },
    } as any) // eslint-disable-line

    console.log("✅ Test events sent to Inngest")
    
    return NextResponse.json({
      success: true,
      message: "Test events sent successfully",
      eventIds: [orgEvent.ids, memberEvent.ids]
    })

  } catch (error) {
    console.error("❌ Test events error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
