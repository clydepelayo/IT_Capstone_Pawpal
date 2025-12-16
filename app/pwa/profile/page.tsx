  "use client"

  import { useState, useEffect } from "react"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Skeleton } from "@/components/ui/skeleton"
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { User, MapPin, Phone, PawPrint, Edit, Save, X, LogOut } from "lucide-react"
  import { useToast } from "@/hooks/use-toast"
  import { useRouter } from "next/navigation"

  interface UserProfile {
    id: number
    first_name: string
    last_name: string
    email: string
    phone?: string
    address?: string
  }

  interface Pet {
    id: number
    name: string
  }

  export default function PWAProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [pets, setPets] = useState<Pet[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [editForm, setEditForm] = useState({
      phone: "",
      address: "",
    })
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
      fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
      try {
        setIsLoading(true)

        // Fetch user profile
        const profileResponse = await fetch("/api/client/profile", {
          credentials: "include",
        })

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile")
        }

        const profileData = await profileResponse.json()
        setProfile(profileData)
        setEditForm({
          phone: profileData.phone || "",
          address: profileData.address || "",
        })

        // Fetch user's pets
        const petsResponse = await fetch("/api/client/pets", {
          credentials: "include",
        })

        if (petsResponse.ok) {
          const petsData = await petsResponse.json()
          console.log("Fetched pets data:", petsData  )
          setPets(petsData || [])
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const handleOpenEditDialog = () => {
      if (profile) {
        setEditForm({
          phone: profile.phone || "",
          address: profile.address || "",
        })
        setIsEditDialogOpen(true)
      }
    }

    const handleCloseEditDialog = () => {
      setIsEditDialogOpen(false)
      if (profile) {
        setEditForm({
          phone: profile.phone || "",
          address: profile.address || "",
        })
      }
    }

    const handleSaveProfile = async () => {
      try {
        setIsSaving(true)

        const response = await fetch("/api/client/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            phone: editForm.phone,
            address: editForm.address,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update profile")
        }

        // Update local state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                phone: editForm.phone,
                address: editForm.address,
              }
            : null,
        )

        toast({
          title: "Success",
          description: "Profile updated successfully",
        })

        setIsEditDialogOpen(false)
      } catch (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }

    const handleLogout = async () => {
      try {
        setIsLoggingOut(true)

        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to logout")
        }

        // Clear any local storage data
        localStorage.removeItem("pwa_cart")

        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        })

        // Redirect to login page
        router.push("/client/login")
      } catch (error) {
        console.error("Error logging out:", error)
        toast({
          title: "Error",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoggingOut(false)
      }
    }

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-8 w-32" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (!profile) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Failed to load profile information</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const fullName = `${profile.first_name} ${profile.last_name}`

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button onClick={handleOpenEditDialog} size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{fullName}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{profile.address || "No address provided"}</p>
                </div>
              </div>

              {/* Contact Number */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                  <p className="font-semibold text-gray-900">{profile.phone || "No phone number provided"}</p>
                </div>
              </div>

              {/* Number of Pets */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <PawPrint className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-700 mb-1">Number of Pets</p>
                  <p className="font-bold text-2xl text-blue-900">{pets.length}</p>
                  {pets.length > 0 && (
                    <p className="text-sm text-blue-600 mt-1">{pets.map((pet) => pet.name).join(", ")}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Account Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900">{profile.email}</p>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <Button onClick={handleLogout} disabled={isLoggingOut} variant="destructive" className="w-full gap-2">
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Profile
              </DialogTitle>
              <DialogDescription>Update your address and contact information below.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  Contact Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your contact number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  disabled={isSaving}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseEditDialog} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
