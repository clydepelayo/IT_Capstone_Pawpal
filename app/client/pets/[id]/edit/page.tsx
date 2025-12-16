"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PawPrint } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { use } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"

export default function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React's use() hook
  const { id } = use(params)

  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    birth_date: "",
    gender: "",
    weight_kg: "",
    color: "",
    medical_notes: "",
  })

  useEffect(() => {
    const fetchPet = async () => {
      try {
        console.log("Fetching pet with ID:", id)

        const response = await fetch(`/api/client/pets/${id}`)
        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error response:", errorData)
          throw new Error(errorData.message || "Failed to fetch pet")
        }

        const pet = await response.json()
        console.log("Fetched pet data:", pet)

        // Format the birth_date to YYYY-MM-DD for the input
        const birthDate = pet.birth_date ? new Date(pet.birth_date).toISOString().split("T")[0] : ""

        // The API now returns Pascal case for species and gender
        const newFormData = {
          name: pet.name || "",
          species: pet.species || "",
          breed: pet.breed || "",
          birth_date: birthDate,
          gender: pet.gender || "",
          weight_kg: pet.weight?.toString() || "",
          color: pet.color || "",
          medical_notes: pet.medical_notes || "",
        }

        console.log("Setting form data:", newFormData)
        setFormData(newFormData)
      } catch (error) {
        console.error("Error fetching pet:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load pet information",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchPet()
  }, [id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select changed: ${name} = ${value}`)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Submitting form data:", formData)

      const response = await fetch(`/api/client/pets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Update error:", error)
        throw new Error(error.message || "Failed to update pet")
      }

      const updatedPet = await response.json()
      console.log("Updated pet:", updatedPet)

      toast({
        title: "Success",
        description: "Pet updated successfully",
      })

      router.push(`/client/pets/${id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating pet:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update pet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading pet information...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/client/pets/${id}`}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Edit Pet</h1>
                <p className="text-muted-foreground">Update your pet's information</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5" />
                Pet Information
              </CardTitle>
              <CardDescription>Update the details about your pet. Fields marked with * are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Pet Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter pet name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="species">
                      Species <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.species}
                      onValueChange={(value) => handleSelectChange("species", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Hamster">Hamster</SelectItem>
                        <SelectItem value="Guinea Pig">Guinea Pig</SelectItem>
                        <SelectItem value="Fish">Fish</SelectItem>
                        <SelectItem value="Reptile">Reptile</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      placeholder="Enter breed (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">
                      Birth Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      name="weight_kg"
                      type="number"
                      step="0.01"
                      value={formData.weight_kg}
                      onChange={handleChange}
                      placeholder="Enter weight (optional)"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Enter color (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medical_notes">Medical Notes</Label>
                  <Textarea
                    id="medical_notes"
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleChange}
                    placeholder="Enter any medical notes, allergies, or special care instructions (optional)"
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Pet"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
