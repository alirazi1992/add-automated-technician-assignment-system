"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { CategoriesData } from "@/services/categories-types"
import { categoryService } from "@/services/CategoryService"

type Ctx = {
  categories: CategoriesData
  setCategories: (d: CategoriesData) => void
  save: (d: CategoriesData) => Promise<void>
}

const CategoriesContext = createContext<Ctx | null>(null)

export function CategoryProvider({ children, initial }: { children: React.ReactNode; initial?: CategoriesData }) {
  const [categories, setCategories] = useState<CategoriesData>(initial || {})

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const data = await categoryService.list()
      if (mounted && Object.keys(data).length > 0) setCategories(data)
      // If empty and initial provided, seed local
      if (mounted && Object.keys(data).length === 0 && initial) {
        await categoryService.saveAll(initial)
        setCategories(initial)
      }
    })()
    return () => {
      mounted = false
    }
  }, [initial])

  const save = useCallback(async (d: CategoriesData) => {
    setCategories(d)
    await categoryService.saveAll(d)
  }, [])

  return (
    <CategoriesContext.Provider value={{ categories, setCategories, save }}>{children}</CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error("useCategories must be used within CategoryProvider")
  return ctx
}

