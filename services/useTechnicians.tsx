"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type {
  ResponsibleAssignmentsLockState,
  ResponsibleAssignmentLockStates,
  ResponsibleRoleDefinition,
  ResponsibleRoleDefinitions,
  ResponsibleRoleId,
  ResponsibleTechnicianAssignments,
  Technician,
  TechnicianCategoryAssignments,
} from "@/services/technician-types"

const TECHNICIANS_STORAGE_KEY = "ticketing.technicians.v1"
const TECHNICIAN_ASSIGNMENTS_STORAGE_KEY = "ticketing.technician-assignments.v1"
const RESPONSIBLE_TECHNICIANS_STORAGE_KEY = "ticketing.responsible-technicians.v1"
const RESPONSIBLE_ROLE_DEFINITIONS_STORAGE_KEY = "ticketing.responsible-role-definitions.v1"
const RESPONSIBLE_ASSIGNMENT_LOCK_STATE_STORAGE_KEY = "ticketing.responsible-technicians.lock-state.v1"

type TechnicianContextValue = {
  technicians: Technician[]
  assignments: TechnicianCategoryAssignments
  responsibleAssignments: ResponsibleTechnicianAssignments
  responsibleRoleDefinitions: ResponsibleRoleDefinitions
  responsibleAssignmentLockStates: ResponsibleAssignmentLockStates
  setTechnicians: (next: Technician[]) => void
  setCategoryTechnicians: (categoryId: string, technicianIds: string[]) => void
  setSubcategoryTechnicians: (categoryId: string, subcategoryId: string, technicianIds: string[]) => void
  resetAssignments: () => void
  assignResponsibleTechnician: (roleId: ResponsibleRoleId, technicianId: string | null) => void
  setResponsiblePermissions: (roleId: ResponsibleRoleId, permissions: string[]) => void
  addResponsibleRole: (
    definition: ResponsibleRoleDefinition,
    initialPermissions?: string[],
  ) => void
  submitResponsibleAssignment: (roleId: ResponsibleRoleId) => void
  unlockResponsibleAssignment: (roleId: ResponsibleRoleId) => void
}

const TechnicianContext = createContext<TechnicianContextValue | null>(null)

interface TechnicianProviderProps {
  children: ReactNode
  initialTechnicians: Technician[]
  initialAssignments: TechnicianCategoryAssignments
  initialResponsibleAssignments: ResponsibleTechnicianAssignments
  initialResponsibleRoleDefinitions: ResponsibleRoleDefinitions
}

