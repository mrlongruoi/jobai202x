import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { env } from "@/data/env/server"
import { inngest } from "@/services/inngest/client"

export async function POST(req: Request) {
  try {
    console.log("🔗 Clerk webhook received")
    
    const payload = await req.text()
    const headerPayload = await headers()
    
    const svixId = headerPayload.get("svix-id")
    const svixTimestamp = headerPayload.get("svix-timestamp")
    const svixSignature = headerPayload.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing svix headers")
      return NextResponse.json({ error: "Missing headers" }, { status: 400 })
    }

    // Verify webhook signature
    const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET)
    let evt
    
    try {
      evt = webhook.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type: string; data: unknown }
    } catch (verifyError) {
      console.error("❌ Webhook verification failed:", verifyError)
      return NextResponse.json({ error: "Verification failed" }, { status: 400 })
    }    console.log(`📨 Processing event: ${evt.type}`)    // Send to Inngest based on event type
    try {
      if (evt.type === "user.created") {
        await inngest.send({
          name: "clerk/user.created",
          data: {
            data: evt.data,
            raw: payload,
            headers: Object.fromEntries(req.headers.entries()),
          },
        } as any) // eslint-disable-line
        console.log("✅ Sent user.created to Inngest")
      } else if (evt.type === "user.updated") {
        await inngest.send({
          name: "clerk/user.updated",
          data: {
            data: evt.data,
            raw: payload,
            headers: Object.fromEntries(req.headers.entries()),
          },
        } as any) // eslint-disable-line
        console.log("✅ Sent user.updated to Inngest")
      } else if (evt.type === "user.deleted") {
        await inngest.send({
          name: "clerk/user.deleted",
          data: {
            data: evt.data,
            raw: payload,
            headers: Object.fromEntries(req.headers.entries()),
          },
        } as any) // eslint-disable-line
        console.log("✅ Sent user.deleted to Inngest")
      } else {
        console.log(`⚠️ Unhandled event type: ${evt.type}`)
      }
    } catch (inngestError) {
      console.error("❌ Error sending to Inngest:", inngestError)
      return NextResponse.json({ error: "Inngest error" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      eventType: evt.type,
      message: "Webhook processed successfully" 
    })
      
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Clerk webhook endpoint is active",
    timestamp: new Date().toISOString()
  })
}
