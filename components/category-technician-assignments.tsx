"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Settings, Layers } from "lucide-react"
import { useTechnicians } from "@/services/useTechnicians"
import { useCategories } from "@/services/useCategories"
import type { CategoriesData } from "@/services/categories-types"

interface CategoryTechnicianAssignmentsProps {
  categoriesData?: CategoriesData
}

const categoryLabels: Record<string, string> = {
  hardware: "سخت‌افزار",
  software: "نرم‌افزار",
  network: "شبکه",
  email: "ایمیل",
  security: "امنیت",
  access: "دسترسی",
}

export function CategoryTechnicianAssignments({
  categoriesData,
}: CategoryTechnicianAssignmentsProps) {
  const { categories: contextCategories } = useCategories()
  const categories = categoriesData || contextCategories
  const { technicians, assignments, setCategoryTechnicians, setSubcategoryTechnicians } = useTechnicians()
  const categoryIds = useMemo(() => Object.keys(categories), [categories])
  const [activeTab, setActiveTab] = useState(categoryIds[0] ?? "")

  const getCategoryAssignments = (categoryId: string) => assignments[categoryId] || { technicians: [], subcategories: {} }

  const handleCategoryTechnicianToggle = (categoryId: string, technicianId: string, checked: boolean) => {
    const current = new Set(getCategoryAssignments(categoryId).technicians)
    if (checked) {
      current.add(technicianId)
    } else {
      current.delete(technicianId)
    }
    setCategoryTechnicians(categoryId, Array.from(current))
  }

  const handleSubcategoryTechnicianToggle = (
    categoryId: string,
    subcategoryId: string,
    technicianId: string,
    checked: boolean,
  ) => {
    const subcategoryAssignments = getCategoryAssignments(categoryId).subcategories[subcategoryId] || []
    const current = new Set(subcategoryAssignments)
    if (checked) {
      current.add(technicianId)
    } else {
      current.delete(technicianId)
    }
    setSubcategoryTechnicians(categoryId, subcategoryId, Array.from(current))
  }

  const renderTechnicianOption = (
    categoryId: string,
    technicianId: string,
    isChecked: boolean,
    hint?: string,
  ) => {
    const technician = technicians.find((tech) => tech.id === technicianId)
    if (!technician) return null

    const specialtyMatch = technician.specialties.includes(categoryId)

    return (
      <div key={technician.id} className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id={`${categoryId}-${technician.id}`}
            checked={isChecked}
            onCheckedChange={(value) =>
              handleCategoryTechnicianToggle(categoryId, technician.id, value === true)
            }
          />
          <Label htmlFor={`${categoryId}-${technician.id}`} className="flex items-center gap-3 text-right">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{technician.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{technician.name}</span>
              <span className="text-xs text-muted-foreground">{technician.email}</span>
            </div>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          {specialtyMatch ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              تخصص اصلی
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              تخصص مرتبط
            </Badge>
          )}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger className="text-xs text-muted-foreground">
                امتیاز {technician.rating.toFixed(1)}
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>تیکت‌های فعال: {technician.activeTickets}</p>
                  <p>تیکت‌های تکمیل‌شده: {technician.completedTickets}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {hint && <Badge variant="outline">{hint}</Badge>}
        </div>
      </div>
    )
  }

  const renderSubcategoryTechnicians = (categoryId: string, subcategoryId: string) => {
    const categoryAssignment = getCategoryAssignments(categoryId)
    const selected = new Set(categoryAssignment.subcategories[subcategoryId] || [])

    return (
      <div className="space-y-2">
        {technicians.map((technician) => {
          const isChecked = selected.has(technician.id)
          const hasSkill = technician.subSpecialties?.includes(subcategoryId)
          const hint = hasSkill ? "تخصص دقیق" : undefined
          return (
            <div key={`${subcategoryId}-${technician.id}`} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`${subcategoryId}-${technician.id}`}
                  checked={isChecked}
                  onCheckedChange={(value) =>
                    handleSubcategoryTechnicianToggle(
                      categoryId,
                      subcategoryId,
                      technician.id,
                      value === true,
                    )
                  }
                />
                <Label htmlFor={`${subcategoryId}-${technician.id}`} className="flex flex-col gap-0.5 text-right">
                  <span className="font-medium">{technician.name}</span>
                  <span className="text-xs text-muted-foreground">{technician.email}</span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                {hasSkill ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    مهارت ویژه
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    مرتبط
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">امتیاز {technician.rating.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (categoryIds.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-right">
            <Settings className="h-5 w-5" />
            تعریف تخصص تکنسین برای دسته‌بندی‌ها
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            مدیریت چندتکنسینه
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categoryIds.map((categoryId) => (
              <TabsTrigger key={categoryId} value={categoryId} className="gap-2">
                <Layers className="h-4 w-4" />
                {categoryLabels[categoryId] || categories[categoryId].label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoryIds.map((categoryId) => {
            const category = categories[categoryId]
            const categoryAssignment = getCategoryAssignments(categoryId)

            return (
              <TabsContent key={categoryId} value={categoryId} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">تکنسین‌های مسئول دسته اصلی</h4>
                    <ScrollArea className="max-h-60 rounded-lg border p-3">
                      <div className="space-y-3">
                        {technicians.map((technician) => (
                          <div key={`${categoryId}-${technician.id}`}>
                            {renderTechnicianOption(
                              categoryId,
                              technician.id,
                              categoryAssignment.technicians.includes(technician.id),
                              technician.specialties.includes(categoryId) ? "اولویت" : undefined,
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">زیرمسئولیت‌های تخصصی</h4>
                    <div className="space-y-4">
                      {Object.entries(category.subIssues || {}).map(([subcategoryId, subcategory]) => (
                        <div key={subcategoryId} className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{subcategory.label}</span>
                              {subcategory.description && (
                                <span className="text-xs text-muted-foreground">{subcategory.description}</span>
                              )}
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {getCategoryAssignments(categoryId).subcategories[subcategoryId]?.length || 0} تکنسین
                            </Badge>
                          </div>
                          {renderSubcategoryTechnicians(categoryId, subcategoryId)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