export function TechnicianProvider({
  children,
  initialTechnicians,
  initialAssignments,
  initialResponsibleAssignments,
  initialResponsibleRoleDefinitions,
}: TechnicianProviderProps) {
  const [technicians, setTechniciansState] = useState<Technician[]>(initialTechnicians)
  const [assignments, setAssignments] = useState<TechnicianCategoryAssignments>(initialAssignments)
  const [responsibleAssignments, setResponsibleAssignments] = useState<ResponsibleTechnicianAssignments>(
    initialResponsibleAssignments,
  )
  const [responsibleRoleDefinitions, setResponsibleRoleDefinitions] =
    useState<ResponsibleRoleDefinitions>(initialResponsibleRoleDefinitions)
  const [responsibleAssignmentLockStates, setResponsibleAssignmentLockStates] =
    useState<ResponsibleAssignmentLockStates>(() => {
      const defaults: ResponsibleAssignmentLockStates = {}
      for (const roleId of Object.keys(initialResponsibleAssignments)) {
        defaults[roleId] = { locked: false }
      }
      return defaults
    })

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedTechnicians = localStorage.getItem(TECHNICIANS_STORAGE_KEY)
    if (storedTechnicians) {
      try {
        const parsed = JSON.parse(storedTechnicians)
        if (Array.isArray(parsed)) {
          setTechniciansState(parsed)
        }
      } catch {
        // ignore invalid data
      }
    } else {
      localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(initialTechnicians))
    }
  }, [initialTechnicians])

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedAssignments = localStorage.getItem(TECHNICIAN_ASSIGNMENTS_STORAGE_KEY)
    if (storedAssignments) {
      try {
        const parsed = JSON.parse(storedAssignments)
        if (parsed && typeof parsed === "object") {
          setAssignments(parsed)
        }
      } catch {
        // ignore invalid data
      }
    } else {
      localStorage.setItem(
        TECHNICIAN_ASSIGNMENTS_STORAGE_KEY,
        JSON.stringify(initialAssignments),
      )
    }
  }, [initialAssignments])

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedResponsibleAssignments = localStorage.getItem(
      RESPONSIBLE_TECHNICIANS_STORAGE_KEY,
    )
    if (storedResponsibleAssignments) {
      try {
        const parsed = JSON.parse(storedResponsibleAssignments)
        if (parsed && typeof parsed === "object") {
          setResponsibleAssignments(parsed)
        }
      } catch {
        // ignore invalid data
      }
    } else {
      localStorage.setItem(
        RESPONSIBLE_TECHNICIANS_STORAGE_KEY,
        JSON.stringify(initialResponsibleAssignments),
      )
    }
  }, [initialResponsibleAssignments])

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedRoleDefinitions = localStorage.getItem(
      RESPONSIBLE_ROLE_DEFINITIONS_STORAGE_KEY,
    )
    if (storedRoleDefinitions) {
      try {
        const parsed = JSON.parse(storedRoleDefinitions)
        if (parsed && typeof parsed === "object") {
          setResponsibleRoleDefinitions(parsed)
        }
      } catch {
        // ignore invalid data
      }
    } else {
      localStorage.setItem(
        RESPONSIBLE_ROLE_DEFINITIONS_STORAGE_KEY,
        JSON.stringify(initialResponsibleRoleDefinitions),
      )
    }
  }, [initialResponsibleRoleDefinitions])

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedLockStates = localStorage.getItem(
      RESPONSIBLE_ASSIGNMENT_LOCK_STATE_STORAGE_KEY,
    )
    if (storedLockStates) {
      try {
        const parsed = JSON.parse(storedLockStates)
        if (parsed && typeof parsed === "object") {
          setResponsibleAssignmentLockStates((prev) => {
            const next = { ...prev }
            let changed = false
            Object.entries(parsed as Record<string, ResponsibleAssignmentsLockState>).forEach(
              ([roleId, value]) => {
                if (value && typeof value === "object" && "locked" in value) {
                  const normalized: ResponsibleAssignmentsLockState = {
                    locked: Boolean(value.locked),
                    submittedAt:
                      typeof value.submittedAt === "number" ? value.submittedAt : undefined,
                  }
                  const existing = next[roleId]
                  if (
                    !existing ||
                    existing.locked !== normalized.locked ||
                    existing.submittedAt !== normalized.submittedAt
                  ) {
                    next[roleId] = normalized
                    changed = true
                  }
                }
              },
            )
            return changed ? next : prev
          })
        }
      } catch {
        // ignore invalid data
      }
    } else {
      const defaults: ResponsibleAssignmentLockStates = {}
      for (const roleId of Object.keys(initialResponsibleAssignments)) {
        defaults[roleId] = { locked: false }
      }
      setResponsibleAssignmentLockStates(defaults)
      localStorage.setItem(
        RESPONSIBLE_ASSIGNMENT_LOCK_STATE_STORAGE_KEY,
        JSON.stringify(defaults),
      )
    }
  }, [initialResponsibleAssignments])

  const persistTechnicians = useCallback((next: Technician[]) => {
    setTechniciansState(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  const persistAssignments = useCallback(
    (
      next:
        | TechnicianCategoryAssignments
        | ((prev: TechnicianCategoryAssignments) => TechnicianCategoryAssignments),
    ) => {
      setAssignments((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next
        if (typeof window !== "undefined") {
          localStorage.setItem(
            TECHNICIAN_ASSIGNMENTS_STORAGE_KEY,
            JSON.stringify(resolved),
          )
        }
        return resolved
      })
    },
    [],
  )

  const persistResponsibleAssignments = useCallback(
    (
      next:
        | ResponsibleTechnicianAssignments
        | ((prev: ResponsibleTechnicianAssignments) => ResponsibleTechnicianAssignments),
    ) => {
      setResponsibleAssignments((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next
        if (typeof window !== "undefined") {
          localStorage.setItem(
            RESPONSIBLE_TECHNICIANS_STORAGE_KEY,
            JSON.stringify(resolved),
          )
        }
        return resolved
      })
    },
    [],
  )

  const persistResponsibleAssignmentLockStates = useCallback(
    (
      next:
        | ResponsibleAssignmentLockStates
        | ((prev: ResponsibleAssignmentLockStates) => ResponsibleAssignmentLockStates),
    ) => {
      setResponsibleAssignmentLockStates((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next
        if (resolved === prev) {
          return prev
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(
            RESPONSIBLE_ASSIGNMENT_LOCK_STATE_STORAGE_KEY,
            JSON.stringify(resolved),
          )
        }
        return resolved
      })
    },
    [],
  )

  const persistResponsibleRoleDefinitions = useCallback(
    (
      next:
        | ResponsibleRoleDefinitions
        | ((prev: ResponsibleRoleDefinitions) => ResponsibleRoleDefinitions),
    ) => {
      setResponsibleRoleDefinitions((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next
        if (typeof window !== "undefined") {
          localStorage.setItem(
            RESPONSIBLE_ROLE_DEFINITIONS_STORAGE_KEY,
            JSON.stringify(resolved),
          )
        }
        return resolved
      })
    },
    [],
  )

  const setCategoryTechnicians = useCallback(
    (categoryId: string, technicianIds: string[]) => {
      const normalized = Array.from(new Set(technicianIds))
      persistAssignments((prev) => {
        const current = prev[categoryId] || { technicians: [], subcategories: {} }
        return {
          ...prev,
          [categoryId]: {
            technicians: normalized,
            subcategories: current.subcategories,
          },
        }
      })
    },
    [persistAssignments],
  )

  const setSubcategoryTechnicians = useCallback(
    (categoryId: string, subcategoryId: string, technicianIds: string[]) => {
      const normalized = Array.from(new Set(technicianIds))
      persistAssignments((prev) => {
        const current = prev[categoryId] || { technicians: [], subcategories: {} }
        return {
          ...prev,
          [categoryId]: {
            technicians: current.technicians,
            subcategories: {
              ...current.subcategories,
              [subcategoryId]: normalized,
            },
          },
        }
      })
    },
    [persistAssignments],
  )

  const resetAssignments = useCallback(() => {
    persistAssignments(initialAssignments)
  }, [initialAssignments, persistAssignments])

  useEffect(() => {
    persistResponsibleAssignmentLockStates((prev) => {
      const next = { ...prev }
      let changed = false
      Object.keys(responsibleAssignments).forEach((roleId) => {
        if (!next[roleId]) {
          next[roleId] = { locked: false }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [persistResponsibleAssignmentLockStates, responsibleAssignments])

  useEffect(() => {
    persistResponsibleAssignments((prev) => {
      let changed = false
      const next = { ...prev }
      Object.values(responsibleRoleDefinitions).forEach((definition) => {
        if (!next[definition.id]) {
          changed = true
          next[definition.id] = {
            technicianId: null,
            accessLevel: definition.accessLevel,
            permissions: definition.permissionOptions.map((option) => option.id),
          }
        }
      })
      return changed ? next : prev
    })
  }, [persistResponsibleAssignments, responsibleRoleDefinitions])

  const assignResponsibleTechnician = useCallback(
    (roleId: ResponsibleRoleId, technicianId: string | null) => {
      persistResponsibleAssignments((prev) => {
        const lockState = responsibleAssignmentLockStates[roleId]
        if (lockState?.locked) {
          return prev
        }
        const definition = responsibleRoleDefinitions[roleId]
        const baseAssignment =
          prev[roleId] ||
          initialResponsibleAssignments[roleId] ||
          (definition
            ? {
                technicianId: null,
                accessLevel: definition.accessLevel,
                permissions: definition.permissionOptions.map((option) => option.id),
              }
            : { technicianId: null, accessLevel: "partial", permissions: [] })

        return {
          ...prev,
          [roleId]: {
            ...baseAssignment,
            technicianId,
          },
        }
      })
    },
    [
      initialResponsibleAssignments,
      persistResponsibleAssignments,
      responsibleAssignmentLockStates,
      responsibleRoleDefinitions,
    ],
  )

  const setResponsiblePermissions = useCallback(
    (roleId: ResponsibleRoleId, permissions: string[]) => {
      const normalized = Array.from(new Set(permissions))
      persistResponsibleAssignments((prev) => {
        const lockState = responsibleAssignmentLockStates[roleId]
        if (lockState?.locked) {
          return prev
        }
        const definition = responsibleRoleDefinitions[roleId]
        const baseAssignment =
          prev[roleId] ||
          initialResponsibleAssignments[roleId] ||
          (definition
            ? {
                technicianId: null,
                accessLevel: definition.accessLevel,
                permissions: definition.permissionOptions.map((option) => option.id),
              }
            : { technicianId: null, accessLevel: "partial", permissions: [] })

        return {
          ...prev,
          [roleId]: {
            ...baseAssignment,
            permissions: normalized,
          },
        }
      })
    },
    [
      initialResponsibleAssignments,
      persistResponsibleAssignments,
      responsibleAssignmentLockStates,
      responsibleRoleDefinitions,
    ],
  )

  const addResponsibleRole = useCallback(
    (definition: ResponsibleRoleDefinition, initialPermissions?: string[]) => {
      const normalizedPermissions = Array.from(
        new Set(
          (initialPermissions && initialPermissions.length > 0
            ? initialPermissions
            : definition.permissionOptions.map((option) => option.id)) || [],
        ),
      )

      persistResponsibleRoleDefinitions((prev) => ({
        ...prev,
        [definition.id]: definition,
      }))

      persistResponsibleAssignments((prev) => ({
        ...prev,
        [definition.id]: {
          technicianId: null,
          accessLevel: definition.accessLevel,
          permissions: normalizedPermissions,
        },
      }))
      persistResponsibleAssignmentLockStates((prev) => ({
        ...prev,
        [definition.id]: { locked: false },
      }))
    },
    [
      persistResponsibleAssignmentLockStates,
      persistResponsibleAssignments,
      persistResponsibleRoleDefinitions,
    ],
  )

  const submitResponsibleAssignment = useCallback(
    (roleId: ResponsibleRoleId) => {
      const timestamp = Date.now()
      persistResponsibleAssignmentLockStates((prev) => ({
        ...prev,
        [roleId]: { locked: true, submittedAt: timestamp },
      }))
    },
    [persistResponsibleAssignmentLockStates],
  )

  const unlockResponsibleAssignment = useCallback(
    (roleId: ResponsibleRoleId) => {
      persistResponsibleAssignmentLockStates((prev) => ({
        ...prev,
        [roleId]: { locked: false },
      }))
    },
    [persistResponsibleAssignmentLockStates],
  )

  const value = useMemo(
    () => ({
      technicians,
      assignments,
      responsibleAssignments,
      responsibleRoleDefinitions,
      responsibleAssignmentLockStates,
      setTechnicians: persistTechnicians,
      setCategoryTechnicians,
      setSubcategoryTechnicians,
      resetAssignments,
      assignResponsibleTechnician,
      setResponsiblePermissions,
      addResponsibleRole,
      submitResponsibleAssignment,
      unlockResponsibleAssignment,
    }),
    [
      assignments,
      assignResponsibleTechnician,
      addResponsibleRole,
      responsibleAssignmentLockStates,
      persistTechnicians,
      responsibleAssignments,
      responsibleRoleDefinitions,
      resetAssignments,
      setCategoryTechnicians,
      setResponsiblePermissions,
      setSubcategoryTechnicians,
      technicians,
      submitResponsibleAssignment,
      unlockResponsibleAssignment,
    ],
  )

  return <TechnicianContext.Provider value={value}>{children}</TechnicianContext.Provider>
}

export function useTechnicians() {
  const ctx = useContext(TechnicianContext)
  if (!ctx) {
    throw new Error("useTechnicians must be used within TechnicianProvider")
  }
  return ctx
}
