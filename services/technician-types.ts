export type TechnicianStatus = "available" | "busy" | "inactive"

export type TechnicianRole = "technician" | "responsible" | "admin"

export type ResponsibleRoleId = string

export type AccessLevel = "full" | "partial"

export type ResponsibleRoleIcon = "crown" | "shield"

export interface ResponsibleRolePermissionOption {
  id: string
  label: string
}

export interface ResponsibleRoleDefinition {
  id: ResponsibleRoleId
  title: string
  description?: string
  accessLevel: AccessLevel
  permissionOptions: ResponsibleRolePermissionOption[]
  createdAt: number
  icon?: ResponsibleRoleIcon
}

export type ResponsibleRoleDefinitions = Record<ResponsibleRoleId, ResponsibleRoleDefinition>

export interface TechnicianCertification {
  id: string
  name: string
  issuer?: string
  year?: number
}

export interface Technician {
  id: string
  name: string
  email: string
  phone?: string
  status: TechnicianStatus
  rating: number
  activeTickets: number
  completedTickets: number
  specialties: string[]
  subSpecialties?: string[]
  experienceYears?: number
  certifications?: TechnicianCertification[]
  languages?: string[]
  avgResponseTime?: number | string
  role?: TechnicianRole
  responsibleRoleId?: ResponsibleRoleId
}

export interface CategoryTechnicianAssignment {
  technicians: string[]
  subcategories: Record<string, string[]>
}

export type TechnicianCategoryAssignments = Record<string, CategoryTechnicianAssignment>

export interface ResponsibleTechnicianAssignment {
  technicianId: string | null
  accessLevel: AccessLevel
  permissions: string[]
}

export type ResponsibleTechnicianAssignments = Record<ResponsibleRoleId, ResponsibleTechnicianAssignment>

export interface ResponsibleAssignmentsLockState {
  locked: boolean
  submittedAt?: number
}

export type ResponsibleAssignmentLockStates = Record<
  ResponsibleRoleId,
  ResponsibleAssignmentsLockState
>
