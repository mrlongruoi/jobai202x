"use client"

import { SignIn } from "@clerk/nextjs"
import { Suspense } from "react"

// Force dynamic rendering for auth pages
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignIn />
    </Suspense>
  )
}
