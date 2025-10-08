"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  FolderPlus,
  Settings,
  AlertTriangle,
} from "lucide-react";
import type { FormFieldDef, FieldType } from "@/lib/dynamic-forms";
import { parseOptions } from "@/lib/dynamic-forms";

interface CategoryManagementProps {
  categoriesData: any;
  onCategoryUpdate: (updatedCategories: any) => void;
}

export function CategoryManagement({
  categoriesData,
  onCategoryUpdate,
}: CategoryManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    id: "",
    label: "",
    description: "",
  });
  const [newSubCategoryData, setNewSubCategoryData] = useState({
    id: "",
    label: "",
    description: "",
  });

  // Field designer state
  const [fieldDesignerOpen, setFieldDesignerOpen] = useState(false);
  const [designingSubId, setDesigningSubId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<FormFieldDef[]>([]);
  const [newField, setNewField] = useState<{
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    optionsText?: string;
  }>({
    id: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    optionsText: "",
  });

  const handleCreateCategory = () => {
    if (!newCategoryData.id || !newCategoryData.label) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای ضروری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    if (categoriesData[newCategoryData.id]) {
      toast({
        title: "خطا",
        description: "دسته‌بندی با این شناسه قبلاً وجود دارد",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = {
      ...categoriesData,
      [newCategoryData.id]: {
        ...newCategoryData,
        subIssues: {},
      },
    };

    onCategoryUpdate(updatedCategories);
    setCategoryDialogOpen(false);
    setNewCategoryData({ id: "", label: "", description: "" });
    toast({
      title: "موفق",
      description: "دسته‌بندی جدید ایجاد شد",
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.label) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای ضروری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    const originalId = editingCategory.originalId || editingCategory.id;
    const newId = editingCategory.id;

    // Prevent duplicate id on rename
    if (newId !== originalId && categoriesData[newId]) {
      toast({
        title: "خطا",
        description: "شناسه جدید تکراری است",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories: any = { ...categoriesData };
    const current = updatedCategories[originalId];
    if (!current) {
      toast({
        title: "خطا",
        description: "دسته‌بندی پیدا نشد",
        variant: "destructive",
      });
      return;
    }

    // Build updated payload
    const updatedCategory = {
      ...current,
      id: newId,
      label: editingCategory.label,
      description: editingCategory.description,
    };

    if (newId !== originalId) {
      delete updatedCategories[originalId];
      updatedCategories[newId] = updatedCategory;
      if (selectedCategory === originalId) setSelectedCategory(newId);
    } else {
      updatedCategories[newId] = updatedCategory;
    }

    onCategoryUpdate(updatedCategories);
    setEditingCategory(null);
    toast({ title: "موفق", description: "دسته‌بندی به‌روزرسانی شد" });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = { ...categoriesData };
    delete updatedCategories[categoryId];

    onCategoryUpdate(updatedCategories);
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    }
    toast({
      title: "موفق",
      description: "دسته‌بندی حذف شد",
    });
  };

  const handleCreateSubCategory = () => {
    if (
      !selectedCategory ||
      !newSubCategoryData.id ||
      !newSubCategoryData.label
    ) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای ضروری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    if (categoriesData[selectedCategory].subIssues[newSubCategoryData.id]) {
      toast({
        title: "خطا",
        description: "زیر دسته با این شناسه قبلاً وجود دارد",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = {
      ...categoriesData,
      [selectedCategory]: {
        ...categoriesData[selectedCategory],
        subIssues: {
          ...categoriesData[selectedCategory].subIssues,
          [newSubCategoryData.id]: newSubCategoryData,
        },
      },
    };

    onCategoryUpdate(updatedCategories);
    setSubCategoryDialogOpen(false);
    setNewSubCategoryData({ id: "", label: "", description: "" });
    toast({
      title: "موفق",
      description: "زیر دسته جدید ایجاد شد",
    });
  };

  const handleUpdateSubCategory = () => {
    if (!selectedCategory || !editingSubCategory || !editingSubCategory.label) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای ضروری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories: any = { ...categoriesData };
    const subIssues = {
      ...(updatedCategories[selectedCategory]?.subIssues || {}),
    };
    const originalId = editingSubCategory.originalId || editingSubCategory.id;
    const newId = editingSubCategory.id;

    if (newId !== originalId && subIssues[newId]) {
      toast({
        title: "خطا",
        description: "شناسه زیر دسته تکراری است",
        variant: "destructive",
      });
      return;
    }

    const current = subIssues[originalId];
    if (!current) {
      toast({
        title: "خطا",
        description: "زیر دسته پیدا نشد",
        variant: "destructive",
      });
      return;
    }

    const updatedSub = {
      ...current,
      id: newId,
      label: editingSubCategory.label,
      description: editingSubCategory.description,
    };

    if (newId !== originalId) {
      delete subIssues[originalId];
      subIssues[newId] = updatedSub;
    } else {
      subIssues[newId] = updatedSub;
    }

    updatedCategories[selectedCategory] = {
      ...updatedCategories[selectedCategory],
      subIssues,
    };

    onCategoryUpdate(updatedCategories);
    setEditingSubCategory(null);
    toast({ title: "موفق", description: "زیر دسته به‌روزرسانی شد" });
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    if (!selectedCategory) return;

    const updatedCategories = {
      ...categoriesData,
      [selectedCategory]: {
        ...categoriesData[selectedCategory],
        subIssues: {
          ...categoriesData[selectedCategory].subIssues,
        },
      },
    };

    delete updatedCategories[selectedCategory].subIssues[subCategoryId];

    onCategoryUpdate(updatedCategories);
    toast({
      title: "موفق",
      description: "زیر دسته حذف شد",
    });
  };

  // Dynamic Field Designer handlers
  const openFieldDesigner = (subId: string) => {
    if (!selectedCategory) return;
    setDesigningSubId(subId);
    const current =
      categoriesData[selectedCategory]?.subIssues?.[subId]?.fields || [];
    setEditingFields(current);
    setFieldDesignerOpen(true);
  };

  const saveFieldDesigner = () => {
    if (!selectedCategory || !designingSubId) return;
    const updatedCategories = {
      ...categoriesData,
      [selectedCategory]: {
        ...categoriesData[selectedCategory],
        subIssues: {
          ...categoriesData[selectedCategory].subIssues,
          [designingSubId]: {
            ...categoriesData[selectedCategory].subIssues[designingSubId],
            fields: editingFields,
          },
        },
      },
    };
    onCategoryUpdate(updatedCategories);
    setFieldDesignerOpen(false);
    setDesigningSubId(null);
    toast({ title: "موفق", description: "فیلدها ذخیره شد" });
  };

  const addNewField = () => {
    if (!newField.id || !newField.label) {
      toast({
        title: "خطا",
        description: "شناسه و عنوان فیلد الزامی است",
        variant: "destructive",
      });
      return;
    }
    if (editingFields.some((f) => f.id === newField.id)) {
      toast({
        title: "خطا",
        description: "شناسه فیلد تکراری است",
        variant: "destructive",
      });
      return;
    }
    const options =
      newField.type === "select" || newField.type === "radio"
        ? parseOptions(newField.optionsText || "")
        : [];
    const toAdd: FormFieldDef = {
      id: newField.id,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder,
      options,
    };
    setEditingFields((prev) => [...prev, toAdd]);
    setNewField({
      id: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      optionsText: "",
    });
    toast({ title: "موفق", description: "فیلد اضافه شد" });
  };

  const updateField = (
    index: number,
    patch: Partial<FormFieldDef> & { optionsText?: string }
  ) => {
    setEditingFields((prev) => {
      const copy = [...prev];
      const existing = copy[index];
      let options = existing.options;
      if (patch.optionsText !== undefined) {
        options = parseOptions(patch.optionsText);
      }
      copy[index] = { ...existing, ...patch, options };
      return copy;
    });
  };

  const removeField = (index: number) => {
    setEditingFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Default fields preview for built-in forms
  const getDefaultFieldDefs = (
    catId: string,
    subId?: string
  ): FormFieldDef[] => {
    switch (catId) {
      case "hardware": {
        if (subId === "computer-not-working") {
          return [
            {
              id: "deviceBrand",
              label: "برند دستگاه",
              type: "select",
              required: false,
              options: [],
            },
            {
              id: "deviceModel",
              label: "مدل دستگاه",
              type: "text",
              required: false,
            },
            {
              id: "powerStatus",
              label: "وضعیت روشن شدن",
              type: "select",
              required: false,
              options: [],
            },
          ];
        }
        return [
          {
            id: "deviceType",
            label: "نوع دستگاه",
            type: "select",
            required: true,
            options: [],
          },
          {
            id: "deviceModel",
            label: "مدل دستگاه",
            type: "text",
            required: true,
          },
          {
            id: "serialNumber",
            label: "سریال نامبر",
            type: "text",
            required: false,
          },
          {
            id: "warrantyStatus",
            label: "وضعیت گارانتی",
            type: "select",
            required: true,
            options: [],
          },
        ];
      }
      case "software": {
        if (subId === "os-issues") {
          return [
            {
              id: "operatingSystem",
              label: "سیستم‌عامل",
              type: "select",
              required: false,
              options: [],
            },
            {
              id: "version",
              label: "نسخه/بیلد",
              type: "text",
              required: false,
            },
          ];
        }
        return [
          {
            id: "softwareName",
            label: "نام نرم‌افزار",
            type: "text",
            required: true,
          },
          { id: "version", label: "نسخه", type: "text", required: false },
          {
            id: "licenseInfo",
            label: "اطلاعات لایسنس",
            type: "textarea",
            required: false,
          },
        ];
      }
      case "network": {
        if (subId === "internet-connection") {
          return [
            {
              id: "internetAccess",
              label: "دسترسی اینترنت",
              type: "select",
              required: false,
              options: [],
            },
            {
              id: "affectedServices",
              label: "سرویس‌های متاثر",
              type: "textarea",
              required: true,
            },
          ];
        }
        return [
          {
            id: "connectionType",
            label: "نوع اتصال",
            type: "select",
            required: true,
            options: [],
          },
          {
            id: "networkLocation",
            label: "محل شبکه/اتاق",
            type: "text",
            required: true,
          },
          { id: "ipAddress", label: "آدرس IP", type: "text", required: false },
        ];
      }
      case "email": {
        return [
          {
            id: "emailProvider",
            label: "سرویس‌دهنده ایمیل",
            type: "select",
            required: true,
            options: [],
          },
          {
            id: "emailClient",
            label: "کلاینت ایمیل",
            type: "select",
            required: false,
            options: [],
          },
        ];
      }
      case "security": {
        return [
          {
            id: "incidentType",
            label: "نوع رویداد امنیتی",
            type: "select",
            required: true,
            options: [],
          },
          {
            id: "affectedSystems",
            label: "سامانه‌های متاثر",
            type: "textarea",
            required: false,
          },
        ];
      }
      case "access": {
        return [
          { id: "system", label: "سامانه/سیستم", type: "text", required: true },
          {
            id: "requestedAccess",
            label: "دسترسی درخواستی",
            type: "textarea",
            required: true,
          },
        ];
      }
      case "training": {
        return [
          { id: "topic", label: "موضوع", type: "text", required: true },
          {
            id: "preferredTime",
            label: "زمان پیشنهادی",
            type: "datetime",
            required: false,
          },
        ];
      }
      case "maintenance": {
        return [
          { id: "asset", label: "دارایی/تجهیز", type: "text", required: true },
          {
            id: "maintenanceType",
            label: "نوع نگهداشت",
            type: "select",
            required: false,
            options: [],
          },
        ];
      }
      default:
        return [];
    }
  };

  const defaultPreview =
    selectedCategory && designingSubId
      ? getDefaultFieldDefs(selectedCategory, designingSubId)
      : [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h3 className="text-xl font-bold font-iran">مدیریت دسته‌بندی‌ها</h3>
          <p className="text-muted-foreground font-iran">
            مدیریت دسته‌بندی‌ها و زیر دسته‌های تیکت‌ها
          </p>
        </div>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-iran">
              <Plus className="w-4 h-4" />
              دسته‌بندی جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md font-iran" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-iran">
                ایجاد دسته‌بندی جدید
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-right font-iran">
                  شناسه دسته‌بندی *
                </Label>
                <Input
                  id="categoryId"
                  placeholder="مثال: hardware"
                  value={newCategoryData.id}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      id: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryLabel" className="text-right font-iran">
                  نام دسته‌بندی *
                </Label>
                <Input
                  id="categoryLabel"
                  placeholder="مثال: مشکلات سخت‌افزاری"
                  value={newCategoryData.label}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      label: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="categoryDescription"
                  className="text-right font-iran"
                >
                  توضیحات
                </Label>
                <Textarea
                  id="categoryDescription"
                  placeholder="توضیحات دسته‌بندی..."
                  value={newCategoryData.description}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      description: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCategoryDialogOpen(false)}
                  className="font-iran"
                >
                  انصراف
                </Button>
                <Button onClick={handleCreateCategory} className="font-iran">
                  ایجاد
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right font-iran">
              دسته‌بندی‌های اصلی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(categoriesData).map(
                ([key, category]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === key
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-right flex-1">
                        <h4 className="font-medium font-iran">
                          {category.label}
                        </h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1 font-iran">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="text-xs font-iran"
                          >
                            {Object.keys(category.subIssues || {}).length} زیر
                            دسته
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory({
                              ...category,
                              id: key,
                              originalId: key,
                            });
                          }}
                          className="font-iran"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")
                            ) {
                              handleDeleteCategory(key);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-iran"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sub Categories */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-right font-iran">
                {selectedCategory
                  ? `زیر دسته‌های ${categoriesData[selectedCategory]?.label}`
                  : "زیر دسته‌ها"}
              </CardTitle>
              {selectedCategory && (
                <Dialog
                  open={subCategoryDialogOpen}
                  onOpenChange={setSubCategoryDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 font-iran">
                      <FolderPlus className="w-4 h-4" />
                      زیر دسته جدید
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md font-iran" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-right font-iran">
                        ایجاد زیر دسته جدید
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="subCategoryId"
                          className="text-right font-iran"
                        >
                          شناسه زیر دسته *
                        </Label>
                        <Input
                          id="subCategoryId"
                          placeholder="مثال: computer-not-working"
                          value={newSubCategoryData.id}
                          onChange={(e) =>
                            setNewSubCategoryData({
                              ...newSubCategoryData,
                              id: e.target.value,
                            })
                          }
                          className="text-right font-iran"
                          dir="rtl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="subCategoryLabel"
                          className="text-right font-iran"
                        >
                          نام زیر دسته *
                        </Label>
                        <Input
                          id="subCategoryLabel"
                          placeholder="مثال: رایانه کار نمی‌کند"
                          value={newSubCategoryData.label}
                          onChange={(e) =>
                            setNewSubCategoryData({
                              ...newSubCategoryData,
                              label: e.target.value,
                            })
                          }
                          className="text-right font-iran"
                          dir="rtl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="subCategoryDescription"
                          className="text-right font-iran"
                        >
                          توضیحات
                        </Label>
                        <Textarea
                          id="subCategoryDescription"
                          placeholder="توضیحات زیر دسته..."
                          value={newSubCategoryData.description}
                          onChange={(e) =>
                            setNewSubCategoryData({
                              ...newSubCategoryData,
                              description: e.target.value,
                            })
                          }
                          className="text-right font-iran"
                          dir="rtl"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSubCategoryDialogOpen(false)}
                          className="font-iran"
                        >
                          انصراف
                        </Button>
                        <Button
                          onClick={handleCreateSubCategory}
                          className="font-iran"
                        >
                          ایجاد
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <div className="space-y-2">
                {Object.entries(
                  categoriesData[selectedCategory]?.subIssues || {}
                ).map(([key, subCategory]: [string, any]) => (
                  <div key={key} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="text-right flex-1">
                        <h5 className="font-medium font-iran">
                          {subCategory.label}
                        </h5>
                        {subCategory.description && (
                          <p className="text-sm text-muted-foreground mt-1 font-iran">
                            {subCategory.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {/* Built-in/default form usage indicator */}
                          <Badge
                            variant="outline"
                            className="text-xs font-iran"
                          >
                            {!Array.isArray(subCategory.fields) ||
                            subCategory.fields.length === 0
                              ? "فرم پیش‌فرض: فعال"
                              : "فرم پیش‌فرض: غیرفعال"}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs font-iran"
                          >
                            {Array.isArray(subCategory.fields)
                              ? subCategory.fields.length
                              : 0}{" "}
                            فیلد سفارشی
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditingSubCategory({
                              ...subCategory,
                              id: key,
                              originalId: key,
                            })
                          }
                          className="font-iran"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openFieldDesigner(key)}
                          className="font-iran"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm("آیا از حذف این زیر دسته اطمینان دارید؟")
                            ) {
                              handleDeleteSubCategory(key);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-iran"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(categoriesData[selectedCategory]?.subIssues || {})
                  .length === 0 && (
                  <div className="text-center py-8">
                    <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-iran">
                      هیچ زیر دسته‌ای وجود ندارد
                    </p>
                    <p className="text-sm text-muted-foreground font-iran">
                      برای شروع یک زیر دسته جدید ایجاد کنید
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-iran">
                  دسته‌بندی انتخاب کنید
                </p>
                <p className="text-sm text-muted-foreground font-iran">
                  برای مشاهده زیر دسته‌ها، یک دسته‌بندی انتخاب کنید
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        >
          <DialogContent className="max-w-md font-iran" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-iran">
                ویرایش دسته‌بندی
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right font-iran">شناسه دسته‌بندی</Label>
                <Input
                  value={editingCategory.id}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      id: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="editCategoryLabel"
                  className="text-right font-iran"
                >
                  نام دسته‌بندی *
                </Label>
                <Input
                  id="editCategoryLabel"
                  value={editingCategory.label}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      label: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="editCategoryDescription"
                  className="text-right font-iran"
                >
                  توضیحات
                </Label>
                <Textarea
                  id="editCategoryDescription"
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  className="font-iran"
                >
                  انصراف
                </Button>
                <Button onClick={handleUpdateCategory} className="font-iran">
                  به‌روزرسانی
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {}
      {editingSubCategory && (
        <Dialog
          open={!!editingSubCategory}
          onOpenChange={() => setEditingSubCategory(null)}
        >
          <DialogContent className="max-w-md font-iran" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-iran">
                ویرایش زیر دسته
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right font-iran">شناسه زیر دسته</Label>
                <Input
                  value={editingSubCategory.id}
                  onChange={(e) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      id: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="editSubCategoryLabel"
                  className="text-right font-iran"
                >
                  نام زیر دسته *
                </Label>
                <Input
                  id="editSubCategoryLabel"
                  value={editingSubCategory.label}
                  onChange={(e) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      label: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="editSubCategoryDescription"
                  className="text-right font-iran"
                >
                  توضیحات
                </Label>
                <Textarea
                  id="editSubCategoryDescription"
                  value={editingSubCategory.description}
                  onChange={(e) =>
                    setEditingSubCategory({
                      ...editingSubCategory,
                      description: e.target.value,
                    })
                  }
                  className="text-right font-iran"
                  dir="rtl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingSubCategory(null)}
                  className="font-iran"
                >
                  انصراف
                </Button>
                <Button onClick={handleUpdateSubCategory} className="font-iran">
                  به‌روزرسانی
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Field Designer Dialog */}
      <Dialog open={fieldDesignerOpen} onOpenChange={setFieldDesignerOpen}>
        <DialogContent
          className="max-w-3xl font-iran"
          dir="rtl"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-right font-iran">
              طراحی فیلدهای سفارشی
            </DialogTitle>
          </DialogHeader>
          {editingFields.length === 0 && (
            <div className="mb-2 border rounded-md p-3">
              <p className="text-sm text-muted-foreground mb-2 text-right">
                این زیرمسئله از فرم پیش‌فرض استفاده می‌کند. فیلدهای پیش‌فرض
                (نمایشی):
              </p>
              {defaultPreview.length > 0 ? (
                <>
                <div className="grid grid-cols-12 gap-2">
                  {defaultPreview.map((f) => (
                    <div
                      key={f.id}
                      className="col-span-12 md:col-span-6 border rounded px-2 py-1 text-right"
                    >
                      <div className="text-sm">{f.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        نوع: {f.type}
                        {f.required ? " • اجباری" : ""}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={() => setEditingFields(defaultPreview)} className="font-iran">
                    استفاده از همین فیلدها به‌عنوان سفارشی
                  </Button>
                </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-right">
                  برای این مورد، فیلد پیش‌فرضی نمایش داده نشد.
                </p>
              )}
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-3">
              {editingFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-right">
                  هیچ فیلدی تعریف نشده است.
                </p>
              )}
              {editingFields.map((f, idx) => {
                const optionsText = (f.options || [])
                  .map((o) => `${o.value}:${o.label}`)
                  .join(", ");
                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 gap-2 items-end border rounded-md p-3"
                  >
                    <div className="col-span-12 md:col-span-3 space-y-1">
                      <Label className="text-right">شناسه</Label>
                      <Input
                        value={f.id}
                        disabled
                        className="text-right bg-muted"
                        dir="rtl"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-3 space-y-1">
                      <Label className="text-right">عنوان</Label>
                      <Input
                        value={f.label}
                        onChange={(e) =>
                          updateField(idx, { label: e.target.value })
                        }
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2 space-y-1">
                      <Label className="text-right">نوع</Label>
                      <Select
                        value={f.type}
                        onValueChange={(v) =>
                          updateField(idx, { type: v as any })
                        }
                        dir="rtl"
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">متن</SelectItem>
                          <SelectItem value="textarea">چندخطی</SelectItem>
                          <SelectItem value="number">عدد</SelectItem>
                          <SelectItem value="email">ایمیل</SelectItem>
                          <SelectItem value="tel">تلفن</SelectItem>
                          <SelectItem value="date">تاریخ</SelectItem>
                          <SelectItem value="datetime">تاریخ و زمان</SelectItem>
                          <SelectItem value="select">لیست انتخابی</SelectItem>
                          <SelectItem value="radio">گزینه‌ای</SelectItem>
                          <SelectItem value="checkbox">تیک‌زدنی</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 md:col-span-2 space-y-1">
                      <Label className="text-right">اجباری؟</Label>
                      <div className="flex gap-2 items-center h-10">
                        <input
                          type="checkbox"
                          checked={!!f.required}
                          onChange={(e) =>
                            updateField(idx, { required: e.target.checked })
                          }
                        />
                        <span className="text-sm">الزامی</span>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 space-y-1">
                      <Label className="text-right">راهنما</Label>
                      <Input
                        value={f.placeholder || ""}
                        onChange={(e) =>
                          updateField(idx, { placeholder: e.target.value })
                        }
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    {(f.type === "select" || f.type === "radio") && (
                      <div className="col-span-12 md:col-span-6 space-y-1">
                        <Label className="text-right">
                          گزینه‌ها (value:label, جداشده با کاما)
                        </Label>
                        <Input
                          value={optionsText}
                          onChange={(e) =>
                            updateField(idx, { optionsText: e.target.value })
                          }
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                    )}
                    <div className="col-span-12 md:col-span-12 flex justify-end">
                      <Button
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => removeField(idx)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border rounded-lg p-3 space-y-3">
              <h4 className="font-medium text-right">افزودن فیلد جدید</h4>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-3 space-y-1">
                  <Label className="text-right">شناسه</Label>
                  <Input
                    value={newField.id}
                    onChange={(e) =>
                      setNewField((p) => ({ ...p, id: e.target.value }))
                    }
                    className="text-right"
                    dir="rtl"
                    placeholder="مثال: deviceBrand"
                  />
                </div>
                <div className="col-span-12 md:col-span-3 space-y-1">
                  <Label className="text-right">عنوان</Label>
                  <Input
                    value={newField.label}
                    onChange={(e) =>
                      setNewField((p) => ({ ...p, label: e.target.value }))
                    }
                    className="text-right"
                    dir="rtl"
                    placeholder="برچسب فیلد"
                  />
                </div>
                <div className="col-span-12 md:col-span-2 space-y-1">
                  <Label className="text-right">نوع</Label>
                  <Select
                    value={newField.type}
                    onValueChange={(v) =>
                      setNewField((p) => ({ ...p, type: v as any }))
                    }
                    dir="rtl"
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">متن</SelectItem>
                      <SelectItem value="textarea">چندخطی</SelectItem>
                      <SelectItem value="number">عدد</SelectItem>
                      <SelectItem value="email">ایمیل</SelectItem>
                      <SelectItem value="tel">تلفن</SelectItem>
                      <SelectItem value="date">تاریخ</SelectItem>
                      <SelectItem value="datetime">تاریخ و زمان</SelectItem>
                      <SelectItem value="select">لیست انتخابی</SelectItem>
                      <SelectItem value="radio">گزینه‌ای</SelectItem>
                      <SelectItem value="checkbox">تیک‌زدنی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 md:col-span-2">
                  <Label className="text-right block">اجباری؟</Label>
                  <div className="flex gap-2 items-center h-10">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) =>
                        setNewField((p) => ({
                          ...p,
                          required: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">الزامی</span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-6 space-y-1">
                  <Label className="text-right">راهنما</Label>
                  <Input
                    value={newField.placeholder}
                    onChange={(e) =>
                      setNewField((p) => ({
                        ...p,
                        placeholder: e.target.value,
                      }))
                    }
                    className="text-right"
                    dir="rtl"
                    placeholder="مثال: مدل دستگاه را وارد کنید"
                  />
                </div>
                {(newField.type === "select" || newField.type === "radio") && (
                  <div className="col-span-12 md:col-span-6 space-y-1">
                    <Label className="text-right">
                      گزینه‌ها (value:label, جداشده با کاما)
                    </Label>
                    <Input
                      value={newField.optionsText}
                      onChange={(e) =>
                        setNewField((p) => ({
                          ...p,
                          optionsText: e.target.value,
                        }))
                      }
                      className="text-right"
                      dir="rtl"
                      placeholder="hp:HP, dell:Dell"
                    />
                  </div>
                )}
                <div className="col-span-12 flex justify-end">
                  <Button onClick={addNewField}>افزودن فیلد</Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFieldDesignerOpen(false)}
                className="font-iran"
              >
                انصراف
              </Button>
              <Button onClick={saveFieldDesigner} className="font-iran">
                ذخیره تغییرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Message */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="text-right">
              <h4 className="font-medium text-orange-800 font-iran">
                نکته مهم
              </h4>
              <p className="text-sm text-orange-700 mt-1 font-iran">
                تغییرات در دسته‌بندی‌ها بلافاصله در فرم ایجاد تیکت کاربران اعمال
                می‌شود. حذف دسته‌بندی‌ها ممکن است بر تیکت‌های موجود تأثیر
                بگذارد.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}