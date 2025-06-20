import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { env } from "@/data/env/server"
import { db } from "@/drizzle/db"
import { OrganizationTable, UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

type ClerkEvent = {
  type: string
  data: Record<string, unknown>
}

type ClerkUserData = {
  id: string
  email_addresses: Array<{ email_address: string }>
  first_name?: string
  last_name?: string
  image_url?: string
}

type ClerkOrganizationData = {
  id: string
  name: string
  slug?: string
  image_url?: string
  created_by?: string
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env")
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: ClerkEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occurred", {
      status: 400,
    })
  }

  console.log("Clerk webhook event:", evt.type)

  try {
    switch (evt.type) {
      case "user.created":
        await handleUserCreated(evt.data as ClerkUserData)
        break
      case "user.updated":
        await handleUserUpdated(evt.data as ClerkUserData)
        break
      case "user.deleted":
        await handleUserDeleted(evt.data as ClerkUserData)
        break
      case "organization.created":
        await handleOrganizationCreated(evt.data as ClerkOrganizationData)
        break
      case "organization.updated":
        await handleOrganizationUpdated(evt.data as ClerkOrganizationData)
        break
      case "organization.deleted":
        await handleOrganizationDeleted(evt.data as ClerkOrganizationData)
        break
      default:
        console.log("Unhandled webhook event:", evt.type)
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response("Error processing webhook", {
      status: 500,
    })
  }

  return NextResponse.json({ message: "Success" })
}

// User event handlers
async function handleUserCreated(userData: ClerkUserData) {
  console.log("Creating user:", userData.id)
  
  const name = [userData.first_name, userData.last_name].filter(Boolean).join(" ") || "Unknown User"
  
  await db.insert(UserTable).values({
    id: userData.id,
    email: userData.email_addresses[0]?.email_address || "",
    name: name,
    imageUrl: userData.image_url || "",
  })
}

async function handleUserUpdated(userData: ClerkUserData) {
  console.log("Updating user:", userData.id)
  
  const name = [userData.first_name, userData.last_name].filter(Boolean).join(" ") || "Unknown User"
  
  await db
    .update(UserTable)
    .set({
      email: userData.email_addresses[0]?.email_address || "",
      name: name,
      imageUrl: userData.image_url || "",
    })
    .where(eq(UserTable.id, userData.id))
}

async function handleUserDeleted(userData: ClerkUserData) {
  console.log("Deleting user:", userData.id)
  
  await db.delete(UserTable).where(eq(UserTable.id, userData.id))
}

// Organization event handlers
async function handleOrganizationCreated(orgData: ClerkOrganizationData) {
  console.log("Creating organization:", orgData.id)
  
  await db.insert(OrganizationTable).values({
    id: orgData.id,
    name: orgData.name,
    imageUrl: orgData.image_url || null,
  })
}

async function handleOrganizationUpdated(orgData: ClerkOrganizationData) {
  console.log("Updating organization:", orgData.id)
  
  await db
    .update(OrganizationTable)
    .set({
      name: orgData.name,
      imageUrl: orgData.image_url || null,
    })
    .where(eq(OrganizationTable.id, orgData.id))
}

async function handleOrganizationDeleted(orgData: ClerkOrganizationData) {
  console.log("Deleting organization:", orgData.id)
  
  await db.delete(OrganizationTable).where(eq(OrganizationTable.id, orgData.id))
}
