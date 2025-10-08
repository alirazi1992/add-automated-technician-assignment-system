"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  UserPlus,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  ComputerIcon as Software,
  Network,
  Mail,
  Shield,
  Key,
  Wrench,
  Zap,
  Target,
} from "lucide-react"
import { AssignmentCriteriaDialog } from "./assignment-criteria-dialog"
import { useTechnicians } from "@/services/useTechnicians"
import type { Technician, TechnicianCategoryAssignments } from "@/services/technician-types"
import { useCategories } from "@/services/useCategories"
import { CategoryTechnicianAssignments } from "./category-technician-assignments"
import { ResponsibleTechnicianManager } from "./responsible-technician-manager"

const getPreferredTechnicians = (
  ticket: any,
  technicians: Technician[],
  assignments: TechnicianCategoryAssignments,
) => {
  const assignment = assignments[ticket.category]
  if (!assignment) return []

  const pool = new Set<string>(assignment.technicians || [])
  if (ticket.subcategory && assignment.subcategories?.[ticket.subcategory]) {
    assignment.subcategories[ticket.subcategory].forEach((id) => pool.add(id))
  }

  if (pool.size === 0) return []

  return technicians.filter((technician) => pool.has(technician.id))
}

const getAutomaticAssignment = (
  ticket: any,
  technicians: Technician[],
  assignments: TechnicianCategoryAssignments,
) => {
  const preferred = getPreferredTechnicians(ticket, technicians, assignments)
  const basePool = preferred.length > 0 ? preferred : technicians
  const availableTechnicians = basePool.filter((tech) => tech.status === "available")

  const scoringPool = availableTechnicians.length > 0 ? availableTechnicians : basePool

  if (scoringPool.length === 0) {
    const leastBusyTech = technicians
      .filter((tech) => tech.activeTickets < 8)
      .sort((a, b) => a.activeTickets - b.activeTickets)[0]

    return leastBusyTech || null
  }

  const scoredTechnicians = scoringPool.map((tech) => ({
    ...tech,
    score: calculateComprehensiveScore(tech, ticket, assignments),
    matchReasons: getMatchReasons(tech, ticket, assignments),
  }))

  return scoredTechnicians.sort((a, b) => b.score - a.score)[0]
}

const calculateComprehensiveScore = (
  technician: Technician,
  ticket: any,
  assignments: TechnicianCategoryAssignments,
) => {
  let score = 0
  const weights = {
    specialty: 40,
    priority: 25,
    rating: 20,
    workload: 10,
    experience: 5,
  }

  if (technician.specialties.includes(ticket.category)) {
    score += weights.specialty
    if (technician.specialties[0] === ticket.category) {
      score += 10
    }
  } else {
    score -= 15
  }

  if (ticket.subcategory && technician.subSpecialties?.includes(ticket.subcategory)) {
    score += 6
  }

  const assignment = assignments[ticket.category]
  if (assignment?.technicians?.includes(technician.id)) {
    score += 5
  }
  if (ticket.subcategory && assignment?.subcategories?.[ticket.subcategory]?.includes(technician.id)) {
    score += 8
  }

  const priorityScore = getPriorityScore(technician, ticket.priority)
  score += (priorityScore / 100) * weights.priority

  score += (technician.rating / 5) * weights.rating

  const workloadScore = Math.max(0, ((8 - technician.activeTickets) / 8) * 100)
  score += (workloadScore / 100) * weights.workload

  const experienceScore = Math.min(100, (technician.completedTickets / 100) * 100)
  score += (experienceScore / 100) * weights.experience

  score += getBonusScore(technician, ticket, assignments)

  return Math.round(score * 10) / 10
}

const getPriorityScore = (technician: Technician, priority: string) => {
  const priorityWeights = {
    urgent: { rating: 4.5, experience: 30 },
    high: { rating: 4.0, experience: 20 },
    medium: { rating: 3.5, experience: 10 },
    low: { rating: 3.0, experience: 5 },
  }

  const requirement = priorityWeights[priority] || priorityWeights.medium
  let score = 0

  if (technician.rating >= requirement.rating) {
    score += 60
  } else {
    score += (technician.rating / requirement.rating) * 60
  }

  if (technician.completedTickets >= requirement.experience) {
    score += 40
  } else {
    score += (technician.completedTickets / requirement.experience) * 40
  }

  return Math.min(100, score)
}

