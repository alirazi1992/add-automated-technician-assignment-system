import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { CategoryProvider } from "@/services/useCategories"
import { initialCategoriesData } from "@/data/initial-categories"
import { TechnicianProvider } from "@/services/useTechnicians"
import { initialTechnicians } from "@/data/initial-technicians"
import { initialTechnicianAssignments } from "@/data/initial-technician-assignments"
import { initialResponsibleTechnicianAssignments } from "@/data/initial-responsible-technicians"
import { initialResponsibleRoleDefinitions } from "@/data/responsible-role-definitions"

const inter = Inter({ subsets: ["latin"] })
const iranYekan = localFont({
  src: [
    { path: "../fonts/IRANYekanXVFaNumVF.woff2", weight: "100 900", style: "normal" },
  ],
  display: "swap",
})

export const metadata: Metadata = {
  title: "سیستم مدیریت خدمات IT",
  description: "سیستم مدیریت درخواست‌های فنی و پشتیبانی",
    generator: 'Ali_Razi'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} ${iranYekan.className} font-iran`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <TechnicianProvider
              initialTechnicians={initialTechnicians}
              initialAssignments={initialTechnicianAssignments}
              initialResponsibleAssignments={initialResponsibleTechnicianAssignments}
              initialResponsibleRoleDefinitions={initialResponsibleRoleDefinitions}
            >
              <CategoryProvider initial={initialCategoriesData}>{children}</CategoryProvider>
            </TechnicianProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
