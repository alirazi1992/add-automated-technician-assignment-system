"use client";

import { useCallback, useMemo, useState } from "react";
import { Shield, Crown, Plus, ShieldPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

import { useTechnicians } from "@/services/useTechnicians";
import type { AccessLevel } from "@/services/technician-types";
import { defaultResponsiblePermissionOptions } from "@/data/responsible-role-definitions";

const iconMap: Record<string, typeof Shield> = {
  crown: Crown,
  shield: Shield,
};

const DEFAULT_SELECTED_PERMISSION_IDS = [
  "manage-tickets",
  "assign-technicians",
];

export function ResponsibleTechnicianManager() {
  const {
    technicians,
    responsibleAssignments,
    assignResponsibleTechnician,
    setResponsiblePermissions,
    responsibleRoleDefinitions,
    addResponsibleRole,
    responsibleAssignmentLockStates,
    submitResponsibleAssignment,
    unlockResponsibleAssignment,
  } = useTechnicians();
  const { toast } = useToast();

  const sortedTechnicians = useMemo(
    () =>
      [...technicians].sort((a, b) => {
        const roleWeight = (role?: string) =>
          role === "responsible" ? -1 : role === "admin" ? -2 : 0;
        const weightDiff = roleWeight(a.role) - roleWeight(b.role);
        if (weightDiff !== 0) return weightDiff;
        return a.name.localeCompare(b.name, "fa");
      }),
    [technicians]
  );

  const sortedRoles = useMemo(
    () =>
      Object.values(responsibleRoleDefinitions).sort((a, b) => {
        if (a.createdAt === b.createdAt) {
          return a.title.localeCompare(b.title, "fa");
        }
        return a.createdAt - b.createdAt;
      }),
    [responsibleRoleDefinitions]
  );

  const handlePermissionToggle = useCallback(
    (roleId: string, permissionId: string, checked: boolean) => {
      if (responsibleAssignmentLockStates[roleId]?.locked) return;
      const current = new Set(
        responsibleAssignments[roleId]?.permissions || []
      );
      if (checked) {
        current.add(permissionId);
      } else {
        current.delete(permissionId);
      }
      setResponsiblePermissions(roleId, Array.from(current));
    },
    [
      responsibleAssignments,
      responsibleAssignmentLockStates,
      setResponsiblePermissions,
    ]
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleAccessLevel, setNewRoleAccessLevel] =
    useState<AccessLevel>("partial");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    DEFAULT_SELECTED_PERMISSION_IDS
  );
  const [formError, setFormError] = useState<string | null>(null);

  const resetDialogState = useCallback(() => {
    setNewRoleTitle("");
    setNewRoleDescription("");
    setNewRoleAccessLevel("partial");
    setSelectedPermissionIds(DEFAULT_SELECTED_PERMISSION_IDS);
    setFormError(null);
  }, []);

  const togglePermissionSelection = useCallback(
    (permissionId: string, checked: boolean) => {
      setSelectedPermissionIds((prev) => {
        if (checked) {
          if (prev.includes(permissionId)) return prev;
          return [...prev, permissionId];
        }
        return prev.filter((id) => id !== permissionId);
      });
    },
    []
  );

  const handleCreateRole = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const title = newRoleTitle.trim();
      if (!title) {
        setFormError("لطفاً عنوان نقش را مشخص کنید.");
        return;
      }

      const permissionOptions = defaultResponsiblePermissionOptions.filter(
        (option) => selectedPermissionIds.includes(option.id)
      );

      if (permissionOptions.length === 0) {
        setFormError("حداقل یک مجوز باید برای نقش جدید انتخاب شود.");
        return;
      }

      const timestamp = Date.now();
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const roleId = `custom-${slug || "role"}-${timestamp}`;

      addResponsibleRole(
        {
          id: roleId,
          title,
          description: newRoleDescription.trim() || undefined,
          accessLevel: newRoleAccessLevel,
          permissionOptions,
          createdAt: timestamp,
        },
        permissionOptions.map((option) => option.id)
      );

      toast({
        title: "نقش تکنسین مسئول ایجاد شد",
        description: `نقش «${title}» با موفقیت اضافه شد و اکنون قابل انتخاب است.`,
      });

      setIsDialogOpen(false);
    },
    [
      addResponsibleRole,
      newRoleAccessLevel,
      newRoleDescription,
      newRoleTitle,
      selectedPermissionIds,
      toast,
    ]
  );

  const handleSubmitAssignments = useCallback(
    (roleId: string, roleTitle: string) => {
      if (responsibleAssignmentLockStates[roleId]?.locked) return;
      submitResponsibleAssignment(roleId);
      toast({
        title: "انتصاب ثبت شد",
        description: `پیکربندی نقش «${roleTitle}» قفل شد و برای بازبینی ارسال گردید.`,
      });
    },
    [responsibleAssignmentLockStates, submitResponsibleAssignment, toast]
  );

  const handleUnlockAssignments = useCallback(
    (roleId: string, roleTitle: string) => {
      if (!responsibleAssignmentLockStates[roleId]?.locked) return;
      unlockResponsibleAssignment(roleId);
      toast({
        title: "امکان ویرایش فعال شد",
        description: `اکنون می‌توانید تنظیمات نقش «${roleTitle}» را ویرایش کنید.`,
      });
    },
    [responsibleAssignmentLockStates, toast, unlockResponsibleAssignment]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 text-right sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <Shield className="h-5 w-5" />
              تعیین تکنسین‌های مسئول
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              حداکثر دو تکنسین با نقش «تکنسین مسئول» می‌توانند بر اساس صلاحدید
              مدیر سیستم انتخاب شوند.
            </p>
            <p className="text-xs text-muted-foreground">
              برای هر نقش می‌توانید پس از تأیید، فهرست را ثبت کنید و در صورت
              نیاز دوباره روی ویرایش بزنید.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetDialogState();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-end whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  تعریف نقش جدید تکنسین مسئول
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle>افزودن تکنسین مسئول جدید</DialogTitle>
                  <DialogDescription>
                    عنوان نقش، سطح دسترسی و فهرست مجوزهای در دسترس را مشخص کنید
                    تا در لیست تکنسین‌های مسئول ظاهر شود.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateRole}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="responsible-role-title"
                      className="text-right"
                    >
                      عنوان نقش
                    </Label>
                    <Input
                      id="responsible-role-title"
                      value={newRoleTitle}
                      onChange={(event) => {
                        setNewRoleTitle(event.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="مثلاً تکنسین مسئول زیرساخت"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="responsible-role-description"
                      className="text-right"
                    >
                      توضیحات نقش (اختیاری)
                    </Label>
                    <Textarea
                      id="responsible-role-description"
                      value={newRoleDescription}
                      onChange={(event) => {
                        setNewRoleDescription(event.target.value);
                        if (formError) setFormError(null);
                      }}
                      rows={3}
                      placeholder="شرح کوتاهی از مسئولیت‌ها و حوزه کاری این نقش"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right">سطح دسترسی</Label>
                    <RadioGroup
                      dir="rtl"
                      value={newRoleAccessLevel}
                      onValueChange={(value) => {
                        setNewRoleAccessLevel(value as AccessLevel);
                        if (formError) setFormError(null);
                      }}
                      className="gap-3"
                    >
                      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="text-right">
                          <Label
                            htmlFor="responsible-access-full"
                            className="text-sm font-medium"
                          >
                            سطح دسترسی کامل
                          </Label>
                          <p className="mt-1 text-xs text-muted-foreground">
                            دسترسی کامل به تنظیمات سامانه، مدیریت تیم‌ها و
                            گزارش‌های تحلیلی
                          </p>
                        </div>
                        <RadioGroupItem
                          value="full"
                          id="responsible-access-full"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="text-right">
                          <Label
                            htmlFor="responsible-access-partial"
                            className="text-sm font-medium"
                          >
                            سطح دسترسی محدود
                          </Label>
                          <p className="mt-1 text-xs text-muted-foreground">
                            دسترسی کنترلی برای هماهنگی و مدیریت حوزه‌های مشخص
                            شده
                          </p>
                        </div>
                        <RadioGroupItem
                          value="partial"
                          id="responsible-access-partial"
                        />
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right">مجوزها و دسترسی‌ها</Label>
                    <div className="rounded-lg border p-3">
                      <ScrollArea className="max-h-52 overflow-y-auto pr-2">
                        <div className="grid gap-2">
                          {defaultResponsiblePermissionOptions.map(
                            (permission) => (
                              <label
                                key={`base-${permission.id}`}
                                className="flex cursor-pointer items-center justify-between rounded-md border p-2"
                              >
                                <span className="text-sm">
                                  {permission.label}
                                </span>
                                <Checkbox
                                  checked={selectedPermissionIds.includes(
                                    permission.id
                                  )}
                                  onCheckedChange={(checked) =>
                                    togglePermissionSelection(
                                      permission.id,
                                      checked === true
                                    )
                                  }
                                />
                              </label>
                            )
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                  <DialogFooter className="flex-row-reverse justify-start gap-2 sm:flex-row-reverse sm:justify-start">
                    <Button type="submit" className="px-6">
                      ایجاد نقش
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">
                        انصراف
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {sortedRoles.map((definition) => {
            const assignment = responsibleAssignments[definition.id] || {
              technicianId: null,
              accessLevel: definition.accessLevel,
              permissions: definition.permissionOptions.map(
                (option) => option.id
              ),
            };
            const selectedTechnician = sortedTechnicians.find(
              (technician) => technician.id === assignment.technicianId
            );
            const RoleIcon = definition.icon
              ? iconMap[definition.icon] ?? ShieldPlus
              : ShieldPlus;
            const accessLabel =
              assignment.accessLevel === "full"
                ? "سطح دسترسی کامل"
                : "سطح دسترسی محدود";
            const lockState = responsibleAssignmentLockStates[
              definition.id
            ] || { locked: false };
            const isLocked = lockState.locked;

            return (
              <div
                key={definition.id}
                className="space-y-4 rounded-lg border p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-right">
                      <RoleIcon className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {definition.title}
                      </h3>
                    </div>
                    {definition.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {definition.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      assignment.accessLevel === "full"
                        ? "secondary"
                        : "outline"
                    }
                    className="whitespace-nowrap"
                  >
                    {accessLabel}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-right">انتخاب تکنسین</Label>
                  <Select
                    value={assignment.technicianId ?? "none"}
                    disabled={isLocked}
                    onValueChange={(value) =>
                      assignResponsibleTechnician(
                        definition.id,
                        value === "none" ? null : value
                      )
                    }
                    dir="rtl"
                  >
                    <SelectTrigger className="justify-between text-right">
                      <SelectValue placeholder="انتخاب تکنسین مسئول" />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-72 overflow-y-auto"
                      dir="rtl"
                    >
                      <SelectItem value="none">بدون انتصاب</SelectItem>
                      {sortedTechnicians.map((technician) => (
                        <SelectItem
                          key={technician.id}
                          value={technician.id}
                          className="text-right"
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-medium">
                              {technician.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {technician.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTechnician && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {selectedTechnician.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <p className="font-medium">{selectedTechnician.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTechnician.specialties.join("، ")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      امتیاز {selectedTechnician.rating.toFixed(2)}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-right">مجوزها و دسترسی‌ها</Label>
                  <ScrollArea className="max-h-48 overflow-y-auto rounded-lg border">
                    <div className="grid gap-2 p-2">
                      {definition.permissionOptions.map((permission) => (
                        <label
                          key={`${definition.id}-${permission.id}`}
                          className="flex cursor-pointer items-center justify-between rounded-md border p-2"
                        >
                          <span className="text-sm">{permission.label}</span>
                          <Checkbox
                            checked={assignment.permissions.includes(
                              permission.id
                            )}
                            disabled={isLocked}
                            onCheckedChange={(checked) =>
                              handlePermissionToggle(
                                definition.id,
                                permission.id,
                                checked === true
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                {isLocked && (
                  <div className="rounded-md border border-dashed bg-muted/40 p-3 text-xs text-primary">
                    <p>این نقش ثبت شده و در حالت قفل قرار دارد.</p>
                    {lockState.submittedAt && (
                      <p className="mt-1 text-muted-foreground">
                        زمان ثبت:{" "}
                        {new Date(lockState.submittedAt).toLocaleString(
                          "fa-IR"
                        )}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-col items-end gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  {!isLocked && lockState.submittedAt && (
                    <span className="text-xs text-muted-foreground">
                      آخرین ثبت:{" "}
                      {new Date(lockState.submittedAt).toLocaleString("fa-IR")}
                    </span>
                  )}
                  {isLocked ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() =>
                        handleUnlockAssignments(definition.id, definition.title)
                      }
                    >
                      ویرایش تنظیمات نقش
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() =>
                        handleSubmitAssignments(definition.id, definition.title)
                      }
                    >
                      ثبت نقش مسئول
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
