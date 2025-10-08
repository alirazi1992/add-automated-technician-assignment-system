import type { ResponsibleTechnicianAssignments } from "@/services/technician-types"

export const initialResponsibleTechnicianAssignments: ResponsibleTechnicianAssignments = {
  "it-lead": {
    technicianId: "lead-001",
    accessLevel: "full",
    permissions: [
      "manage-tickets",
      "assign-technicians",
      "manage-categories",
      "view-reports",
      "configure-automation",
    ],
  },
  "head-programmer": {
    technicianId: "lead-002",
    accessLevel: "partial",
    permissions: [
      "view-development-queue",
      "assign-developers",
      "update-knowledge-base",
      "view-reports",
    ],
  },
}