const getBonusScore = (
  technician: Technician,
  ticket: any,
  assignments: TechnicianCategoryAssignments,
) => {
  let bonus = 0

  const responseTime =
    typeof technician.avgResponseTime === "number"
      ? technician.avgResponseTime
      : technician.avgResponseTime
      ? Number.parseFloat(String(technician.avgResponseTime))
      : null

  if (responseTime !== null && !Number.isNaN(responseTime) && responseTime < 2.0) {
    bonus += 5
  }

  if (technician.rating >= 4.8 && technician.completedTickets >= 50) {
    bonus += 8
  }

  const relatedSpecialties = getRelatedSpecialties(ticket.category)
  const matchingSpecialties = technician.specialties.filter((s) => relatedSpecialties.includes(s))
  if (matchingSpecialties.length > 1) {
    bonus += 3
  }

  if (technician.activeTickets <= 1) {
    bonus += 5
  }

  const assignment = assignments[ticket.category]
  if (assignment?.technicians?.includes(technician.id)) {
    bonus += 4
  }
  if (ticket.subcategory && assignment?.subcategories?.[ticket.subcategory]?.includes(technician.id)) {
    bonus += 6
  }

  return bonus
}

const getRelatedSpecialties = (category: string) => {
  const relations = {
    hardware: ["hardware", "network"],
    software: ["software", "access"],
    network: ["network", "hardware", "security"],
    email: ["email", "software", "security"],
    security: ["security", "network", "access"],
    access: ["access", "security", "software"],
  }
  return relations[category] || [category]
}

const getMatchReasons = (
  technician: Technician,
  ticket: any,
  assignments: TechnicianCategoryAssignments,
) => {
  const reasons = []

  if (technician.specialties.includes(ticket.category)) {
    reasons.push(`متخصص ${categoryLabels[ticket.category]}`)
  }

  if (ticket.subcategory && technician.subSpecialties?.includes(ticket.subcategory)) {
    reasons.push("مهارت دقیق زیرمسئله")
  }

  const assignment = assignments[ticket.category]
  if (assignment?.technicians?.includes(technician.id)) {
    reasons.push("در لیست رسمی این دسته")
  }
  if (ticket.subcategory && assignment?.subcategories?.[ticket.subcategory]?.includes(technician.id)) {
    reasons.push("مسئول زیر دسته")
  }

  if (technician.rating >= 4.5) {
    reasons.push("امتیاز بالا")
  }

  if (technician.activeTickets <= 2) {
    reasons.push("بار کاری کم")
  }

  if (technician.completedTickets >= 50) {
    reasons.push("تجربه بالا")
  }

  const priorityRequirements = {
    urgent: 4.5,
    high: 4.0,
    medium: 3.5,
    low: 3.0,
  }

  if (technician.rating >= priorityRequirements[ticket.priority]) {
    reasons.push(`مناسب برای اولویت ${priorityLabels[ticket.priority]}`)
  }

  return reasons
}

const statusColors = {
  open: "bg-red-100 text-red-800 border-red-200",
  "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusLabels = {
  open: "باز",
  "in-progress": "در حال انجام",
  resolved: "حل شده",
  closed: "بسته",
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  high: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-purple-100 text-purple-800 border-purple-200",
}

const priorityLabels = {
  low: "کم",
  medium: "متوسط",
  high: "بالا",
  urgent: "فوری",
}

const categoryIcons = {
  hardware: HardDrive,
  software: Software,
  network: Network,
  email: Mail,
  security: Shield,
  access: Key,
}

const categoryLabels = {
  hardware: "سخت‌افزار",
  software: "نرم‌افزار",
  network: "شبکه",
  email: "ایمیل",
  security: "امنیت",
  access: "دسترسی",
}

interface AdminTechnicianAssignmentProps {
  tickets: any[]
  onTicketUpdate: (ticketId: string, updates: any) => void
}

