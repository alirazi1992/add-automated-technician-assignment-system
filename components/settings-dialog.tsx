"use client"

import type React from "react"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  Lock,
  Upload,
  Eye,
  EyeOff,
  Camera,
  X,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Monitor,
  Moon,
  Sun,
  Languages,
} from "lucide-react"

const profileSchema = yup.object({
  name: yup.string().required("نام الزامی است"),
  email: yup.string().email("ایمیل معتبر وارد کنید").required("ایمیل الزامی است"),
  phone: yup.string().optional(),
  department: yup.string().optional(),
})

const passwordSchema = yup.object({
  currentPassword: yup.string().required("رمز عبور فعلی الزامی است"),
  newPassword: yup.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد").required("رمز عبور جدید الزامی است"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "تکرار رمز عبور مطابقت ندارد")
    .required("تکرار رمز عبور الزامی است"),
})

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SystemSettings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    desktop: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    language: "fa" | "en"
    fontSize: "small" | "medium" | "large"
  }
  privacy: {
    profileVisibility: boolean
    activityStatus: boolean
    readReceipts: boolean
  }
  system: {
    autoSave: boolean
    soundEffects: boolean
    animations: boolean
    compactMode: boolean
  }
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, updateProfile, changePassword, isLoading } = useAuth()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true,
    },
    appearance: {
      theme: "system",
      language: "fa",
      fontSize: "medium",
    },
    privacy: {
      profileVisibility: true,
      activityStatus: true,
      readReceipts: true,
    },
    system: {
      autoSave: true,
      soundEffects: true,
      animations: true,
      compactMode: false,
    },
  })

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
    },
  })

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const toggleSetting = (category: keyof SystemSettings, setting: string, value?: any) => {
    setSystemSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value !== undefined ? value : !prev[category][setting as keyof (typeof prev)[typeof category]],
      },
    }))

    toast({
      title: "تنظیمات به‌روزرسانی شد",
      description: "تغییرات شما ذخیره شد",
    })
  }

  const ToggleButton = ({
    active,
    onToggle,
    label,
    description,
  }: {
    active: boolean
    onToggle: () => void
    label: string
    description?: string
  }) => (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex-1 text-right">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
      </div>
      <Button
        type="button"
        variant={active ? "default" : "outline"}
        size="sm"
        onClick={onToggle}
        className="w-16 h-8 flex-shrink-0 mr-4"
      >
        {active ? "فعال" : "غیرفعال"}
      </Button>
    </div>
  )

  const ThemeSelector = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">تم ظاهری</Label>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "light", label: "روشن", icon: Sun },
          { value: "dark", label: "تیره", icon: Moon },
          { value: "system", label: "سیستم", icon: Monitor },
        ].map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant={systemSettings.appearance.theme === value ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSetting("appearance", "theme", value)}
            className="h-12 flex-col gap-1"
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )

  const FontSizeSelector = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">اندازه فونت</Label>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "small", label: "کوچک" },
          { value: "medium", label: "متوسط" },
          { value: "large", label: "بزرگ" },
        ].map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={systemSettings.appearance.fontSize === value ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSetting("appearance", "fontSize", value)}
            className="h-10"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )

  const onProfileSubmit = async (data: any) => {
    try {
      const success = await updateProfile(data)
      if (success) {
        toast({
          title: "پروفایل به‌روزرسانی شد",
          description: "اطلاعات شما با موفقیت ذخیره شد",
        })
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      toast({
        title: "خطا در به‌روزرسانی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      })
    }
  }

  const onPasswordSubmit = async (data: any) => {
    try {
      const success = await changePassword(data.currentPassword, data.newPassword)
      if (success) {
        toast({
          title: "رمز عبور تغییر کرد",
          description: "رمز عبور شما با موفقیت تغییر یافت",
        })
        passwordForm.reset()
      } else {
        toast({
          title: "خطا در تغییر رمز عبور",
          description: "رمز عبور فعلی اشتباه است",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطا در تغییر رمز عبور",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "فرمت فایل نامعتبر",
        description: "لطفاً فایل JPG، PNG یا GIF انتخاب کنید",
        variant: "destructive",
      })
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "حجم فایل زیاد است",
        description: "حداکثر حجم مجاز ۵ مگابایت است",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        const success = await updateProfile({ avatar: result })
        if (success) {
          toast({
            title: "تصویر پروفایل به‌روزرسانی شد",
            description: "تصویر جدید شما با موفقیت ذخیره شد",
          })
        } else {
          throw new Error("Upload failed")
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "خطا در آپلود تصویر",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      })
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
    }

    event.target.value = ""
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true)
      const success = await updateProfile({ avatar: null })
      if (success) {
        setAvatarPreview(null)
        toast({
          title: "تصویر پروفایل حذف شد",
          description: "تصویر پروفایل شما با موفقیت حذف شد",
        })
      }
    } catch (error) {
      toast({
        title: "خطا در حذف تصویر",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const triggerFileInput = () => {
    document.getElementById("avatar-upload")?.click()
  }

  if (!user) return null

  const currentAvatar = avatarPreview || user.avatar

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right flex items-center gap-2 justify-end">
            <Settings className="w-5 h-5" />
            تنظیمات سیستم
          </DialogTitle>
          <DialogDescription className="text-right">مدیریت تنظیمات حساب کاربری، ظاهر و عملکرد سیستم</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]" dir="rtl">
          <Tabs defaultValue="profile" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-5 mb-6" dir="rtl">
              <TabsTrigger value="profile" className="gap-2 text-xs flex-row-reverse">
                <User className="w-4 h-4" />
                پروفایل
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 text-xs flex-row-reverse">
                <Lock className="w-4 h-4" />
                امنیت
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 text-xs flex-row-reverse">
                <Bell className="w-4 h-4" />
                اعلان‌ها
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2 text-xs flex-row-reverse">
                <Palette className="w-4 h-4" />
                ظاهر
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2 text-xs flex-row-reverse">
                <Settings className="w-4 h-4" />
                سیستم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card dir="rtl">
                <CardHeader className="text-right">
                  <CardTitle className="text-right">اطلاعات شخصی</CardTitle>
                  <CardDescription className="text-right">اطلاعات پروفایل و تصویر خود را مدیریت کنید</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6" dir="rtl">
                  <div className="flex items-center gap-4 justify-end">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="avatar-upload" className="text-right">
                        تصویر پروفایل
                      </Label>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={triggerFileInput}
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
                              در حال آپلود...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 ml-2" />
                              تغییر تصویر
                            </>
                          )}
                        </Button>
                        {currentAvatar && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            disabled={isUploadingAvatar}
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <X className="w-4 h-4 ml-2" />
                            حذف تصویر
                          </Button>
                        )}
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        فرمت‌های مجاز: JPG، PNG، GIF (حداکثر ۵ مگابایت)
                      </p>
                    </div>
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={currentAvatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={triggerFileInput}
                        disabled={isUploadingAvatar}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4" dir="rtl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-right">
                        <Label htmlFor="name" className="text-right">
                          نام و نام خانوادگی
                        </Label>
                        <Controller
                          name="name"
                          control={profileForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="نام کامل"
                              disabled={isLoading}
                              className="text-right"
                              dir="rtl"
                            />
                          )}
                        />
                        {profileForm.formState.errors.name && (
                          <p className="text-sm text-red-500 text-right">{profileForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 text-right">
                        <Label htmlFor="email" className="text-right">
                          ایمیل
                        </Label>
                        <Controller
                          name="email"
                          control={profileForm.control}
                          render={({ field }) => (
                            <Input {...field} type="email" disabled={isLoading} className="text-right" dir="rtl" />
                          )}
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-500 text-right">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-right">
                        <Label htmlFor="phone" className="text-right">
                          شماره تماس
                        </Label>
                        <Controller
                          name="phone"
                          control={profileForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="09123456789"
                              disabled={isLoading}
                              className="text-right"
                              dir="rtl"
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2 text-right">
                        <Label htmlFor="department" className="text-right">
                          بخش
                        </Label>
                        <Controller
                          name="department"
                          control={profileForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="نام بخش"
                              disabled={isLoading}
                              className="text-right"
                              dir="rtl"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card dir="rtl">
                <CardHeader className="text-right">
                  <CardTitle className="text-right">تغییر رمز عبور</CardTitle>
                  <CardDescription className="text-right">برای امنیت حساب خود رمز عبور قوی انتخاب کنید</CardDescription>
                </CardHeader>
                <CardContent dir="rtl">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" dir="rtl">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="currentPassword" className="text-right">
                        رمز عبور فعلی
                      </Label>
                      <div className="relative">
                        <Controller
                          name="currentPassword"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type={showPasswords.current ? "text" : "password"}
                              disabled={isLoading}
                              className="text-right pr-10"
                              dir="rtl"
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500 text-right">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-right">
                      <Label htmlFor="newPassword" className="text-right">
                        رمز عبور جدید
                      </Label>
                      <div className="relative">
                        <Controller
                          name="newPassword"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type={showPasswords.new ? "text" : "password"}
                              disabled={isLoading}
                              className="text-right pr-10"
                              dir="rtl"
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500 text-right">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 text-right">
                      <Label htmlFor="confirmPassword" className="text-right">
                        تکرار رمز عبور جدید
                      </Label>
                      <div className="relative">
                        <Controller
                          name="confirmPassword"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type={showPasswords.confirm ? "text" : "password"}
                              disabled={isLoading}
                              className="text-right pr-10"
                              dir="rtl"
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500 text-right">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "در حال تغییر..." : "تغییر رمز عبور"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card dir="rtl">
                <CardHeader className="text-right">
                  <CardTitle className="text-right flex items-center gap-2 justify-end">
                    <Bell className="w-5 h-5" />
                    تنظیمات اعلان‌ها
                  </CardTitle>
                  <CardDescription className="text-right">نحوه دریافت اعلان‌ها را تنظیم کنید</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1" dir="rtl">
                  <ToggleButton
                    active={systemSettings.notifications.email}
                    onToggle={() => toggleSetting("notifications", "email")}
                    label="اعلان‌های ایمیل"
                    description="دریافت اعلان‌ها از طریق ایمیل"
                  />
                  <Separator />
                  <ToggleButton
                    active={systemSettings.notifications.push}
                    onToggle={() => toggleSetting("notifications", "push")}
                    label="اعلان‌های فوری"
                    description="نمایش اعلان‌ها در مرورگر"
                  />
                  <Separator />
                  <ToggleButton
                    active={systemSettings.notifications.sms}
                    onToggle={() => toggleSetting("notifications", "sms")}
                    label="اعلان‌های پیامکی"
                    description="دریافت پیامک برای اعلان‌های مهم"
                  />
                  <Separator />
                  <ToggleButton
                    active={systemSettings.notifications.desktop}
                    onToggle={() => toggleSetting("notifications", "desktop")}
                    label="اعلان‌های دسکتاپ"
                    description="نمایش اعلان‌ها روی دسکتاپ"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card dir="rtl">
                <CardHeader className="text-right">
                  <CardTitle className="text-right flex items-center gap-2 justify-end">
                    <Palette className="w-5 h-5" />
                    تنظیمات ظاهری
                  </CardTitle>
                  <CardDescription className="text-right">ظاهر و نمایش سیستم را شخصی‌سازی کنید</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6" dir="rtl">
                  <ThemeSelector />
                  <Separator />
                  <FontSizeSelector />
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">زبان سیستم</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={systemSettings.appearance.language === "fa" ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSetting("appearance", "language", "fa")}
                        className="h-10 gap-2"
                      >
                        <Languages className="w-4 h-4" />
                        فارسی
                      </Button>
                      <Button
                        type="button"
                        variant={systemSettings.appearance.language === "en" ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSetting("appearance", "language", "en")}
                        className="h-10 gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        English
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4">
                <Card dir="rtl">
                  <CardHeader className="text-right">
                    <CardTitle className="text-right flex items-center gap-2 justify-end">
                      <Shield className="w-5 h-5" />
                      تنظیمات حریم خصوصی
                    </CardTitle>
                    <CardDescription className="text-right">کنترل نمایش اطلاعات شخصی شما</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1" dir="rtl">
                    <ToggleButton
                      active={systemSettings.privacy.profileVisibility}
                      onToggle={() => toggleSetting("privacy", "profileVisibility")}
                      label="نمایش پروفایل عمومی"
                      description="امکان مشاهده پروفایل شما توسط سایر کاربران"
                    />
                    <Separator />
                    <ToggleButton
                      active={systemSettings.privacy.activityStatus}
                      onToggle={() => toggleSetting("privacy", "activityStatus")}
                      label="نمایش وضعیت فعالیت"
                      description="نمایش آخرین زمان حضور آنلاین"
                    />
                    <Separator />
                    <ToggleButton
                      active={systemSettings.privacy.readReceipts}
                      onToggle={() => toggleSetting("privacy", "readReceipts")}
                      label="تأیید خواندن پیام‌ها"
                      description="ارسال تأیید خواندن پیام‌ها"
                    />
                  </CardContent>
                </Card>

                <Card dir="rtl">
                  <CardHeader className="text-right">
                    <CardTitle className="text-right flex items-center gap-2 justify-end">
                      <Settings className="w-5 h-5" />
                      تنظیمات عملکرد
                    </CardTitle>
                    <CardDescription className="text-right">بهینه‌سازی عملکرد و تجربه کاربری</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1" dir="rtl">
                    <ToggleButton
                      active={systemSettings.system.autoSave}
                      onToggle={() => toggleSetting("system", "autoSave")}
                      label="ذخیره خودکار"
                      description="ذخیره خودکار تغییرات هر ۳۰ ثانیه"
                    />
                    <Separator />
                    <ToggleButton
                      active={systemSettings.system.soundEffects}
                      onToggle={() => toggleSetting("system", "soundEffects")}
                      label="جلوه‌های صوتی"
                      description="پخش صدا برای اعلان‌ها و اقدامات"
                    />
                    <Separator />
                    <ToggleButton
                      active={systemSettings.system.animations}
                      onToggle={() => toggleSetting("system", "animations")}
                      label="انیمیشن‌ها"
                      description="نمایش انیمیشن‌ها و ترانزیشن‌ها"
                    />
                    <Separator />
                    <ToggleButton
                      active={systemSettings.system.compactMode}
                      onToggle={() => toggleSetting("system", "compactMode")}
                      label="حالت فشرده"
                      description="نمایش فشرده‌تر اطلاعات"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
