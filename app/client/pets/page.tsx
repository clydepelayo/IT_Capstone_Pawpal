"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClientSidebar } from "@/components/client-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Plus, Edit, Eye, Calendar } from "lucide-react"

export default function MyPets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await fetch("/api/client/pets", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      }
    } catch (error) {
      console.error("Error fetching pets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPets = pets.filter(
    (pet: any) =>
      pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSpeciesColor = (species: string) => {
    switch (species?.toLowerCase()) {
      case "dog":
        return "bg-blue-100 text-blue-800"
      case "cat":
        return "bg-purple-100 text-purple-800"
      case "bird":
        return "bg-green-100 text-green-800"
      case "rabbit":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "Unknown"

    const today = new Date()
    const birth = new Date(birthDate)

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (today.getDate() < birth.getDate()) {
      months--
      if (months < 0) {
        years--
        months += 12
      }
    }

    if (years === 0 && months === 0) return "Newborn"
    if (years === 0) return `${months} month${months > 1 ? "s" : ""}`
    if (months === 0) return `${years} year${years > 1 ? "s" : ""}`
    return `${years}y ${months}m`
  }

  return (
    <SidebarProvider>
      <ClientSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/client/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>My Pets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
              <p className="text-gray-600">Manage your beloved companions</p>
            </div>
            <Button asChild>
              <Link href="/client/pets/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Pet
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Pets Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet: any) => (
                <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{pet.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {pet.breed || "Mixed breed"}
                        </CardDescription>
                      </div>
                      <Badge className={getSpeciesColor(pet.species)} variant="secondary">
                        {pet.species}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Age:</span>
                        <p className="font-medium">{calculateAge(pet.birth_date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Weight:</span>
                        <p className="font-medium">{pet.weight ? `${pet.weight} kg` : "Not recorded"}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <p className="font-medium capitalize">{pet.gender || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Color:</span>
                        <p className="font-medium">{pet.color || "Not specified"}</p>
                      </div>
                    </div>

                    {pet.microchip_id && <div className="text-xs text-gray-500">Microchip: {pet.microchip_id}</div>}

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={`/client/pets/${pet.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={`/client/pets/${pet.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/client/appointments/book?petId=${pet.id}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Book
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredPets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm ? "No pets found matching your search." : "You haven't added any pets yet."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/client/pets/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Pet
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
