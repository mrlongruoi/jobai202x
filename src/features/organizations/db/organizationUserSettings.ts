import { db } from "@/drizzle/db"
import { OrganizationUserSettingsTable } from "@/drizzle/schema"
import { revalidateOrganizationUserSettingsCache } from "./cache/organizationUserSettings"
import { and, eq } from "drizzle-orm"

export async function insertOrganizationUserSettings(
  settings: typeof OrganizationUserSettingsTable.$inferInsert
) {
  console.log("🏢 Inserting organization user settings:", settings)
  try {
    const result = await db
      .insert(OrganizationUserSettingsTable)
      .values(settings)
      .onConflictDoNothing()
      .returning()

    console.log("✅ Insert organization settings result:", result)
    revalidateOrganizationUserSettingsCache(settings)
    return result
  } catch (error) {
    console.error("❌ Error inserting organization user settings:", error)
    throw error
  }
}

export async function updateOrganizationUserSettings(
  {
    userId,
    organizationId,
  }: {
    userId: string
    organizationId: string
  },
  settings: Partial<
    Omit<
      typeof OrganizationUserSettingsTable.$inferInsert,
      "userId" | "organizationId"
    >
  >
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values({ ...settings, userId, organizationId })
    .onConflictDoUpdate({
      target: [
        OrganizationUserSettingsTable.userId,
        OrganizationUserSettingsTable.organizationId,
      ],
      set: settings,
    })

  revalidateOrganizationUserSettingsCache({ userId, organizationId })
}

export async function deleteOrganizationUserSettings({
  userId,
  organizationId,
}: {
  userId: string
  organizationId: string
}) {
  await db
    .delete(OrganizationUserSettingsTable)
    .where(
      and(
        eq(OrganizationUserSettingsTable.userId, userId),
        eq(OrganizationUserSettingsTable.organizationId, organizationId)
      )
    )

  revalidateOrganizationUserSettingsCache({ userId, organizationId })
}