export function AdminTechnicianAssignment({ tickets, onTicketUpdate }: AdminTechnicianAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("unassigned")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false)
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false)
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false)
  const [pendingAutoAssignments, setPendingAutoAssignments] = useState<any[]>([])
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false)
  const [selectedTicketForCriteria, setSelectedTicketForCriteria] = useState<any>(null)
  const [manualTechnicianId, setManualTechnicianId] = useState("")
  const [bulkTechnicianId, setBulkTechnicianId] = useState("")
  const { technicians, assignments } = useTechnicians()
  const { categories } = useCategories()
  const manualTechnician = manualTechnicianId
    ? technicians.find((technician) => technician.id === manualTechnicianId)
    : undefined
  const bulkTechnician = bulkTechnicianId
    ? technicians.find((technician) => technician.id === bulkTechnicianId)
    : undefined

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unassigned" && !ticket.assignedTo) ||
      (filterStatus === "assigned" && ticket.assignedTo)

    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleAssignTicket = (ticket: any) => {
    setSelectedTicket(ticket)
    setManualTechnicianId("")
    setAssignDialogOpen(true)
  }

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets([...selectedTickets, ticketId])
    } else {
      setSelectedTickets(selectedTickets.filter((id) => id !== ticketId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id))
    } else {
      setSelectedTickets([])
    }
  }

  const handleAssignToTechnician = (technicianId: string, technicianName: string) => {
    if (selectedTicket) {
      onTicketUpdate(selectedTicket.id, {
        assignedTo: technicianId,
        assignedTechnicianName: technicianName,
        status: selectedTicket.status === "open" ? "in-progress" : selectedTicket.status,
      })

      toast({
        title: "تکنسین تعیین شد",
        description: `تیکت ${selectedTicket.id} به ${technicianName} واگذار شد`,
      })

      setAssignDialogOpen(false)
      setSelectedTicket(null)
      setManualTechnicianId("")
    }
  }

  const handleBulkAssign = (technicianId: string, technicianName: string) => {
    selectedTickets.forEach((ticketId) => {
      const ticket = tickets.find((t) => t.id === ticketId)
      onTicketUpdate(ticketId, {
        assignedTo: technicianId,
        assignedTechnicianName: technicianName,
        status: ticket?.status === "open" ? "in-progress" : ticket?.status,
      })
    })

    toast({
      title: "تکنسین تعیین شد",
      description: `${selectedTickets.length} تیکت به ${technicianName} واگذار شد`,
    })

    setBulkAssignDialogOpen(false)
    setSelectedTickets([])
    setBulkTechnicianId("")
  }

  const handleAutoAssign = (ticket: any) => {
    const recommendedTech = getAutomaticAssignment(ticket, technicians, assignments)

    if (recommendedTech) {
      onTicketUpdate(ticket.id, {
        assignedTo: recommendedTech.id,
        assignedTechnicianName: recommendedTech.name,
        status: ticket.status === "open" ? "in-progress" : ticket.status,
      })

      const reasons = recommendedTech.matchReasons?.join("، ") || "بهترین گزینه موجود"

      toast({
        title: "تکنسین به صورت خودکار تعیین شد",
        description: `تیکت ${ticket.id} به ${recommendedTech.name} واگذار شد (امتیاز: ${recommendedTech.score}) - ${reasons}`,
      })
    } else {
      toast({
        title: "خطا در تعیین خودکار",
        description: "تکنسین مناسبی برای این تیکت یافت نشد یا همه تکنسین‌ها مشغول هستند",
        variant: "destructive",
      })
    }
  }

  const handleBulkAutoAssign = () => {
    const unassignedTickets = selectedTickets
      .map((id) => filteredTickets.find((t) => t.id === id))
      .filter((ticket) => ticket && !ticket.assignedTo)

    const assignments = unassignedTickets.map((ticket) => {
      const recommendedTech = getAutomaticAssignment(ticket, technicians, assignments)
      return {
        ticket,
        technician: recommendedTech,
        success: !!recommendedTech,
      }
    })

    setPendingAutoAssignments(assignments)
    setAutoAssignDialogOpen(true)
  }

  const confirmAutoAssignments = () => {
    let successCount = 0

    pendingAutoAssignments.forEach(({ ticket, technician, success }) => {
      if (success && technician) {
        onTicketUpdate(ticket.id, {
          assignedTo: technician.id,
          assignedTechnicianName: technician.name,
          status: ticket.status === "open" ? "in-progress" : ticket.status,
        })
        successCount++
      }
    })

    toast({
      title: "تعیین خودکار تکمیل شد",
      description: `${successCount} تیکت به صورت خودکار واگذار شد`,
    })

    setAutoAssignDialogOpen(false)
    setPendingAutoAssignments([])
    setSelectedTickets([])
  }

  const getRecommendedTechnicians = (ticket: any) => {
    const preferred = getPreferredTechnicians(ticket, technicians, assignments)
    const pool = preferred.length > 0 ? preferred : technicians

    return pool
      .map((tech) => ({
        ...tech,
        score: calculateRecommendationScore(tech, ticket, assignments),
      }))
      .sort((a, b) => b.score - a.score)
  }

  const calculateRecommendationScore = (
    technician: Technician,
    ticket: any,
    assignments: TechnicianCategoryAssignments,
  ) => {
    let score = 0

    if (technician.specialties.includes(ticket.category)) {
      score += 50
    }

    if (ticket.subcategory && technician.subSpecialties?.includes(ticket.subcategory)) {
      score += 15
    }

    if (technician.status === "available") {
      score += 30
    }

    score += Math.max(0, 20 - technician.activeTickets * 5)

    score += technician.rating * 10

    const assignment = assignments[ticket.category]
    if (assignment?.technicians?.includes(technician.id)) {
      score += 12
    }
    if (ticket.subcategory && assignment?.subcategories?.[ticket.subcategory]?.includes(technician.id)) {
      score += 18
    }

    return score
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "busy":
        return <Clock className="w-3 h-3 text-yellow-500" />
      default:
        return <AlertTriangle className="w-3 h-3 text-red-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "آماده"
      case "busy":
        return "مشغول"
      default:
        return "غیرفعال"
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-right">تعیین تکنسین</CardTitle>
            <div className="flex items-center gap-3">
              {/* Auto-assign toggle */}
              <div className="flex items-center gap-2">
                <Switch checked={autoAssignEnabled} onCheckedChange={setAutoAssignEnabled} id="auto-assign" />
                <Label htmlFor="auto-assign" className="text-sm">
                  تعیین خودکار
                </Label>
              </div>

              {selectedTickets.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBulkAutoAssign} className="gap-2 bg-transparent">
                    <Zap className="w-4 h-4" />
                    تعیین خودکار ({selectedTickets.length})
                  </Button>
                  <Button onClick={() => setBulkAssignDialogOpen(true)} className="gap-2">
                    <Users className="w-4 h-4" />
                    تعیین دستی ({selectedTickets.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="جستجو در تیکت‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus} dir="rtl">
              <SelectTrigger className="text-right">
                <SelectValue placeholder="وضعیت واگذاری" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه تیکت‌ها</SelectItem>
                <SelectItem value="unassigned">واگذار نشده</SelectItem>
                <SelectItem value="assigned">واگذار شده</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority} dir="rtl">
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اولویت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه اولویت‌ها</SelectItem>
                <SelectItem value="urgent">فوری</SelectItem>
                <SelectItem value="high">بالا</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">کم</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilterStatus("unassigned")
                setFilterPriority("all")
              }}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              پاک کردن فیلترها
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedTickets.length} تیکت انتخاب شده</span>
              <Button size="sm" onClick={() => setBulkAssignDialogOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                واگذاری گروهی
              </Button>
            </div>
          )}

          {/* Tickets Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-right">شماره تیکت</TableHead>
                  <TableHead className="text-right">عنوان</TableHead>
                  <TableHead className="text-right">اولویت</TableHead>
                  <TableHead className="text-right">دسته‌بندی</TableHead>
                  <TableHead className="text-right">درخواست‌کننده</TableHead>
                  <TableHead className="text-right">تکنسین فعلی</TableHead>
                  <TableHead className="text-right">تاریخ ایجاد</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => {
                    const CategoryIcon = categoryIcons[ticket.category]
                    const isSelected = selectedTickets.includes(ticket.id)

                    return (
                      <TableRow key={ticket.id} className={isSelected ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={ticket.title}>
                            {ticket.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4" />
                            <span className="text-sm">{categoryLabels[ticket.category]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{ticket.clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{ticket.clientName}</div>
                              <div className="text-xs text-muted-foreground">{ticket.clientEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.assignedTechnicianName ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {ticket.assignedTechnicianName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{ticket.assignedTechnicianName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">تعیین نشده</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignTicket(ticket)}
                              className="gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              {ticket.assignedTo ? "تغییر تکنسین" : "تعیین دستی"}
                            </Button>
                            {!ticket.assignedTo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAutoAssign(ticket)}
                                className="gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Zap className="w-3 h-3" />
                                خودکار
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTicketForCriteria(ticket)
                                setCriteriaDialogOpen(true)
                              }}
                              className="gap-1 text-purple-600 hover:text-purple-700"
                            >
                              <Target className="w-3 h-3" />
                              تحلیل
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">تیکتی یافت نشد</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
      </CardContent>
    </Card>

      <ResponsibleTechnicianManager />
      <CategoryTechnicianAssignments categoriesData={categories} />

      {/* Assign Technician Dialog */}
      <Dialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open)
          if (!open) {
            setManualTechnicianId("")
            setSelectedTicket(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">واگذاری تیکت {selectedTicket?.id}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedTicket.title}</h4>
                <div className="flex gap-2 mb-2">
                  <Badge className={priorityColors[selectedTicket.priority]}>
                    {priorityLabels[selectedTicket.priority]}
                  </Badge>
                  <Badge variant="outline">{categoryLabels[selectedTicket.category]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">درخواست‌کننده: {selectedTicket.clientName}</p>
              </div>

              <Separator />

              {/* Recommended Technicians */}
              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  تکنسین‌های پیشنهادی
                </h4>
                <div className="grid gap-3">
                  {getRecommendedTechnicians(selectedTicket)
                    .slice(0, 3)
                    .map((technician) => (
                      <div
                        key={technician.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{technician.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{technician.name}</span>
                              {getStatusIcon(technician.status)}
                              <span className="text-xs text-muted-foreground">{getStatusLabel(technician.status)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span>{technician.rating}</span>
                              </div>
                              <span>تیکت‌های فعال: {technician.activeTickets}</span>
                              <span>تکمیل شده: {technician.completedTickets}</span>
                            </div>
                            <div className="flex gap-1 mt-1">
                              {technician.specialties.map((specialty) => {
                                const SpecialtyIcon = categoryIcons[specialty]
                                return (
                                  <div
                                    key={specialty}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                  >
                                    <SpecialtyIcon className="w-3 h-3" />
                                    <span>{categoryLabels[specialty]}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAssignToTechnician(technician.id, technician.name)}
                          className="gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          واگذاری
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              <Separator />

              {/* All Technicians */}
              <div className="space-y-3">
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  فهرست کامل تکنسین‌ها
                </h4>
                <div className="space-y-2">
                  <Select
                    value={manualTechnicianId || undefined}
                    onValueChange={(value) => setManualTechnicianId(value === "__clear__" ? "" : value)}
                    dir="rtl"
                  >
                    <SelectTrigger className="justify-between text-right">
                      <SelectValue placeholder="انتخاب از فهرست اسکرولی تکنسین‌ها" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 overflow-y-auto" dir="rtl">
                      <SelectItem value="__clear__">حذف انتخاب</SelectItem>
                      {technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.id} className="text-right">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">{technician.name}</span>
                              <span className="text-xs text-muted-foreground">{technician.email}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              امتیاز {technician.rating.toFixed(1)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {manualTechnician && (
                    <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{manualTechnician.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <p className="text-sm font-medium">{manualTechnician.name}</p>
                          <p className="text-xs text-muted-foreground">
                            تخصص‌ها: {manualTechnician.specialties.join("، ")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        وضعیت: {getStatusLabel(manualTechnician.status)}
                      </Badge>
                    </div>
                  )}

                  <Button
                    disabled={!manualTechnician}
                    onClick={() =>
                      manualTechnician &&
                      handleAssignToTechnician(manualTechnician.id, manualTechnician.name)
                    }
                    className="w-full gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    تایید واگذاری
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog
        open={bulkAssignDialogOpen}
        onOpenChange={(open) => {
          setBulkAssignDialogOpen(open)
          if (!open) {
            setBulkTechnicianId("")
          }
        }}
      >
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">واگذاری گروهی ({selectedTickets.length} تیکت)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">انتخاب تکنسین</h4>
              <div className="space-y-3">
                <Select
                  value={bulkTechnicianId || undefined}
                  onValueChange={(value) => setBulkTechnicianId(value === "__clear__" ? "" : value)}
                  dir="rtl"
                >
                  <SelectTrigger className="justify-between text-right">
                    <SelectValue placeholder="انتخاب تکنسین از فهرست اسکرولی" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto" dir="rtl">
                    <SelectItem value="__clear__">حذف انتخاب</SelectItem>
                    {technicians.map((technician) => (
                      <SelectItem key={technician.id} value={technician.id} className="text-right">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{technician.name}</span>
                            <span className="text-xs text-muted-foreground">{technician.email}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            تیکت‌های فعال: {technician.activeTickets}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {bulkTechnician && (
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{bulkTechnician.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <p className="text-sm font-medium">{bulkTechnician.name}</p>
                          {bulkTechnician.specialties?.[0] && (
                            <p className="text-xs text-muted-foreground">
                              تخصص اصلی: {bulkTechnician.specialties[0]}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          امتیاز {bulkTechnician.rating.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          وضعیت: {getStatusLabel(bulkTechnician.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  disabled={!bulkTechnician}
                  onClick={() =>
                    bulkTechnician && handleBulkAssign(bulkTechnician.id, bulkTechnician.name)
                  }
                  className="w-full gap-2"
                >
                  <Users className="w-4 h-4" />
                  واگذاری تیکت‌های انتخاب شده
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto Assignment Confirmation Dialog */}
      <Dialog open={autoAssignDialogOpen} onOpenChange={setAutoAssignDialogOpen}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تأیید تعیین خودکار تکنسین</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">پیش‌نمایش تعیین خودکار</h4>
              </div>
              <p className="text-sm text-blue-700">
                سیستم بر اساس تخصص، امتیاز، و بار کاری تکنسین‌ها، بهترین گزینه را انتخاب کرده است.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingAutoAssignments.map(({ ticket, technician, success }, index) => (
                <div
                  key={ticket.id}
                  className={`p-4 border rounded-lg ${success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{ticket.title}</span>
                        <Badge className={priorityColors[ticket.priority]} variant="outline">
                          {priorityLabels[ticket.priority]}
                        </Badge>
                        <Badge variant="outline">{categoryLabels[ticket.category]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">درخواست‌کننده: {ticket.clientName}</p>
                    </div>

                    <div className="text-left">
                      {success && technician ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">{technician.name}</p>
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Star className="w-3 h-3" />
                              <span>{technician.rating}</span>
                              <span>• {technician.activeTickets} فعال</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">تکنسین مناسب یافت نشد</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {pendingAutoAssignments.filter((a) => a.success).length} از {pendingAutoAssignments.length} تیکت قابل
                واگذاری
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAutoAssignDialogOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={confirmAutoAssignments}
                  disabled={pendingAutoAssignments.filter((a) => a.success).length === 0}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  تأیید و اجرا
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Criteria Dialog */}
      <AssignmentCriteriaDialog
        open={criteriaDialogOpen}
        onOpenChange={setCriteriaDialogOpen}
        ticket={selectedTicketForCriteria}
        technicians={technicians}
        onAssign={(technicianId) => {
          const technician = technicians.find((t) => t.id === technicianId)
          if (technician && selectedTicketForCriteria) {
            onTicketUpdate(selectedTicketForCriteria.id, {
              assignedTo: technicianId,
              assignedTechnicianName: technician.name,
              status: selectedTicketForCriteria.status === "open" ? "in-progress" : selectedTicketForCriteria.status,
            })

            toast({
              title: "تکنسین تعیین شد",
              description: `تیکت ${selectedTicketForCriteria.id} به ${technician.name} واگذار شد`,
            })
          }
        }}
      />
    </div>
  )
}
