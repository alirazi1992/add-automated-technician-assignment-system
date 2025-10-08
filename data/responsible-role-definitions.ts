import type {
  ResponsibleRoleDefinitions,
  ResponsibleRolePermissionOption,
} from "@/services/technician-types"

export const defaultResponsiblePermissionOptions: ResponsibleRolePermissionOption[] = [
  { id: "manage-tickets", label: "مدیریت کامل تیکت‌ها" },
  { id: "assign-technicians", label: "واگذاری تکنسین‌ها" },
  { id: "manage-categories", label: "مدیریت دسته‌بندی و زیرمسئولیت‌ها" },
  { id: "view-reports", label: "مشاهده گزارش‌ها و داشبورد" },
  { id: "configure-automation", label: "پیکربندی خودکارسازی و قوانین" },
  { id: "view-development-queue", label: "مشاهده صف توسعه و تغییرات" },
  { id: "assign-developers", label: "واگذاری وظایف به توسعه‌دهندگان" },
  { id: "update-knowledge-base", label: "به‌روزرسانی پایگاه دانش" },
]

export const initialResponsibleRoleDefinitions: ResponsibleRoleDefinitions = {
  "it-lead": {
    id: "it-lead",
    title: "تکنسین مسئول - فناوری اطلاعات",
    description: "دسترسی کامل برای مدیریت عملیات و هماهنگی تیم‌های فنی",
    accessLevel: "full",
    permissionOptions: defaultResponsiblePermissionOptions,
    createdAt: 1,
    icon: "crown",
  },
  "head-programmer": {
    id: "head-programmer",
    title: "تکنسین مسئول - سرپرست برنامه‌نویسان",
    description: "دسترسی کنترل‌شده برای همسوسازی توسعه نرم‌افزار با نیازهای پشتیبانی",
    accessLevel: "partial",
    permissionOptions: defaultResponsiblePermissionOptions,
    createdAt: 2,
    icon: "shield",
  },
}
