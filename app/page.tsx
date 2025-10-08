"use client"

import { useEffect, useMemo, useState } from "react"
import { ClientDashboard } from "@/components/client-dashboard"
import { TechnicianDashboard } from "@/components/technician-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard-shell"
import { LoginDialog } from "@/components/login-dialog"
import { UserMenu } from "@/components/user-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useCategories } from "@/services/useCategories"
import type { CategoriesData } from "@/services/categories-types"
import { FolderTree, LayoutDashboard, ListChecks, LogIn, Settings2, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"

const initialTickets = [
  {
    id: "TK-2024-001",
    title: "رایانه کار نمی‌کند",
    description: "رایانه من صبح که آمدم کار کار نمی‌کند. وقتی دکمه پاور را می‌زنم هیچ چراغی روشن نمی‌شود.",
    status: "in-progress",
    priority: "high",
    category: "hardware",
    subcategory: "computer-not-working",
    clientName: "احمد محمدی",
    clientEmail: "ahmad@company.com",
    clientPhone: "09123456789",
    department: "حسابداری",
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    assignedTo: "2",
    assignedTechnicianName: "علی تکنسین",
    assignedTechnicianEmail: "ali@company.com",
    responses: [
      {
        message:
          "سلام احمد جان، تیکت شما را دریافت کردم. لطفاً بررسی کنید که کابل برق به درستی وصل باشد و پریز برق کار کند.",
        status: "in-progress",
        technicianName: "علی تکنسین",
        technicianEmail: "ali@company.com",
        timestamp: "2024-01-15T09:00:00Z",
      },
    ],
  },
  {
    id: "TK-2024-002",
    title: "مشکل اتصال به اینترنت",
    description: "از دیروز اینترنت من قطع و وصل می‌شود. نمی‌توانم به درستی کار کنم.",
    status: "resolved",
    priority: "medium",
    category: "network",
    subcategory: "internet-connection",
    clientName: "فاطمه کریمی",
    clientEmail: "fateme@company.com",
    clientPhone: "09187654321",
    department: "بازاریابی",
    createdAt: "2024-01-14T10:15:00Z",
    updatedAt: "2024-01-14T14:30:00Z",
    assignedTo: "2",
    assignedTechnicianName: "علی تکنسین",
    assignedTechnicianEmail: "ali@company.com",
    responses: [
      {
        message: "مشکل از طرف اپراتور بود. اکنون برطرف شده است.",
        status: "resolved",
        technicianName: "علی تکنسین",
        technicianEmail: "ali@company.com",
        timestamp: "2024-01-14T14:30:00Z",
      },
    ],
  },
  {
    id: "TK-2024-003",
    title: "نصب نرم‌افزار حسابداری",
    description: "نیاز به نصب نرم‌افزار حسابداری جدید دارم. لطفاً کمک کنید.",
    status: "open",
    priority: "low",
    category: "software",
    subcategory: "software-installation",
    clientName: "حسن رضایی",
    clientEmail: "hassan@company.com",
    clientPhone: "09198765432",
    department: "حسابداری",
    createdAt: "2024-01-16T11:20:00Z",
    updatedAt: "2024-01-16T11:20:00Z",
    assignedTo: "2",
    assignedTechnicianName: "علی تکنسین",
    assignedTechnicianEmail: "ali@company.com",
    responses: [],
  },
  {
    id: "TK-2024-004",
    title: "مشکل چاپگر اداری",
    description: "چاپگر در بخش اداری کاغذ گیر می‌کند و نمی‌توان از آن استفاده کرد.",
    status: "in-progress",
    priority: "medium",
    category: "hardware",
    subcategory: "printer-issues",
    clientName: "مریم احمدی",
    clientEmail: "maryam@company.com",
    clientPhone: "09123456780",
    department: "اداری",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
    assignedTo: "2",
    assignedTechnicianName: "علی تکنسین",
    assignedTechnicianEmail: "ali@company.com",
    responses: [
      {
        message: "در حال بررسی مشکل چاپگر هستم. به زودی حل خواهد شد.",
        status: "in-progress",
        technicianName: "علی تکنسین",
        technicianEmail: "ali@company.com",
        timestamp: "2024-01-16T10:30:00Z",
      },
    ],
  },
  {
    id: "TK-2024-005",
    title: "درخواست دسترسی به سیستم CRM",
    description: "نیاز به دسترسی به سیستم مدیریت ارتباط با مشتری دارم تا بتوانم گزارش‌های فروش را مشاهده کنم.",
    status: "open",
    priority: "medium",
    category: "access",
    subcategory: "system-access",
    clientName: "سارا موسوی",
    clientEmail: "sara@company.com",
    clientPhone: "09123456781",
    department: "فروش",
    createdAt: "2024-01-17T08:45:00Z",
    updatedAt: "2024-01-17T08:45:00Z",
    assignedTo: null,
    assignedTechnicianName: null,
    assignedTechnicianEmail: null,
    responses: [],
  },
  {
    id: "TK-2024-006",
    title: "مشکل امنیتی - ایمیل مشکوک",
    description: "ایمیل مشکوکی دریافت کردم که ممکن است فیشینگ باشد. لطفاً بررسی کنید.",
    status: "open",
    priority: "urgent",
    category: "security",
    subcategory: "security-incident",
    clientName: "رضا نوری",
    clientEmail: "reza@company.com",
    clientPhone: "09123456782",
    department: "مالی",
    createdAt: "2024-01-17T10:20:00Z",
    updatedAt: "2024-01-17T10:20:00Z",
    assignedTo: null,
    assignedTechnicianName: null,
    assignedTechnicianEmail: null,
    responses: [],
  },
  {
    id: "TK-2024-007",
    title: "مانیتور تصویر نمایش نمی‌دهد",
    description: "مانیتور من از صبح روشن نمی‌شود. چراغ پاور روشن است اما صفحه سیاه است.",
    status: "open",
    priority: "high",
    category: "hardware",
    subcategory: "monitor-problems",
    clientName: "نازنین کریمی",
    clientEmail: "nazanin@company.com",
    clientPhone: "09123456783",
    department: "طراحی",
    createdAt: "2024-01-17T11:30:00Z",
    updatedAt: "2024-01-17T11:30:00Z",
    assignedTo: null,
    assignedTechnicianName: null,
    assignedTechnicianEmail: null,
    responses: [],
  },
  {
    id: "TK-2024-008",
    title: "بازنشانی رمز عبور ایمیل",
    description: "رمز عبور ایمیل کاری خود را فراموش کرده‌ام و نمی‌توانم وارد شوم.",
    status: "open",
    priority: "medium",
    category: "security",
    subcategory: "password-reset",
    clientName: "علی محمدی",
    clientEmail: "alim@company.com",
    clientPhone: "09123456784",
    department: "منابع انسانی",
    createdAt: "2024-01-17T13:15:00Z",
    updatedAt: "2024-01-17T13:15:00Z",
    assignedTo: null,
    assignedTechnicianName: null,
    assignedTechnicianEmail: null,
    responses: [],
  },
  {
    id: "TK-2024-009",
    title: "مشکل اتصال وای‌فای",
    description: "لپ‌تاپ من به شبکه وای‌فای اداری متصل نمی‌شود. سایر دستگاه‌ها مشکلی ندارند.",
    status: "open",
    priority: "low",
    category: "network",
    subcategory: "wifi-problems",
    clientName: "فرهاد رضایی",
    clientEmail: "farhad@company.com",
    clientPhone: "09123456785",
    department: "IT",
    createdAt: "2024-01-17T14:00:00Z",
    updatedAt: "2024-01-17T14:00:00Z",
    assignedTo: null,
    assignedTechnicianName: null,
    assignedTechnicianEmail: null,
    responses: [],
  },
]

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [tickets, setTickets] = useState(initialTickets)
  const { categories: categoriesData, save: saveCategories } = useCategories()
  const [activeView, setActiveView] = useState<string>("")
  const getDefaultViewForRole = (role: "client" | "engineer" | "admin") => {
    switch (role) {
      case "admin":
        return "admin.tickets"
      case "engineer":
        return "engineer.assigned"
      default:
        return "client.tickets"
    }
  }

  // Redirect unauthenticated users to the new login page
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!user) {
      setActiveView("")
      return
    }
    setActiveView((current) => {
      if (current && current.startsWith(user.role)) {
        return current
      }
      return getDefaultViewForRole(user.role)
    })
  }, [user])

  const handleTicketCreate = (newTicket: any) => {
    setTickets((prev) => [newTicket, ...prev])
  }

  const handleTicketUpdate = (ticketId: string, updates: any) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket,
      ),
    )
  }

  const handleCategoryUpdate = (updatedCategories: CategoriesData) => {
    void saveCategories(updatedCategories)
  }
  const navItems = useMemo<DashboardNavItem[]>(() => {
    if (!user) {
      return []
    }

    if (user.role === "client") {
      const userTickets = tickets.filter((ticket) => ticket.clientEmail === user.email)
      const newTicketCount = userTickets.filter((ticket) => ticket.status === "open").length

      return [
        {
          id: "client-overview",
          title: "داشبورد",
          icon: LayoutDashboard,
          target: "client.tickets",
        },
        {
          id: "client-tickets",
          title: "تیکت‌های من",
          icon: Ticket,
          children: [
            {
              id: "client-tickets-list",
              title: "همه تیکت‌ها",
              target: "client.tickets",
              badge: userTickets.length,
            },
            {
              id: "client-tickets-create",
              title: "ثبت تیکت جدید",
              target: "client.create",
              badge: newTicketCount > 0 ? "+" : undefined,
            },
          ],
        },
      ]
    }

    if (user.role === "engineer") {
      const technicianTickets = tickets.filter((ticket) => ticket.assignedTechnicianEmail === user.email)
      const inProgressCount = technicianTickets.filter((ticket) => ticket.status === "in-progress").length
      const closedCount = technicianTickets.filter((ticket) => ticket.status === "resolved" || ticket.status === "closed").length

      return [
        {
          id: "engineer-overview",
          title: "داشبورد تکنسین",
          icon: LayoutDashboard,
          target: "engineer.assigned",
        },
        {
          id: "engineer-tickets",
          title: "تیکت‌های ارجاع‌شده",
          icon: ListChecks,
          children: [
            {
              id: "engineer-assigned",
              title: "همه ارجاعات",
              target: "engineer.assigned",
              badge: technicianTickets.length,
            },
            {
              id: "engineer-progress",
              title: "در حال رسیدگی",
              target: "engineer.in-progress",
              badge: inProgressCount,
            },
            {
              id: "engineer-history",
              title: "تاریخچه حل‌شده",
              target: "engineer.history",
              badge: closedCount,
            },
          ],
        },
      ]
    }

    const openTicketsCount = tickets.filter((ticket) => ticket.status === "open").length

    return [
      {
        id: "admin-overview",
        title: "داشبورد مدیر",
        icon: LayoutDashboard,
        target: "admin.tickets",
      },
      {
        id: "admin-tickets",
        title: "مدیریت تیکت‌ها",
        icon: Ticket,
        children: [
          {
            id: "admin-tickets-all",
            title: "تمام تیکت‌ها",
            target: "admin.tickets",
            badge: tickets.length,
          },
          {
            id: "admin-assignment",
            title: "تخصیص تکنسین",
            target: "admin.assignment",
            badge: openTicketsCount,
          },
        ],
      },
      {
        id: "admin-categories",
        title: "دسته‌بندی‌ها",
        icon: FolderTree,
        children: [
          {
            id: "admin-categories-manage",
            title: "مدیریت دسته‌بندی‌ها",
            target: "admin.categories",
            badge: Object.keys(categoriesData).length,
          },
        ],
      },
      {
        id: "admin-automation",
        title: "تنظیمات خودکارسازی",
        icon: Settings2,
        target: "admin.auto-settings",
      },
    ]
  }, [user, tickets, categoriesData])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سیستم مدیریت خدمات IT</h1>
            <p className="text-gray-600">برای دسترسی به سیستم وارد شوید</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <Button onClick={() => setLoginDialogOpen(true)} className="w-full gap-2" size="lg">
              <LogIn className="w-5 h-5" />
              ورود به سیستم
            </Button>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 text-center mb-3">حساب‌های نمونه:</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>کاربر: ahmad@company.com / 123456</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>تکنسین: ali@company.com / 123456</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>مدیر: admin@company.com / 123456</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
      </div>
    )
  }

  const resolvedActiveView = user ? activeView || getDefaultViewForRole(user.role) : ""

  const dashboardContent = (() => {
    if (!user) {
      return null
    }

    if (user.role === "client") {
      const clientSection: "tickets" | "create" =
        resolvedActiveView === "client.create" ? "create" : "tickets"

      return (
        <ClientDashboard
          tickets={tickets}
          onTicketCreate={handleTicketCreate}
          currentUser={user}
          categoriesData={categoriesData}
          activeSection={clientSection}
        />
      )
    }

    if (user.role === "engineer") {
      const engineerSection: "assigned" | "in-progress" | "history" =
        resolvedActiveView === "engineer.in-progress"
          ? "in-progress"
          : resolvedActiveView === "engineer.history"
            ? "history"
            : "assigned"

      const handleTechnicianSectionChange = (section: "assigned" | "in-progress" | "history") => {
        const next = `engineer.${section}`
        setActiveView((prev) => (prev === next ? prev : next))
      }

      return (
        <TechnicianDashboard
          tickets={tickets}
          onTicketUpdate={handleTicketUpdate}
          currentUser={user}
          activeSection={engineerSection}
          onSectionChange={handleTechnicianSectionChange}
        />
      )
    }

    const adminSection: "tickets" | "assignment" | "categories" | "auto-settings" =
      resolvedActiveView === "admin.assignment"
        ? "assignment"
        : resolvedActiveView === "admin.categories"
          ? "categories"
          : resolvedActiveView === "admin.auto-settings"
            ? "auto-settings"
            : "tickets"

    return (
      <AdminDashboard
        tickets={tickets}
        onTicketUpdate={handleTicketUpdate}
        categoriesData={categoriesData}
        onCategoryUpdate={handleCategoryUpdate}
        activeSection={adminSection}
      />
    )
  })()

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.phone,
        avatar: (user as any).avatar,
      }}
      navItems={navItems}
      activeItem={resolvedActiveView}
      onSelect={setActiveView}
    >
      {dashboardContent}
    </DashboardShell>
  )
}

