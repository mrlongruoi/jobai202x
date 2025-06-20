import { NextResponse } from "next/server"
import { env } from "@/data/env/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "✅ Environment OK",
      hasDbUrl: !!env.DATABASE_URL,
      hasClerkSecret: !!env.CLERK_SECRET_KEY,
      hasClerkWebhook: !!env.CLERK_WEBHOOK_SECRET,
      hasGeminiKey: !!env.GEMINI_API_KEY,
      hasAnthropicKey: !!env.ANTHROPIC_API_KEY,
      hasUploadToken: !!env.UPLOADTHING_TOKEN,
      hasResendKey: !!env.RESEND_API_KEY,
      serverUrl: env.SERVER_URL,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: "❌ Environment Error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
