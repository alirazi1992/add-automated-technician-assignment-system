"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Ticket } from "@/types"
import { AdminTicketManagement } from "./admin-ticket-management"
import { AdminTechnicianAssignment } from "./admin-technician-assignment"
import { CategoryManagement } from "./category-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketIcon, UserPlus, FolderTree } from "lucide-react"
import { EnhancedAutoAssignment } from "./enhanced-auto-assignment"
import { Settings } from "lucide-react"

interface AdminDashboardProps {
  tickets: Ticket[]
  onTicketUpdate: (ticketId: string, updates: Partial<Ticket>) => void
  categoriesData: any
  onCategoryUpdate: (categories: any) => void
  activeSection?: "tickets" | "assignment" | "categories" | "auto-settings"
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tickets,
  onTicketUpdate,
  categoriesData,
  onCategoryUpdate,
  activeSection,
}) => {
  const [activeTab, setActiveTab] = useState("tickets")

  useEffect(() => {
    if (activeSection) {
      setActiveTab(activeSection)
    }
  }, [activeSection])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="tickets" className="gap-2">
          <TicketIcon className="w-4 h-4" />
          مدیریت کامل تیکت‌ها
        </TabsTrigger>
        <TabsTrigger value="assignment" className="gap-2">
          <UserPlus className="w-4 h-4" />
          تعیین تکنسین
        </TabsTrigger>
        <TabsTrigger value="categories" className="gap-2">
          <FolderTree className="w-4 h-4" />
          مدیریت دسته‌بندی
        </TabsTrigger>
        <TabsTrigger value="auto-settings" className="gap-2">
          <Settings className="w-4 h-4" />
          تنظیمات خودکار
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tickets">
        <AdminTicketManagement tickets={tickets} onTicketUpdate={onTicketUpdate} />
      </TabsContent>

      <TabsContent value="assignment">
        <AdminTechnicianAssignment tickets={tickets} onTicketUpdate={onTicketUpdate} />
      </TabsContent>

      <TabsContent value="categories">
        <CategoryManagement categoriesData={categoriesData} onCategoryUpdate={onCategoryUpdate} />
      </TabsContent>

      <TabsContent value="auto-settings">
        <EnhancedAutoAssignment tickets={tickets} onTicketUpdate={onTicketUpdate} />
      </TabsContent>
    </Tabs>
  )
}
