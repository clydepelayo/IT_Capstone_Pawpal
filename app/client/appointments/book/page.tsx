"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Calendar, User, DollarSign, FileText, CalendarDays, Timer, PawPrint, CreditCard, Home, AlertCircle, Info, QrCode, CheckCircle2, Stethoscope, Award as IdCard, PenTool } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Pet {
  id: number
  name: string
  species: string
  breed: string
  birth_date: string
  size?: string
}

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  category_id: number
  category: string
}

interface Cage {
  id: number
  cage_number: string
  cage_type: string
  capacity: number
  daily_rate: number
  description: string
  total_amount: number
}

export default function BookAppointmentPage() {
  // Booking page for veterinary appointments with multi-pet support
  
  const router = useRouter()
  const { toast } = useToast()
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [boardingServices, setBoardingServices] = useState<Service[]>([])
  const [regularServices, setRegularServices] = useState<Service[]>([])
  const [availableCages, setAvailableCages] = useState<Cage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingCages, setIsCheckingCages] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [serviceType, setServiceType] = useState<"regular" | "boarding">("regular")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Form state
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("GCash") 

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  // Boarding specific state
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [selectedCage, setSelectedCage] = useState("")
  const [boardingInstructions, setBoardingInstructions] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false)
  const [agreedToBoardingTerms, setAgreedToBoardingTerms] = useState(false)
  const [hasScrolledBoardingTerms, setHasScrolledBoardingTerms] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [isUploadingId, setIsUploadingId] = useState(false)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)

  const termsScrollRef = useRef<HTMLDivElement>(null)
  const boardingTermsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPets()
    fetchServices()
  }, [])

  // Check cage availability when boarding dates change
  useEffect(() => {
    if (serviceType === "boarding" && checkInDate && checkOutDate) {
      checkCageAvailability()
    }
  }, [checkInDate, checkOutDate, serviceType])

  // Reset form when service type changes
  useEffect(() => {
    setSelectedService("")
    setHasScrolledTerms(false)
    setAgreedToTerms(false)
    setHasScrolledBoardingTerms(false)
    setAgreedToBoardingTerms(false)
    setAppointmentDate("")
    setAppointmentTime("")
    setCheckInDate("")
    setCheckOutDate("")
    setSelectedCage("")
    setBoardingInstructions("")
    setNotes("")
    setIdFile(null)
    setIdPreview(null)
    setSignatureFile(null)
    setSignaturePreview(null)
    // Reset selected pets when service type changes
    setSelectedPets([])
  }, [serviceType])

  const fetchPets = async () => {
    try {
      console.log("Fetching pets...")
      const response = await fetch("/api/client/pets", {
        credentials: "include",
      })

      console.log("Pets response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Pets data received:", data)

        if (Array.isArray(data)) {
          setPets(data)
          console.log("Set pets array:", data.length, "pets")
        } else if (data.pets && Array.isArray(data.pets)) {
          setPets(data.pets)
          console.log("Set pets from data.pets:", data.pets.length, "pets")
        } else {
          console.error("Unexpected data format:", data)
          setPets([])
        }
      } else {
        console.error("Failed to fetch pets, status:", response.status)
        setPets([])
      }
    } catch (error) {
      console.error("Error fetching pets:", error)
      setPets([])
    }
  }

  const fetchServices = async () => {
    try {
      console.log("Fetching services...")
      const response = await fetch("/api/client/services", {
        credentials: "include",
      })

      console.log("Services response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Services data received:", data)

        let servicesArray = []
        if (Array.isArray(data)) {
          servicesArray = data
          console.log("Services is array:", data.length, "services")
        } else if (data.services && Array.isArray(data.services)) {
          servicesArray = data.services
          console.log("Services from data.services:", data.services.length, "services")
        } else {
          console.error("Unexpected services data format:", data)
          setServices([])
          return
        }

        const servicesWithNumericPrice = servicesArray.map((service: any) => ({
          ...service,
          price: Number.parseFloat(service.price) || 0,
          duration: Number.parseInt(service.duration) || 0,
        }))

        setServices(servicesWithNumericPrice)

        // Segregate services into boarding and regular
        const boarding = servicesWithNumericPrice.filter(
          (service: Service) => service.category?.toLowerCase() === "boarding",
        )
        const regular = servicesWithNumericPrice.filter(
          (service: Service) => service.category?.toLowerCase() !== "boarding",
        )

        setBoardingServices(boarding)
        setRegularServices(regular)

        console.log("Boarding services:", boarding.length)
        console.log("Regular services:", regular.length)
      } else {
        console.error("Failed to fetch services, status:", response.status)
        setServices([])
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([])
    }
  }

  const checkCageAvailability = async () => {
    if (!checkInDate || !checkOutDate) return

    setIsCheckingCages(true)
    try {
      const response = await fetch(
        `/api/client/cages/availability?check_in_date=${checkInDate}&check_out_date=${checkOutDate}`,
        { credentials: "include" },
      )

      if (response.ok) {
        const data = await response.json()
        setAvailableCages(data.cages || [])
        setSelectedCage("")
      } else {
        setAvailableCages([])
        setSelectedCage("")
        toast({
          title: "Error",
          description: "Failed to check cage availability",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking cage availability:", error)
      setAvailableCages([])
      setSelectedCage("")
    } finally {
      setIsCheckingCages(false)
    }
  }

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5

    if (isAtBottom && !hasScrolledTerms) {
      setHasScrolledTerms(true)
    }
  }

  const handleBoardingTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5

    if (isAtBottom && !hasScrolledBoardingTerms) {
      setHasScrolledBoardingTerms(true)
    }
  }

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, or WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploadingId(true)
    setIdFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setIdPreview(e.target?.result as string)
      setIsUploadingId(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, or WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploadingSignature(true)
    setSignatureFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSignaturePreview(e.target?.result as string)
      setIsUploadingSignature(false)
    }
    reader.readAsDataURL(file)
  }

  const getPetSize = (pet: Pet | undefined): string => {
    if (!pet) return "medium"

    const species = pet.species.toLowerCase()
    const breed = pet.breed.toLowerCase()

    if (species === "cat") return "small"

    if (species === "dog") {
      if (
        breed.includes("chihuahua") ||
        breed.includes("pomeranian") ||
        breed.includes("yorkshire") ||
        breed.includes("maltese") ||
        breed.includes("shih tzu") ||
        breed.includes("pug")
      ) {
        return "small"
      }
      if (
        breed.includes("german shepherd") ||
        breed.includes("golden retriever") ||
        breed.includes("labrador") ||
        breed.includes("rottweiler") ||
        breed.includes("great dane") ||
        breed.includes("mastiff")
      ) {
        return "large"
      }
      return "medium"
    }

    return "medium"
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image file (JPEG, PNG, or WebP).",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setReceiptFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      console.log("[v0] Starting receipt upload, file:", file.name, "size:", file.size, "type:", file.type)
      
      const formData = new FormData()
      formData.append("receipt", file)
      formData.append("appointmentId", "temp")

      console.log("[v0] Sending receipt upload request to /api/client/appointments/upload-receipt")
      
      const response = await fetch("/api/client/appointments/upload-receipt", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      console.log("[v0] Receipt upload response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Receipt uploaded successfully:", result.receiptUrl)
        return result.receiptUrl
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to upload receipt. Status:", response.status, "Response:", errorText)
        toast({
          title: "Receipt Upload Failed",
          description: "Could not upload your receipt. Please try again.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error("[v0] Error uploading receipt:", error)
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading your receipt.",
        variant: "destructive",
      })
      return null
    }
  }

  const uploadBoardingDocuments = async (
    appointmentId: number,
  ): Promise<{ idUrl: string | null; signatureUrl: string | null }> => {
    let idUrl = null
    let signatureUrl = null

    try {
      // Upload ID
      if (idFile) {
        console.log("Uploading ID file:", idFile.name, "for appointment:", appointmentId)
        const idFormData = new FormData()
        idFormData.append("id", idFile) // Changed from "file" to "id"
        idFormData.append("appointmentId", appointmentId.toString())

        const idResponse = await fetch("/api/client/appointments/upload-boarding-id", {
          method: "POST",
          credentials: "include",
          body: idFormData,
        })

        console.log("ID upload response status:", idResponse.status)

        if (idResponse.ok) {
          const result = await idResponse.json()
          idUrl = result.idUrl
          console.log("ID uploaded successfully:", idUrl)
        } else {
          const errorData = await idResponse.json()
          console.error("ID upload failed:", errorData)
          toast({
            title: "ID Upload Failed",
            description: errorData.error || "Failed to upload ID document",
            variant: "destructive",
          })
        }
      }

      // Upload Signature
      if (signatureFile) {
        console.log("Uploading signature file:", signatureFile.name, "for appointment:", appointmentId)
        const signatureFormData = new FormData()
        signatureFormData.append("signature", signatureFile) // Changed from "file" to "signature"
        signatureFormData.append("appointmentId", appointmentId.toString())

        const signatureResponse = await fetch("/api/client/appointments/upload-boarding-signature", {
          method: "POST",
          credentials: "include",
          body: signatureFormData,
        })

        console.log("Signature upload response status:", signatureResponse.status)

        if (signatureResponse.ok) {
          const result = await signatureResponse.json()
          signatureUrl = result.signatureUrl
          console.log("Signature uploaded successfully:", signatureUrl)
        } else {
          const errorData = await signatureResponse.json()
          console.error("Signature upload failed:", errorData)
          toast({
            title: "Signature Upload Failed",
            description: errorData.error || "Failed to upload signature document",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error uploading boarding documents:", error)
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading documents",
        variant: "destructive",
      })
    }

    return { idUrl, signatureUrl }
  }

  const generateAndDownloadBoardingContract = async (appointmentId: number) => {
    try {
      console.log("[v0] Starting PDF generation for appointment:", appointmentId)
      setIsGeneratingPDF(true)

      const response = await fetch("/api/client/appointments/generate-boarding-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ appointmentId }),
      })

      console.log("[v0] PDF generation response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] PDF data received, filename:", data.filename)

        // Convert base64 to blob and download
        const base64Data = data.pdf.split(",")[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "application/pdf" })

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log("[v0] PDF downloaded successfully")
        toast({
          title: "Contract Downloaded!",
          description: "Your boarding contract has been downloaded successfully.",
        })
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to generate boarding contract:", errorData)
        toast({
          title: "PDF Generation Failed",
          description: "Could not generate the boarding contract. Please contact support.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error generating boarding contract:", error)
      toast({
        title: "Error",
        description: "An error occurred while generating the contract.",
        variant: "destructive",
      })
    } finally {
      console.log("[v0] PDF generation complete, resetting state")
      setIsGeneratingPDF(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPets || selectedPets.length === 0 || !selectedService || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before booking.",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "GCash" && !receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload your GCash payment receipt to complete the booking.",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "PayMaya" && !receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload your PayMaya payment receipt to complete the booking.",
        variant: "destructive",
      })
      return
    }

    // Check terms agreement based on service type
    if (serviceType === "boarding") {
      if (!agreedToBoardingTerms) {
        toast({
          title: "Agreement Required",
          description: "Please read and agree to the Hotel Boarding Terms & Conditions.",
          variant: "destructive",
        })
        return
      }

      // Check ID and signature uploads
      if (!idFile) {
        toast({
          title: "ID Required",
          description: "Please upload your valid ID for boarding verification.",
          variant: "destructive",
        })
        return
      }

      if (!signatureFile) {
        toast({
          title: "Signature Required",
          description: "Please upload your signature to complete the boarding reservation.",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!agreedToTerms) {
        toast({
          title: "Agreement Required",
          description: "Please read and agree to the Terms & Conditions.",
          variant: "destructive",
        })
        return
      }
    }

    if (serviceType === "boarding") {
      if (!checkInDate || !checkOutDate || !selectedCage) {
        toast({
          title: "Missing Boarding Information",
          description: "Please select check-in/check-out dates and a cage for boarding service.",
          variant: "destructive",
        })
        return
      }

      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        toast({
          title: "Invalid Dates",
          description: "Check-out date must be after check-in date.",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!appointmentDate || !appointmentTime) {
        toast({
          title: "Missing Information",
          description: "Please select appointment date and time.",
          variant: "destructive",
        })
        return
      }
    }

    setShowConfirmation(true)
  }

  const handleConfirmBooking = async () => {
    try {
      setIsLoading(true)

      const selectedServiceData = services.find((service) => service.id.toString() === selectedService)
      if (!selectedServiceData) {
        toast({
          title: "Error",
          description: "Selected service not found.",
          variant: "destructive",
        })
        return
      }

      let totalAmount = selectedServiceData.price
      let appointmentStatus = "pending"

      if (serviceType === "boarding" && selectedCage) {
        const selectedCageData = availableCages.find((cage) => cage.id.toString() === selectedCage)
        if (selectedCageData) {
          totalAmount = selectedServiceData.price + selectedCageData.total_amount
        }
      }

      appointmentStatus = receiptFile ? "confirmed" : "pending payment"

      const appointmentData = {
        pet_ids: selectedPets.map((id) => Number.parseInt(id)),
        service_id: Number.parseInt(selectedService),
        appointment_date: serviceType === "boarding" ? checkInDate : appointmentDate,
        appointment_time: serviceType === "boarding" ? "09:00" : appointmentTime,
        notes: notes.trim() || null,
        payment_method: paymentMethod,
        payment_amount: totalAmount,
        ...(serviceType === "boarding" && {
          cage_id: selectedCage ? Number.parseInt(selectedCage) : null,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          boarding_days: calculateBoardingDays(),
          cage_rate: selectedCage ? availableCages.find((c) => c.id.toString() === selectedCage)?.daily_rate : null,
          boarding_instructions: boardingInstructions.trim() || null,
        }),
      }

      const response = await fetch("/api/client/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error("Failed to book appointment")
      }

      const result = await response.json()
      const appointmentId = result.appointment_id

      // Upload receipt if provided (for all payment methods)
      if (receiptFile) {
        const receiptFormData = new FormData()
        receiptFormData.append("receipt", receiptFile)
        receiptFormData.append("appointmentId", appointmentId.toString())

        const receiptResponse = await fetch("/api/client/appointments/upload-receipt", {
          method: "POST",
          credentials: "include",
          body: receiptFormData,
        })

        if (!receiptResponse.ok) {
          console.error("Failed to upload receipt")
          toast({
            title: "Receipt Upload Failed",
            description: "Could not upload your receipt.",
            variant: "destructive",
          })
        }
      }

      // Upload boarding documents if provided (for boarding services)
      if (serviceType === "boarding") {
        // Upload ID
        if (idFile) {
          const idFormData = new FormData()
          idFormData.append("id", idFile)
          idFormData.append("appointmentId", appointmentId.toString())

          const idResponse = await fetch("/api/client/appointments/upload-boarding-id", {
            method: "POST",
            credentials: "include",
            body: idFormData,
          })

          if (!idResponse.ok) {
            console.error("Failed to upload boarding ID")
            const errorData = await idResponse.json()
            toast({
              title: "ID Upload Failed",
              description: errorData.error || "Failed to upload boarding ID document",
              variant: "destructive",
            })
          }
        }

        // Upload signature
        if (signatureFile) {
          const signatureFormData = new FormData()
          signatureFormData.append("signature", signatureFile)
          signatureFormData.append("appointmentId", appointmentId.toString())

          const signatureResponse = await fetch("/api/client/appointments/upload-boarding-signature", {
            method: "POST",
            credentials: "include",
            body: signatureFormData,
          })

          if (!signatureResponse.ok) {
            console.error("Failed to upload boarding signature")
            const errorData = await signatureResponse.json()
            toast({
              title: "Signature Upload Failed",
              description: errorData.error || "Failed to upload boarding signature document",
              variant: "destructive",
            })
          }
        }

        console.log("[v0] Calling generateAndDownloadBoardingContract for appointment:", appointmentId)
        await generateAndDownloadBoardingContract(appointmentId)
      }

      toast({
        title: "Success",
        description: `Appointment booked successfully for ${selectedPets.length} pet${selectedPets.length > 1 ? 's' : ''}!`,
      })

      // Reset form
      setSelectedPets([])
      setSelectedService("")
      setAppointmentDate("")
      setAppointmentTime("")
      setNotes("")
      setPaymentMethod("GCash")
      setReceiptFile(null)
      setReceiptPreview(null)
      setAgreedToTerms(false)
      setAgreedToBoardingTerms(false)
      setIdFile(null)
      setIdPreview(null)
      setSignatureFile(null)
      setSignaturePreview(null)
      setBoardingInstructions("")
      setCheckInDate("")
      setCheckOutDate("")
      setSelectedCage("")

      router.push("/client/appointments")
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmation(false)
    }
  }

  const selectedPetsData = pets.filter((pet) => selectedPets.includes(pet.id.toString()))
  const selectedServiceData = services.find((service) => service.id.toString() === selectedService)
  const selectedCageData = availableCages.find((cage) => cage.id.toString() === selectedCage)

  const formatPrice = (price: any): string => {
    const numPrice = Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  const calculateTotalAmount = (): number => {
    if (!selectedServiceData) return 0
    let total = selectedServiceData.price

    if (serviceType === "boarding" && selectedCageData) {
      total += selectedCageData.total_amount
    }

    // If multiple pets are selected for a service, multiply the total amount by the number of pets
    if (selectedPets.length > 1) {
      total *= selectedPets.length
    }

    return total
  }

  const calculateBoardingDays = (): number => {
    if (!checkInDate || !checkOutDate) return 0
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCageTypeLabel = (type: string): string => {
    const labels = {
      small: "Small",
      medium: "Medium",
      large: "Large",
      extra_large: "Extra Large",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getCageTypeIcon = (type: string): string => {
    const icons = {
      small: "🐱",
      medium: "🐕",
      large: "🐕‍🦺",
      extra_large: "🐶",
    }
    return icons[type as keyof typeof icons] || "🏠"
  }

  const getExpectedStatus = (): string => {
    // Removed cash payment logic
    if (paymentMethod === "GCash") {
      return receiptFile ? "Confirmed (awaiting payment verification)" : "Pending Payment"
    } else if (paymentMethod === "PayMaya") {
      return receiptFile ? "Confirmed (awaiting payment verification)" : "Pending Payment"
    }
    return "Pending"
  }

  const getConfirmationMessage = () => {
    if (!selectedPetsData || selectedPetsData.length === 0 || !selectedServiceData) return ""

    const totalAmount = calculateTotalAmount()
    const expectedStatus = getExpectedStatus()

    let message = `Please confirm your ${serviceType === "boarding" ? "boarding reservation" : "appointment booking"}:

Pets: ${selectedPetsData.map(p => p.name).join(', ')}`

    if (serviceType === "boarding" && selectedCageData) {
      message += `

BOARDING DETAILS:
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Duration: ${calculateBoardingDays()} days
Cage: ${selectedCageData.cage_number} (${getCageTypeLabel(selectedCageData.cage_type)})
Cage Rate: ₱${formatPrice(selectedCageData.daily_rate)}/day
Boarding Cost: ₱${formatPrice(selectedCageData.total_amount)}

DOCUMENTS:
ID: ${idFile ? `✓ ${idFile.name}` : "Not uploaded"}
Signature: ${signatureFile ? `✓ ${signatureFile.name}` : "Not uploaded"}

📄 A boarding contract PDF will be automatically generated and downloaded after confirmation.`
    } else {
      message += `
Date: ${new Date(appointmentDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
Time: ${appointmentTime}
Duration: ${selectedServiceData.duration} minutes`
    }

    message += `

Service Price: ₱${formatPrice(selectedServiceData.price)}${selectedPets.length > 1 ? ` x ${selectedPets.length} pets` : ''}
${serviceType === "boarding" && selectedCageData ? `Boarding Cost: ₱${formatPrice(selectedCageData.total_amount)}\n` : ''}Total Amount: ₱${formatPrice(totalAmount)}
Payment Method: ${paymentMethod.toUpperCase()}
Expected Status: ${expectedStatus}`

    if (notes) {
      message += `
Notes: ${notes}`
    }

    if (serviceType === "boarding" && boardingInstructions) {
      message += `
Boarding Instructions: ${boardingInstructions}`
    }

    if (receiptFile) {
      message += `
Receipt: ${receiptFile.name}`
    }

    return message
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "PayMaya":
      case "GCash":
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getCageSizeRecommendation = (petSize: string, cageType: string): string => {
    const petSizeOrder = { small: 1, medium: 2, large: 3, extra_large: 4 }
    const petOrder = petSizeOrder[petSize as keyof typeof petSizeOrder] || 2
    const cageTypeOrder = { small: 1, medium: 2, large: 3, extra_large: 4 }
    const cageOrder = cageTypeOrder[cageType as keyof typeof cageTypeOrder] || 2

    if (cageOrder === petOrder) return "Perfect fit"
    if (cageOrder > petOrder) return "Spacious"
    return "Tight fit"
  }

  const togglePetSelection = (petId: string) => {
    setSelectedPets((prev) => {
      if (prev.includes(petId)) {
        return prev.filter((id) => id !== petId)
      } else {
        return [...prev, petId]
      }
    })
  }

  // Removed isBookingEnabled function as we'll validate on click instead
  
  console.log("Render - Pets:", pets.length, "Services:", services.length)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/client/appointments">Appointments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Book Appointment</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col">
        <div className="border-b">
          <div className="container max-w-7xl mx-auto px-6 py-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-balance mb-3">
                Book an Appointment
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Schedule a veterinary visit or boarding reservation for your beloved pets. Select multiple pets for group bookings.
              </p>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Select Service Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs 
                    value={serviceType} 
                    onValueChange={(value) => setServiceType(value as "regular" | "boarding")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/30">
                      <TabsTrigger 
                        value="regular" 
                        className="flex items-center gap-2 py-3 data-[state=active]:bg-black data-[state=active]:text-white"
                      >
                        <Stethoscope className="h-4 w-4" />
                        <span className="font-medium">Regular Services</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="boarding" 
                        className="flex items-center gap-2 py-3 data-[state=active]:bg-black data-[state=active]:text-white"
                      >
                        <Home className="h-4 w-4" />
                        <span className="font-medium">Boarding Services</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="regular" className="space-y-6 mt-6">
                      <Alert className="border-primary/50 bg-primary/5">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-primary">
                          Book regular veterinary services like checkups, vaccinations, grooming, and treatments.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="pet">Select Pet(s) *</Label>
                        {pets && pets.length > 0 ? (
                          <div className="space-y-2 border rounded-md p-4">
                            {pets.map((pet) => (
                              <div key={pet.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`pet-${pet.id}`}
                                  checked={selectedPets.includes(pet.id.toString())}
                                  onCheckedChange={() => togglePetSelection(pet.id.toString())}
                                />
                                <label
                                  htmlFor={`pet-${pet.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {pet.name} ({pet.species} - {pet.breed})
                                </label>
                              </div>
                            ))}
                            {selectedPets.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {selectedPets.length} pet{selectedPets.length > 1 ? 's' : ''} selected
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-muted-foreground border border-dashed rounded-md">
                            No pets found. Please add a pet first.
                          </div>
                        )}
                      </div>

                      {/* Also update regular services dropdown for consistency */}
                      {services && services.length > 0 ? (
                        <div className="space-y-2">
                          <Label htmlFor="service-regular">Select Service *</Label>
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a service" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem 
                                  key={service.id} 
                                  value={service.id.toString()}
                                >
                                  {service.name} - ₱{formatPrice(service.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedServiceData && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                              <div className="text-sm font-medium text-gray-900">
                                {selectedServiceData.name} - ₱{formatPrice(selectedServiceData.price)}
                              </div>
                              {selectedServiceData.description && (
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  {selectedServiceData.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-600">
                                Duration: {selectedServiceData.duration} minutes
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-muted-foreground border border-dashed rounded-md">
                          No regular services available at the moment.
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="date">Appointment Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Appointment Time *</Label>
                        <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="09:30">9:30 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="10:30">10:30 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="11:30">11:30 AM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="13:30">1:30 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="14:30">2:30 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="15:30">3:30 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                            <SelectItem value="16:30">4:30 PM</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* General Terms & Conditions */}
                      <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-amber-600" />
                          <h4 className="font-semibold text-amber-900">Terms & Conditions</h4>
                        </div>

                        <div
                          ref={termsScrollRef}
                          onScroll={handleTermsScroll}
                          className="space-y-3 text-sm text-amber-800 max-h-64 overflow-y-auto border border-amber-200 bg-white p-3 rounded"
                        >
                          <div>
                            <strong>1️⃣ Health & Safety</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ My pet is fully vaccinated and free from fleas, ticks, parasites, and contagious
                                diseases.
                              </p>
                              <p>
                                ☑ I confirm my pet has no severe medical conditions that require immediate or intensive
                                care.
                              </p>
                              <p>
                                ☑ I understand that Peppa Pets is not liable for any pre-existing medical conditions
                                that may worsen during my pet's visit.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>2️⃣ Behavior & Special Handling</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I confirm my pet does not have a history of aggression toward humans or other animals.
                              </p>
                              <p>
                                ☑ If my pet exhibits aggressive behavior, I understand Peppa Pets may require special
                                handling procedures or reschedule the appointment for safety reasons.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>3️⃣ Liability & Emergency Vet Care</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ In case of a medical emergency during the appointment, I authorize Peppa Pets to
                                provide necessary emergency care.
                              </p>
                              <p>
                                ☑ I accept full financial responsibility for all veterinary costs incurred during my
                                pet's appointment.
                              </p>
                              <p>
                                ☑ Peppa Pets is not liable for injuries, accidents, or illnesses that may occur during
                                the appointment.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>4️⃣ Personal Belongings</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I understand that Peppa Pets is not responsible for any lost or damaged personal
                                belongings (toys, leashes, carriers, etc.).
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>5️⃣ Fees & Additional Charges</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I agree to pay all applicable fees at the time of service, including any additional
                                charges for special procedures or medications.
                              </p>
                              <p>
                                ☑ Payment is due at the time of service. I understand that unpaid balances may affect
                                future appointment scheduling.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>7️⃣ Cancellation & No-Show Policy</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I acknowledge that cancellations must be made at least 24 hours before the scheduled
                                appointment to avoid charges.
                              </p>
                              <p>
                                ☑ I understand that no-shows or late cancellations may be subject to a cancellation fee
                                of up to 50% of the service cost.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                          <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                            disabled={!hasScrolledTerms}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="terms"
                              className={`text-sm font-medium leading-none ${
                                hasScrolledTerms ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                              } peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
                            >
                              I have read and agree to the Terms & Conditions *
                            </label>
                            <p className="text-xs text-amber-700">
                              {hasScrolledTerms
                                ? "By checking this box, you acknowledge that you have read, understood, and agree to abide by all terms and conditions listed above."
                                : "Please scroll through all the terms and conditions above to enable this checkbox."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="boarding" className="space-y-6 mt-6">
                      <Alert className="border-primary/50 bg-primary/5">
                        <Home className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-primary">
                          Book a comfortable stay for your pet with our boarding services. Includes daily care, feeding,
                          and accommodation.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="pet-boarding">Select Pet(s) *</Label>
                        {pets && pets.length > 0 ? (
                          <div className="space-y-2 border rounded-md p-4">
                            {pets.map((pet) => (
                              <div key={pet.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`pet-boarding-${pet.id}`}
                                  checked={selectedPets.includes(pet.id.toString())}
                                  onCheckedChange={() => togglePetSelection(pet.id.toString())}
                                />
                                <label
                                  htmlFor={`pet-boarding-${pet.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {pet.name} ({pet.species} - {pet.breed})
                                </label>
                              </div>
                            ))}
                            {selectedPets.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {selectedPets.length} pet{selectedPets.length > 1 ? 's' : ''} selected
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-muted-foreground border border-dashed rounded-md">
                            No pets found. Please add a pet first.
                          </div>
                        )}
                      </div>

                      {/* Simplify SelectItem to show only service name and price in trigger, with description visible only in dropdown menu and info card below */}
                      {boardingServices && boardingServices.length > 0 ? (
                        <div className="space-y-2">
                          <Label htmlFor="service-boarding">Select Boarding Service *</Label>
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a boarding service" />
                            </SelectTrigger>
                            <SelectContent>
                              {boardingServices.map((service) => (
                                <SelectItem 
                                  key={service.id} 
                                  value={service.id.toString()}
                                >
                                  {service.name} - ₱{formatPrice(service.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedServiceData && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                              <div className="text-sm font-medium text-gray-900">
                                {selectedServiceData.name} - ₱{formatPrice(selectedServiceData.price)}
                              </div>
                              {selectedServiceData.description && (
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  {selectedServiceData.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-600">
                                Duration: {selectedServiceData.duration} minutes
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-muted-foreground border border-dashed rounded-md">
                          No boarding services available at the moment.
                        </div>
                      )}

                      {selectedPetsData.length > 0 && (
                        <Alert className="border-info/50 bg-info/5">
                          <Info className="h-4 w-4 text-info" />
                          <AlertDescription className="text-info">
                            Your pets {selectedPetsData.map(p => p.name).join(', ')} ({selectedPetsData.map(p => p.species).join(', ')}) are classified
                            as <strong>{getCageTypeLabel(getPetSize(selectedPetsData[0])).split(" ")[0]}</strong> size. You
                            can choose any cage size, but we recommend appropriate sizing for your pet's comfort.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="checkin">Check-in Date *</Label>
                          <Input
                            id="checkin"
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkout">Check-out Date *</Label>
                          <Input
                            id="checkout"
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate || new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </div>

                      {checkInDate && checkOutDate && (
                        <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded-lg">
                          <strong>Duration:</strong> {calculateBoardingDays()} days
                        </div>
                      )}

                      {checkInDate && checkOutDate && (
                        <div className="space-y-3">
                          <Label>Available Cages - All Sizes *</Label>
                          <p className="text-xs text-gray-600">
                            All available cages are shown. Choose the size that best fits your pet's needs.
                          </p>
                          {isCheckingCages ? (
                            <div className="p-3 text-center text-muted-foreground">Checking cage availability...</div>
                          ) : availableCages.length > 0 ? (
                            <div className="grid gap-3">
                              {availableCages.map((cage) => {
                                const petSize = selectedPetsData.length > 0 ? getPetSize(selectedPetsData[0]) : "medium"
                                const recommendation = getCageSizeRecommendation(petSize, cage.cage_type)
                                const isRecommended = recommendation === "Perfect fit"
                                const isSpacious = recommendation === "Spacious"

                                return (
                                  <div
                                    key={cage.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedCage === cage.id.toString()
                                        ? "border-blue-500 bg-blue-50"
                                        : isRecommended
                                          ? "border-green-300 bg-green-50 hover:border-green-400"
                                          : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() => setSelectedCage(cage.id.toString())}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{getCageTypeIcon(cage.cage_type)}</span>
                                        <div>
                                          <div className="font-medium flex items-center gap-2">
                                            Cage {cage.cage_number} - {getCageTypeLabel(cage.cage_type)}
                                            {isRecommended && (
                                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Recommended
                                              </span>
                                            )}
                                            {isSpacious && (
                                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Spacious
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-600">{cage.description}</div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            For your pet: <strong>{recommendation}</strong>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">₱{formatPrice(cage.daily_rate)}/day</div>
                                        <div className="text-sm text-gray-600">
                                          Total: ₱{formatPrice(cage.total_amount)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <Alert className="border-destructive/50 bg-destructive/5">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <AlertDescription className="text-destructive">
                                No cages available for the selected dates. Please try different dates.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="boarding-instructions">Special Instructions for Boarding</Label>
                        <Textarea
                          id="boarding-instructions"
                          placeholder="Any special care instructions, feeding requirements, medications, etc..."
                          value={boardingInstructions}
                          onChange={(e) => setBoardingInstructions(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Hotel Boarding Terms & Conditions */}
                      <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-amber-600" />
                          <h4 className="font-semibold text-amber-900">Hotel Boarding Terms & Conditions</h4>
                        </div>

                        <div
                          ref={boardingTermsScrollRef}
                          onScroll={handleBoardingTermsScroll}
                          className="space-y-3 text-sm text-amber-800 max-h-64 overflow-y-auto border border-amber-200 bg-white p-3 rounded"
                        >
                          <div>
                            <strong>1️⃣ Health & Safety</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ My pet is fully vaccinated and free from fleas, ticks, parasites, and contagious
                                diseases.
                              </p>
                              <p>
                                ☑ I confirm my pet has no severe medical conditions that require immediate or intensive
                                care.
                              </p>
                              <p>
                                ☑ I understand that Peppa Pets is not liable for any pre-existing medical conditions
                                that may worsen during my pet's stay.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>2️⃣ Behavior & Special Handling</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I confirm my pet does not have a history of aggression toward humans or other animals.
                              </p>
                              <p>
                                ☑ If my pet exhibits aggressive behavior, I understand Peppa Pets may relocate my pet to
                                a special care area (₱500/night fee applies) or require early pick-up.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>3️⃣ Liability & Emergency Vet Care</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ In case of a medical emergency, I authorize Peppa Pets to transport my pet to their
                                partner veterinary clinic.
                              </p>
                              <p>
                                ☑ I accept full financial responsibility for all veterinary costs incurred during my
                                pet's stay.
                              </p>
                              <p>
                                ☑ Peppa Pets is not liable for injuries, accidents, or illnesses that may occur during
                                boarding.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>4️⃣ Personal Belongings</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I understand that Peppa Pets is not responsible for any lost or damaged personal
                                belongings (toys, beds, leashes, etc.).
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>5️⃣ Fees & Additional Charges</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I agree to pay all applicable fees before check-out, including late check-out fees,
                                special care charges, and additional services.
                              </p>
                              <p>
                                ☑ I understand that late pickup after the scheduled check-out time will incur a penalty
                                fee of ₱500.00 per occurrence.
                              </p>
                              <p>
                                ☑ If my pet is not picked up within 48 hours of the scheduled check-out date, I
                                acknowledge Peppa Pets reserves the right to take legal action and rehome the pet if
                                necessary.
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>7️⃣ Cancellation & No-Show Policy</strong>
                            <div className="text-xs mt-1 space-y-1">
                              <p>
                                ☑ I acknowledge that cancellations must be made at least 24 hours before check-in to
                                avoid charges.
                              </p>
                              <p>☑ I understand that no-shows will be charged one full night's stay.</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                          <Checkbox
                            id="boarding-terms"
                            checked={agreedToBoardingTerms}
                            onCheckedChange={(checked) => setAgreedToBoardingTerms(checked as boolean)}
                            disabled={!hasScrolledBoardingTerms}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="boarding-terms"
                              className={`text-sm font-medium leading-none ${
                                hasScrolledBoardingTerms ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                              } peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
                            >
                              I have read and agree to the Hotel Boarding Terms & Conditions *
                            </label>
                            <p className="text-xs text-amber-700">
                              {hasScrolledBoardingTerms
                                ? "By checking this box, you acknowledge that you have read, understood, and agree to abide by all boarding terms and conditions listed above."
                                : "Please scroll through all the boarding terms and conditions above to enable this checkbox."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ID and Signature Upload Section */}
                      {agreedToBoardingTerms && (
                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <IdCard className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900">Required Documents for Boarding</h4>
                          </div>
                          <p className="text-sm text-blue-800">
                            Please upload the following documents to complete your boarding reservation:
                          </p>

                          {/* ID Upload */}
                          <div className="space-y-2">
                            <Label htmlFor="id-upload" className="flex items-center gap-2">
                              <IdCard className="h-4 w-4" />
                              Valid Government-Issued ID *{" "}
                              {idFile && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </Label>
                            <div className="space-y-2">
                              <Input
                                id="id-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleIdUpload}
                                disabled={isUploadingId}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              <p className="text-xs text-blue-600">
                                Upload a clear photo of your valid government-issued ID (Driver's License, Passport,
                                National ID, etc.)
                              </p>
                            </div>

                            {isUploadingId && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Uploading ID...
                              </div>
                            )}

                            {idPreview && (
                              <div className="relative inline-block">
                                <img
                                  src={idPreview || "/placeholder.svg"}
                                  alt="ID preview"
                                  className="w-full max-w-xs h-auto rounded-lg border border-blue-300"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setIdFile(null)
                                    setIdPreview(null)
                                  }}
                                >
                                  Remove
                                </Button>
                                {idFile && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {idFile.name} ({(idFile.size / 1024).toFixed(2)} KB)
                                  </p>
                                )}
                              </div>
                            )}

                            {!idPreview && (
                              <div className="w-full max-w-xs h-32 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-white">
                                <div className="text-center">
                                  <IdCard className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                  <p className="text-sm text-blue-600">Upload your ID</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Signature Upload */}
                          <div className="space-y-2">
                            <Label htmlFor="signature-upload" className="flex items-center gap-2">
                              <PenTool className="h-4 w-4" />
                              Signature * {signatureFile && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </Label>
                            <div className="space-y-2">
                              <Input
                                id="signature-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleSignatureUpload}
                                disabled={isUploadingSignature}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              <p className="text-xs text-blue-600">
                                Upload a clear image of your signature (you can sign on white paper and take a photo)
                              </p>
                            </div>

                            {isUploadingSignature && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Uploading Signature...
                              </div>
                            )}

                            {signaturePreview && (
                              <div className="relative inline-block">
                                <img
                                  src={signaturePreview || "/placeholder.svg"}
                                  alt="Signature preview"
                                  className="w-full max-w-xs h-auto rounded-lg border border-blue-300 bg-white"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    setSignatureFile(null)
                                    setSignaturePreview(null)
                                  }}
                                >
                                  Remove
                                </Button>
                                {signatureFile && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {signatureFile.name} ({(signatureFile.size / 1024).toFixed(2)} KB)
                                  </p>
                                )}
                              </div>
                            )}

                            {!signaturePreview && (
                              <div className="w-full max-w-xs h-32 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-white">
                                <div className="text-center">
                                  <PenTool className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                  <p className="text-sm text-blue-600">Upload your signature</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <Alert className="border-info/50 bg-info/5">
                            <Info className="h-4 w-4 text-info" />
                            <AlertDescription className="text-info">
                              These documents are required for security purposes and to verify pet ownership. Your
                              information will be kept confidential and used only for boarding verification.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Common fields for both service types */}
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Method *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCash">GCash</SelectItem>
                        <SelectItem value="PayMaya">PayMaya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "PayMaya" && (
                    <div className="mt-4 space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">PayMaya Payment Instructions</h3>
                      </div>

                      <div className="space-y-2 text-sm text-green-800">
                        <p>
                          <strong>PayMaya Number:</strong> 0929-494-4937
                        </p>
                        <p>
                          <strong>Account Name:</strong> Pawpal Veterinary Clinic
                        </p>

                        <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900">Scan QR Code to Pay</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <img
                                src="/paymaya-qr-code.jpg"
                                alt="PayMaya QR Code for 0929-494-4937"
                                className="w-44 h-44 object-contain"
                              />
                            </div>
                            <p className="text-xs text-center text-green-700">
                              Scan this QR code with your PayMaya app to send payment directly to our account
                            </p>
                            <div className="text-center">
                              <p className="text-sm font-medium text-green-800">0929-494-4937</p>
                              <p className="text-xs text-green-600">Pawpal Veterinary Clinic</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 space-y-2">
                          <Label htmlFor="receipt">Upload Payment Receipt *</Label>
                          <Input
                            id="receipt"
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptUpload}
                            className="cursor-pointer"
                          />
                          {receiptFile && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Receipt uploaded: {receiptFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "GCash" && (
                    <div className="mt-4 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">GCash Payment Instructions</h3>
                      </div>

                      <div className="space-y-2 text-sm text-blue-800">
                        <p>
                          <strong>GCash Number:</strong> 0929-494-4937
                        </p>
                        <p>
                          <strong>Account Name:</strong> Pawpal Veterinary Clinic
                        </p>

                        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Scan QR Code to Pay</span>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <img
                                src="/GCash-qr-code.jpg"
                                alt="GCash QR Code for 0929-494-4937"
                                className="w-44 h-44 object-contain"
                              />
                            </div>
                            <p className="text-xs text-center text-blue-700">
                              Scan this QR code with your GCash app to send payment directly to our account
                            </p>
                            <div className="text-center">
                              <p className="text-sm font-medium text-blue-800">0929-494-4937</p>
                              <p className="text-xs text-blue-600">Pawpal Veterinary Clinic</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 space-y-2">
                          <Label htmlFor="receipt">Upload Payment Receipt *</Label>
                          <Input
                            id="receipt"
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptUpload}
                            className="cursor-pointer"
                          />
                          {receiptFile && (
                            <p className="text-sm text-blue-600 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Receipt uploaded: {receiptFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or concerns about your pet..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Removed disabled condition and use onClick validation */}
                  {serviceType === "boarding" ? (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full mt-6"
                      disabled={isLoading || isGeneratingPDF}
                    >
                      {isLoading ? "Processing..." : "Reserve Boarding"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Book Appointment"}
                    </Button>
                  )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  {serviceType === "boarding" ? <Home className="h-5 w-5 text-primary" /> : <Calendar className="h-5 w-5 text-primary" />}
                  {serviceType === "boarding" ? "Boarding Summary" : "Appointment Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPetsData.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PawPrint className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Pet Information</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      <strong>{selectedPetsData.map(p => p.name).join(', ')}</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedPetsData.map(p => p.species).join(', ')} - {selectedPetsData.map(p => p.breed).join(', ')}
                    </p>
                    {serviceType === "boarding" && (
                      <p className="text-xs text-blue-600 mt-1">
                        Recommended Size: {getCageTypeLabel(getPetSize(selectedPetsData[0])).split(" ")[0]}
                      </p>
                    )}
                  </div>
                )}

                {selectedServiceData && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Service Details</span>
                    </div>
                    <p className="text-sm text-green-800">
                      <strong>{selectedServiceData.name}</strong>
                    </p>
                    <p className="text-sm text-green-700">{selectedServiceData.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {serviceType === "regular" && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-700">{selectedServiceData.duration} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-700">₱{formatPrice(selectedServiceData.price)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {serviceType === "boarding" && selectedCageData && checkInDate && checkOutDate && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-900">Boarding Details</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-purple-800">
                        <strong>Check-in:</strong> {checkInDate}
                      </p>
                      <p className="text-purple-800">
                        <strong>Check-out:</strong> {checkOutDate}
                      </p>
                      <p className="text-purple-800">
                        <strong>Duration:</strong> {calculateBoardingDays()} days
                      </p>
                      <p className="text-purple-800">
                        <strong>Cage:</strong> {selectedCageData.cage_number} (
                        {getCageTypeLabel(selectedCageData.cage_type)})
                      </p>
                      <p className="text-purple-700">
                        <strong>Rate:</strong> ₱{formatPrice(selectedCageData.daily_rate)}/day
                      </p>
                      {selectedPetsData.length > 0 && (
                        <p className="text-xs text-purple-600 mt-2">
                          <strong>Fit:</strong>{" "}
                          {getCageSizeRecommendation(getPetSize(selectedPetsData[0]), selectedCageData.cage_type)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {serviceType === "regular" && appointmentDate && appointmentTime && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-900">Schedule</span>
                    </div>
                    <p className="text-sm text-purple-800">
                      <strong>
                        {new Date(appointmentDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>
                    </p>
                    <p className="text-sm text-purple-700">at {appointmentTime}</p>
                  </div>
                )}

                {paymentMethod && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getPaymentMethodIcon(paymentMethod)}
                      <span className="font-medium text-orange-900">Payment & Status</span>
                    </div>
                    <p className="text-sm text-orange-800">
                      <strong>{paymentMethod.toUpperCase()}</strong>
                    </p>
                    <p className="text-xs text-orange-700 mt-1">Expected Status: {getExpectedStatus()}</p>
                    {receiptFile && <p className="text-xs text-green-700 mt-1">Receipt: {receiptFile.name}</p>}
                  </div>
                )}

                {serviceType === "boarding" && agreedToBoardingTerms && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Boarding Requirements</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-green-700">✓ Terms & Conditions Agreed</p>
                      {idFile && (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <IdCard className="h-3 w-3" /> ID Uploaded: {idFile.name}
                        </p>
                      )}
                      {signatureFile && (
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <PenTool className="h-3 w-3" /> Signature Uploaded: {signatureFile.name}
                        </p>
                      )}
                      {(!idFile || !signatureFile) && (
                        <p className="text-xs text-amber-700 mt-2">
                          ⚠️ Please upload {!idFile && "ID"}
                          {!idFile && !signatureFile && " and "}
                          {!signatureFile && "signature"} to enable booking
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {serviceType === "regular" && agreedToTerms && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Terms Agreed</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">✓ General Terms & Conditions</p>
                  </div>
                )}

                {serviceType === "boarding" && !agreedToBoardingTerms && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Action Required</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Please agree to the Hotel Boarding Terms & Conditions to proceed.
                    </p>
                  </div>
                )}

                {serviceType === "regular" && !agreedToTerms && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Action Required</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Please agree to the Terms & Conditions to proceed.
                    </p>
                  </div>
                )}

                {serviceType === "boarding" && agreedToBoardingTerms && !idFile && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please upload your valid ID to complete the boarding reservation.
                    </p>
                  </div>
                )}

                {serviceType === "boarding" && agreedToBoardingTerms && !signatureFile && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please upload your signature to complete the boarding reservation.
                    </p>
                  </div>
                )}

                {serviceType === "boarding" && !selectedCage && checkInDate && checkOutDate && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please select an available cage for your pet's boarding.
                    </p>
                  </div>
                )}

                {serviceType === "boarding" && !checkInDate && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please select a check-in date for boarding.
                    </p>
                  </div>
                )}

                {serviceType === "boarding" && !checkOutDate && checkInDate && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please select a check-out date for boarding.
                    </p>
                  </div>
                )}

                {serviceType === "regular" && !appointmentDate && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please select an appointment date.
                    </p>
                  </div>
                )}

                {serviceType === "regular" && !appointmentTime && appointmentDate && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please select an appointment time.
                    </p>
                  </div>
                )}

                {(paymentMethod === "GCash" || paymentMethod === "PayMaya") && !receiptFile && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Action Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Please upload your payment receipt to confirm your booking.
                    </p>
                  </div>
                )}

                {serviceType === "boarding" && selectedCageData && (
                  <div className="p-3 bg-gray-50 rounded-lg border-t-2 border-gray-300">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Service Price:</span>
                        <span className="text-sm font-medium">₱{formatPrice(selectedServiceData?.price || 0)}</span>
                      </div>
                      {selectedPets.length > 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Additional Pets:</span>
                          <span className="text-sm font-medium">₱{formatPrice(selectedServiceData?.price || 0 * (selectedPets.length - 1))}</span>
                        </div>
                      )}
                      {serviceType === "boarding" && selectedCageData && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Boarding Cost:</span>
                          <span className="text-sm font-medium">₱{formatPrice(selectedCageData.total_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-900">₱{formatPrice(calculateTotalAmount())}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {serviceType === "regular" && selectedServiceData && (
                  <div className="p-3 bg-gray-50 rounded-lg border-t-2 border-gray-300">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Service Price:</span>
                        <span className="text-sm font-medium">₱{formatPrice(selectedServiceData.price)}</span>
                      </div>
                      {selectedPets.length > 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Additional Pets:</span>
                          <span className="text-sm font-medium">₱{formatPrice(selectedServiceData.price * (selectedPets.length - 1))}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-900">₱{formatPrice(calculateTotalAmount())}</span>
                      </div>
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Notes</span>
                    </div>
                    <p className="text-sm text-yellow-800">{notes}</p>
                  </div>
                )}

                {serviceType === "boarding" && boardingInstructions && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Boarding Instructions</span>
                    </div>
                    <p className="text-sm text-yellow-800">{boardingInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {serviceType === "boarding" ? "Boarding Reservation" : "Appointment Booking"}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading || isGeneratingPDF}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking} disabled={isLoading || isGeneratingPDF}>
              {isLoading
                ? "Processing..."
                : isGeneratingPDF
                  ? "Generating..."
                  : serviceType === "boarding"
                    ? "Yes, Reserve Boarding"
                    : "Yes, Book Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  )
}
