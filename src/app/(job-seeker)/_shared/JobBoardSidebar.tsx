import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"
import { JobListingFilterForm } from "@/features/jobListings/components/JobListingFilterForm"
import { Suspense } from "react"

export function JobBoardSidebar() {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <Suspense fallback={<div className="p-4">Loading filters...</div>}>
          <JobListingFilterForm />
        </Suspense>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
