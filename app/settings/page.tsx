"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Settings, Palette, Moon, Sun, Sliders, Lock, User, Phone, MapPin, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useLandlord } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ColorPicker } from "@/components/color-picker"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
                               phone: z.string().min(6, "Phone must be at least 6 characters"),
                               ubication: z.string().min(3, "Location must be at least 3 characters"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
                                newPassword: z.string().min(6, "New password must be at least 6 characters"),
                                confirmPassword: z.string().min(6, "Confirmation must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function SettingsPage() {
  const { landlord, isAuthenticated, updateLandlord } = useLandlord();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
                                                             defaultValues: {
                                                               name: landlord?.name || "",
                                                               phone: landlord?.phone || "",
                                                               ubication: landlord?.ubication || "",
                                                             }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
                                                               defaultValues: {
                                                                 currentPassword: "",
                                                                 newPassword: "",
                                                                 confirmPassword: "",
                                                               }
  });

  useEffect(() => {
    if (landlord) {
      profileForm.reset({
        name: landlord.name,
        phone: landlord.phone,
        ubication: landlord.ubication,
      });
    }
  }, [landlord]);

  const updateLandlordInDatabase = async (updates: Partial<typeof landlord>) => {
    if (!landlord?.id) return;

    const { data, error } = await supabase
    .from(" ")
    .update(updates)
    .eq("id", landlord.id)
    .select();

    if (error) {
      throw error;
    }

    return data?.[0];
  };

  const handleThemeChange = (value: string) => {
    if (landlord) {
      // Si se selecciona un tema que no es claro/oscuro, mantener el modo actual
      const themePrefered = value === 'light' || value === 'dark'
      ? value
      : landlord.theme_prefered === 'light' || landlord.theme_prefered === 'dark'
      ? landlord.theme_prefered
      : 'light';

      const updates = {
        theme_prefered: themePrefered,
        accent_color: value === 'custom' ? landlord.accent_color : value
      };

      updateLandlord(updates);
      updateLandlordInDatabase(updates);
      showSuccessMessage("Theme preference updated");
    }
  }

  const handleCustomColorChange = (color: string) => {
    if (landlord) {
      const updates = {
        accent_color: color,
        theme_prefered: 'custom'
      };

      updateLandlord(updates);
      updateLandlordInDatabase(updates);
      showSuccessMessage("Accent color updated");
    }
  }

  const handleDarkModeChange = (checked: boolean) => {
    if (landlord) {
      const theme = checked ? 'dark' : 'light';
      const updates = {
        theme_prefered: theme,
        accent_color: landlord.accent_color
      };

      updateLandlord(updates);
      updateLandlordInDatabase(updates);
      showSuccessMessage(`Theme set to ${theme} mode`);
    }
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  const handleProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!landlord) return;

    setIsLoading(true);
    try {
      const updatedData = await updateLandlordInDatabase({
        name: values.name,
        phone: values.phone,
        ubication: values.ubication,
      });

      if (updatedData) {
        updateLandlord(updatedData);
      }

      showSuccessMessage("Profile updated successfully");
      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully",
      });
    } catch (error: any) {
      let errorMessage = "There was a problem updating your profile";

      if (error.code === "23505") {
        if (error.message.includes("phone")) {
          errorMessage = "This phone number is already in use";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!landlord?.email) return;

    setIsLoading(true);
    try {
      // 1. Autenticar al usuario con credenciales actuales
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: landlord.email,
        password: values.currentPassword,
      });

      if (authError) {
        throw new Error("Invalid current password");
      }

      // 2. Actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) throw updateError;

      showSuccessMessage("Password updated successfully");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });

      passwordForm.reset();
      setIsPasswordFormOpen(false);
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred while updating your password";

      toast({
        title: "Password change error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated || !landlord) {
    return (
      <div className="flex justify-center items-center h-64">
      <p>Loading information...</p>
      </div>
    );
  }

  // Determinar si el tema actual es custom
  const isCustomTheme = landlord.theme_prefered === 'custom';

  // Determinar el modo actual (light/dark)
  const isDarkMode = landlord.theme_prefered === 'dark';

  return (
    <div className="space-y-6 pb-10">
    {/* Success Message Banner */}
    {showSuccess && (
      <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
      <CheckCircle className="mr-2 h-5 w-5" />
      <span>{successMessage}</span>
      </div>
      </div>
    )}

    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
    <div className="max-w-6xl mx-auto">
    <div className="flex items-center justify-between">
    <div>
    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
    <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
    </div>
    <div className="bg-white p-2 rounded-full shadow-sm">
    <User className="h-8 w-8 text-indigo-600" />
    </div>
    </div>
    </div>
    </div>

    <div className="max-w-6xl mx-auto px-4">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
    {/* Profile Section */}
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
    <CardTitle className="flex items-center">
    <User className="mr-2 h-5 w-5 text-indigo-600" />
    <span className="text-gray-800">Profile</span>
    </CardTitle>
    <CardDescription className="text-gray-600">Update your personal information</CardDescription>
    </CardHeader>
    <CardContent className="pt-5">
    <Form {...profileForm}>
    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
    <FormField
    control={profileForm.control}
    name="name"
    render={({ field }) => (
      <FormItem>
      <FormLabel className="text-gray-700">Name</FormLabel>
      <FormControl>
      <Input
      placeholder="Your full name"
      {...field}
      className="focus:ring-indigo-500 focus:border-indigo-500"
      />
      </FormControl>
      <FormMessage />
      </FormItem>
    )}
    />

    <FormField
    control={profileForm.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
      <FormLabel className="text-gray-700">Phone</FormLabel>
      <FormControl>
      <div className="flex items-center">
      <Phone className="mr-2 h-4 w-4 text-indigo-500" />
      <Input
      placeholder="Your phone number"
      {...field}
      className="focus:ring-indigo-500 focus:border-indigo-500"
      />
      </div>
      </FormControl>
      <FormMessage />
      </FormItem>
    )}
    />

    <FormField
    control={profileForm.control}
    name="ubication"
    render={({ field }) => (
      <FormItem>
      <FormLabel className="text-gray-700">Location</FormLabel>
      <FormControl>
      <div className="flex items-center">
      <MapPin className="mr-2 h-4 w-4 text-indigo-500" />
      <Input
      placeholder="Your location"
      {...field}
      className="focus:ring-indigo-500 focus:border-indigo-500"
      />
      </div>
      </FormControl>
      <FormMessage />
      </FormItem>
    )}
    />

    <CardFooter className="p-0 pt-4">
    <Button
    type="submit"
    className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
    disabled={isLoading}
    >
    {isLoading ? "Saving..." : "Save changes"}
    </Button>
    </CardFooter>
    </form>
    </Form>
    </CardContent>
    </Card>

    {/* Security Section */}
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
    <CardTitle className="flex items-center">
    <Lock className="mr-2 h-5 w-5 text-indigo-600" />
    <span className="text-gray-800">Security</span>
    </CardTitle>
    <CardDescription className="text-gray-600">Manage your password and security</CardDescription>
    </CardHeader>
    <CardContent className="pt-5">
    {!isPasswordFormOpen ? (
      <div className="space-y-4">
      <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
      <h4 className="font-medium text-gray-800">Update Password</h4>
      <p className="text-sm text-gray-600 mt-1">Keep your account secure with a strong password</p>
      </div>
      <Button
      variant="outline"
      className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
      onClick={() => setIsPasswordFormOpen(true)}
      >
      Change password
      </Button>
      </div>
    ) : (
      <Form {...passwordForm}>
      <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
      <FormField
      control={passwordForm.control}
      name="currentPassword"
      render={({ field }) => (
        <FormItem>
        <FormLabel className="text-gray-700">Current password</FormLabel>
        <FormControl>
        <Input
        type="password"
        placeholder="Your current password"
        {...field}
        className="focus:ring-indigo-500 focus:border-indigo-500"
        />
        </FormControl>
        <FormMessage />
        </FormItem>
      )}
      />

      <FormField
      control={passwordForm.control}
      name="newPassword"
      render={({ field }) => (
        <FormItem>
        <FormLabel className="text-gray-700">New password</FormLabel>
        <FormControl>
        <Input
        type="password"
        placeholder="Your new password"
        {...field}
        className="focus:ring-indigo-500 focus:border-indigo-500"
        />
        </FormControl>
        <FormMessage />
        </FormItem>
      )}
      />

      <FormField
      control={passwordForm.control}
      name="confirmPassword"
      render={({ field }) => (
        <FormItem>
        <FormLabel className="text-gray-700">Confirm new password</FormLabel>
        <FormControl>
        <Input
        type="password"
        placeholder="Confirm your new password"
        {...field}
        className="focus:ring-indigo-500 focus:border-indigo-500"
        />
        </FormControl>
        <FormMessage />
        </FormItem>
      )}
      />

      <div className="flex space-x-2">
      <Button
      type="button"
      variant="outline"
      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
      onClick={() => {
        setIsPasswordFormOpen(false);
        passwordForm.reset();
      }}
      >
      Cancel
      </Button>
      <Button
      type="submit"
      className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
      disabled={isLoading}
      >
      {isLoading ? "Updating..." : "Update password"}
      </Button>
      </div>
      </form>
      </Form>
    )}
    </CardContent>
    </Card>

    {/* Customization Section */}
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
    <CardTitle className="flex items-center">
    <Palette className="mr-2 h-5 w-5 text-indigo-600" />
    <span className="text-gray-800">Customization</span>
    </CardTitle>
    <CardDescription className="text-gray-600">Personalize your dashboard appearance</CardDescription>
    </CardHeader>
    <CardContent className="pt-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
    <div className="space-y-6">
    <div className="space-y-2">
    <Label className="text-gray-700">Accent Color</Label>
    <p className="text-sm text-gray-600">Choose your primary theme color</p>
    <RadioGroup
    value={isCustomTheme ? "custom" : landlord.accent_color}
    onValueChange={handleThemeChange}
    className="grid grid-cols-4 gap-2"
    >
    {["amber", "teal", "rose", "blue", "purple", "green", "custom"].map(
      (colorOption) => (
        <div key={colorOption} className="flex flex-col items-center">
        <RadioGroupItem value={colorOption} id={colorOption} className="sr-only peer" />
        <Label
        htmlFor={colorOption}
        className={cn(
          "flex aspect-square w-10 items-center justify-center rounded-full border-2 hover:scale-105 transition-transform",
          "bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-500 cursor-pointer",
          "peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-indigo-200"
        )}
        >
        {colorOption === "custom" ? (
          <div className="h-6 w-6 rounded-full" style={{ backgroundColor: landlord.accent_color }} />
        ) : (
          <span
          className={`h-6 w-6 rounded-full bg-${colorOption}-500`}
          />
        )}
        </Label>
        <span className="mt-1 text-xs text-gray-700">
        {colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
        </span>
        </div>
      )
    )}
    </RadioGroup>
    </div>

    {isCustomTheme && (
      <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
      <Label className="text-gray-700">Custom Color</Label>
      <div
      className="h-8 w-8 rounded-full border border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: landlord.accent_color }}
      onClick={() => setColorPickerOpen(true)}
      />
      </div>

      <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
      <PopoverTrigger asChild>
      <Button variant="outline" className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50">
      <Sliders className="mr-2 h-4 w-4" />
      Customize Color
      </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-sm p-4 shadow-xl">
      <ColorPicker
      color={landlord.accent_color}
      onChange={handleCustomColorChange}
      onClose={() => setColorPickerOpen(false)}
      />
      </PopoverContent>
      </Popover>
      </div>
    )}
    </div>
    </div>

    <div className="border-l border-gray-100 pl-8">
    <div className="space-y-6">
    <div className="space-y-4">
    <div className="flex items-center justify-between">
    <div className="space-y-0.5">
    <Label htmlFor="dark-mode" className="text-gray-700">Dark Mode</Label>
    <p className="text-sm text-gray-600">Switch between light and dark mode</p>
    </div>
    <div className="flex items-center space-x-2">
    <Sun className="h-4 w-4 text-gray-600" />
    <Switch
    id="dark-mode"
    checked={isDarkMode}
    onCheckedChange={handleDarkModeChange}
    className="data-[state=checked]:bg-indigo-600"
    />
    <Moon className="h-4 w-4 text-gray-600" />
    </div>
    </div>

    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
    <div className="flex items-center space-x-3">
    <div className="bg-indigo-100 p-2 rounded-lg">
    <div className="bg-indigo-500 rounded-md w-10 h-10 flex items-center justify-center">
    <Settings className="text-white h-5 w-5" />
    </div>
    </div>
    <div>
    <h3 className="font-medium text-gray-900">Preview</h3>
    <p className="text-sm text-gray-600">See how your theme looks</p>
    </div>
    </div>

    <div className="mt-4 flex space-x-2">
    <Button
    variant="outline"
    className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
    style={{
      backgroundColor: isCustomTheme ? landlord.accent_color : undefined,
      borderColor: isCustomTheme ? landlord.accent_color : undefined,
      color: isCustomTheme ? 'white' : undefined
    }}
    >
    Primary Button
    </Button>
    <Button variant="outline">Secondary</Button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </CardContent>
    </Card>

    {/* Notifications Section */}
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
    <CardTitle className="flex items-center">
    <Settings className="mr-2 h-5 w-5 text-indigo-600" />
    <span className="text-gray-800">Notifications</span>
    </CardTitle>
    <CardDescription className="text-gray-600">Control how you receive notifications</CardDescription>
    </CardHeader>
    <CardContent className="pt-5">
    <div className="space-y-6">
    <div className="flex items-center justify-between py-2">
    <div className="space-y-0.5">
    <Label htmlFor="email-notifications" className="text-gray-700">Email Notifications</Label>
    <p className="text-sm text-gray-600">Receive email notifications</p>
    </div>
    <Switch
    id="email-notifications"
    defaultChecked
    className="data-[state=checked]:bg-indigo-600"
    />
    </div>

    <div className="flex items-center justify-between py-2">
    <div className="space-y-0.5">
    <Label htmlFor="sms-notifications" className="text-gray-700">SMS Notifications</Label>
    <p className="text-sm text-gray-600">Receive text messages for urgent matters</p>
    </div>
    <Switch
    id="sms-notifications"
    className="data-[state=checked]:bg-indigo-600"
    />
    </div>

    <div className="flex items-center justify-between py-2">
    <div className="space-y-0.5">
    <Label htmlFor="app-notifications" className="text-gray-700">App Notifications</Label>
    <p className="text-sm text-gray-600">In-app alerts</p>
    </div>
    <Switch
    id="app-notifications"
    defaultChecked
    className="data-[state=checked]:bg-indigo-600"
    />
    </div>
    </div>
    </CardContent>
    <CardFooter className="bg-gray-50 border-t border-gray-100">
    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md">
    Save preferences
    </Button>
    </CardFooter>
    </Card>
    </div>
    </div>
    </div>
  );
}
