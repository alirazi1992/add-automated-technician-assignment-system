import type { CategoriesData } from "@/services/categories-types"

export interface CategoryService {
  list(): Promise<CategoriesData>
  saveAll(data: CategoriesData): Promise<void>
  seedIfEmpty?(seed: CategoriesData): Promise<void>
}

const STORAGE_KEY = "ticketing.categories.v1"

export class LocalCategoryService implements CategoryService {
  async list(): Promise<CategoriesData> {
    if (typeof window === "undefined") return {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return {}
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  async saveAll(data: CategoriesData): Promise<void> {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  async seedIfEmpty(seed: CategoriesData): Promise<void> {
    if (typeof window === "undefined") return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    }
  }
}

export const categoryService: CategoryService = new LocalCategoryService()

