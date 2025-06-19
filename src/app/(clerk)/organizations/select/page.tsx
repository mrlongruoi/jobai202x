import { OrganizationList } from "@clerk/nextjs"
import { Suspense } from "react"

// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function OrganizationSelectPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  )
}

async function SuspendedPage({ searchParams }: Props) {
  const { redirect } = await searchParams
  const redirectUrl = redirect ?? "/employer"

  return (
    <OrganizationList
      hidePersonal
      hideSlug
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectUrl}
      afterCreateOrganizationUrl={redirectUrl}
    />
  )
}
