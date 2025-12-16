"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CalendarIcon, PawPrint, PhilippinePeso, Home, FileText, AlertCircle, Stethoscope, Hotel, Phone, Copy, Check, Upload, X, FileCheck, Award as IdCard, PenTool, Info } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface Pet {
  id: number
  name: string
  species: string
}

interface Service {
  id: number
  name: string
  description: string
  price: number
  category: string
  category_name?: string
}

interface Cage {
  id: number
  cage_number: string
  cage_type: string
  daily_rate: number
  capacity: number
}

export default function PWABooking() {
  const router = useRouter()
  const { toast } = useToast()

  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [cages, setCages] = useState<Cage[]>([])

  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [selectedCage, setSelectedCage] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  // Boarding documents
  const [boardingIdFile, setBoardingIdFile] = useState<File | null>(null)
  const [boardingIdPreview, setBoardingIdPreview] = useState<string | null>(null)
  const [boardingSignatureFile, setBoardingSignatureFile] = useState<File | null>(null)
  const [boardingSignaturePreview, setBoardingSignaturePreview] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBoardingService, setIsBoardingService] = useState(false)
  const [isLoadingCages, setIsLoadingCages] = useState(false)
  const [serviceTab, setServiceTab] = useState("regular") // Declare serviceTab and setServiceTab

  // Payment details
  const paymentDetails = {
    gcash: {
      name: "GCash",
      number: "09123456789",
      qrCode: "/gcash.png",
    },
    paymaya: {
      name: "PayMaya",
      number: "09987654321",
      qrCode: "/paymaya.png",
    },
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const getMinCheckOutDate = () => {
    if (!checkInDate) return getTodayDate()
    const checkIn = new Date(checkInDate)
    checkIn.setDate(checkIn.getDate() + 1)
    return checkIn.toISOString().split("T")[0]
  }

  const calculateBoardingDays = (): number => {
    if (!checkInDate || !checkOutDate) return 0
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotalCost = (): number => {
    const service = services.find((s) => s.id.toString() === selectedService)
    const servicePrice = Number(service?.price) || 0
    let total = servicePrice

    if (isBoardingService && selectedCage) {
      const cage = cages.find((c) => c.id.toString() === selectedCage)
      const cageRate = Number(cage?.daily_rate) || 0
      const days = calculateBoardingDays()
      total += cageRate * days
    }

    return isNaN(total) ? 0 : total
  }

  const handleServiceChange = (value: string, isBoarding: boolean) => {
    setSelectedService(value)
    setIsBoardingService(isBoarding)
    setAcceptedTerms(false)
    setBoardingIdFile(null)
    setBoardingIdPreview(null)
    setBoardingSignatureFile(null)
    setBoardingSignaturePreview(null)

    if (!isBoarding) {
      setCheckInDate("")
      setCheckOutDate("")
      setSelectedCage("")
      setCages([])
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedNumber(true)
      toast({
        title: "Copied!",
        description: "Phone number copied to clipboard",
      })
      setTimeout(() => setCopiedNumber(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the number manually",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
    fileType: string,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image under 5MB",
          variant: "destructive",
        })
        return
      }

      setFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, setReceiptFile, setReceiptPreview, "receipt")
  }

  const handleBoardingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, setBoardingIdFile, setBoardingIdPreview, "boarding ID")
  }

  const handleBoardingSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, setBoardingSignatureFile, setBoardingSignaturePreview, "boarding signature")
  }

  const removeFile = (setFile: (file: File | null) => void, setPreview: (preview: string | null) => void) => {
    setFile(null)
    setPreview(null)
  }

  const uploadReceipt = async (appointmentId: number): Promise<boolean> => {
    if (!receiptFile) return true // No receipt to upload

    try {
      console.log("Uploading receipt for appointment:", appointmentId)
      const formData = new FormData()
      formData.append("receipt", receiptFile)
      formData.append("appointmentId", appointmentId.toString())

      const response = await fetch("/api/client/appointments/upload-receipt", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        console.log("Receipt uploaded successfully")
        return true
      } else {
        const error = await response.json()
        console.error("Receipt upload failed:", error)
        return false
      }
    } catch (error) {
      console.error("Error uploading receipt:", error)
      return false
    }
  }

  const uploadBoardingDocuments = async (appointmentId: number): Promise<boolean> => {
    if (!boardingIdFile || !boardingSignatureFile) {
      console.log("No boarding documents to upload")
      return true
    }

    try {
      console.log("Uploading boarding documents for appointment:", appointmentId)

      // Upload ID
      const idFormData = new FormData()
      idFormData.append("id", boardingIdFile)
      idFormData.append("appointmentId", appointmentId.toString())

      console.log("Uploading ID document...")
      const idResponse = await fetch("/api/client/appointments/upload-boarding-id", {
        method: "POST",
        credentials: "include",
        body: idFormData,
      })

      if (!idResponse.ok) {
        const idError = await idResponse.json()
        console.error("ID upload failed:", idError)
        throw new Error("Failed to upload ID")
      }

      console.log("ID uploaded successfully")

      // Upload Signature
      const signatureFormData = new FormData()
      signatureFormData.append("signature", boardingSignatureFile)
      signatureFormData.append("appointmentId", appointmentId.toString())

      console.log("Uploading signature document...")
      const signatureResponse = await fetch("/api/client/appointments/upload-boarding-signature", {
        method: "POST",
        credentials: "include",
        body: signatureFormData,
      })

      if (!signatureResponse.ok) {
        const signatureError = await signatureResponse.json()
        console.error("Signature upload failed:", signatureError)
        throw new Error("Failed to upload signature")
      }

      console.log("Signature uploaded successfully")
      return true
    } catch (error) {
      console.error("Error uploading boarding documents:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedPets.length === 0) {
      toast({
        title: "Pet Required",
        description: "Please select at least one pet",
        variant: "destructive",
      })
      return
    }

    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive",
      })
      return
    }

    if ((paymentMethod === " GCash" || paymentMethod === "paymaya") && !receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload your payment receipt",
        variant: "destructive",
      })
      return
    }

    if (isBoardingService && (!boardingIdFile || !boardingSignatureFile)) {
      toast({
        title: "Boarding Documents Required",
        description: "Please upload your ID and signature for boarding verification",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const totalCost = calculateTotalCost()

      const bookingData: any = {
        pet_ids: selectedPets.map(id => Number.parseInt(id)),
        service_id: Number.parseInt(selectedService),
        payment_method: paymentMethod,
        payment_amount: totalCost,
        notes,
      }

      if (isBoardingService) {
        bookingData.cage_id = Number.parseInt(selectedCage)
        bookingData.check_in_date = checkInDate
        bookingData.check_out_date = checkOutDate
        bookingData.boarding_days = calculateBoardingDays()
        const cage = cages.find((c) => c.id.toString() === selectedCage)
        bookingData.cage_rate = cage?.daily_rate || 0
        bookingData.appointment_date = checkInDate
        bookingData.appointment_time = "09:00:00"
      } else {
        bookingData.appointment_date = appointmentDate
        bookingData.appointment_time = appointmentTime
      }

      console.log("Creating appointment with data:", bookingData)

      const response = await fetch("/api/client/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Appointment created successfully:", result)

        const appointmentId = result.appointment_id

        // Upload receipt if available (for both regular and boarding)
        if (receiptFile) {
          console.log("Uploading receipt...")
          const receiptSuccess = await uploadReceipt(appointmentId)
          if (!receiptSuccess) {
            toast({
              title: "Warning",
              description: "Appointment booked but receipt upload failed. Please upload manually.",
              variant: "destructive",
            })
          }
        }

        // Upload boarding documents if boarding service
        if (isBoardingService && boardingIdFile && boardingSignatureFile) {
          console.log("Uploading boarding documents...")
          const boardingDocsSuccess = await uploadBoardingDocuments(appointmentId)
          if (!boardingDocsSuccess) {
            toast({
              title: "Warning",
              description: "Appointment booked but document upload failed. Please upload manually.",
              variant: "destructive",
            })
          }
        }

        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully booked.",
        })
        router.push("/pwa/appointments")
      } else {
        const error = await response.json()
        console.error("Booking failed:", error)
        toast({
          title: "Booking Failed",
          description: error.error || "Failed to book appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during booking:", error)
      toast({
        title: "Error",
        description: "An error occurred while booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch pets and services on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Fetching pets and services...")

        // Fetch pets
        const petsResponse = await fetch("/api/client/pets", {
          credentials: "include",
        })
        if (petsResponse.ok) {
          const petsData = await petsResponse.json()
          console.log("[v0] Pets data received:", petsData)
          setPets(Array.isArray(petsData) ? petsData : [])
        }

        // Fetch services
        const servicesResponse = await fetch("/api/client/services", {
          credentials: "include",
        })
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json()
          console.log("[v0] Services data received:", servicesData)
          setServices(Array.isArray(servicesData) ? servicesData : servicesData.services || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load booking data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Fetch available cages when check-in or check-out dates change
  useEffect(() => {
    const fetchAvailableCages = async () => {
      if (!isBoardingService || !checkInDate || !checkOutDate) {
        setCages([])
        return
      }

      setIsLoadingCages(true)
      try {
        const response = await fetch(
          `/api/client/cages/availability?check_in_date=${checkInDate}&check_out_date=${checkOutDate}`,
          {
            credentials: "include",
          },
        )

        if (response.ok) {
          const data = await response.json()
          setCages(data.cages || [])
        } else {
          setCages([])
          toast({
            title: "No Cages Available",
            description: "No cages available for selected dates",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching cages:", error)
        setCages([])
      } finally {
        setIsLoadingCages(false)
      }
    }

    fetchAvailableCages()
  }, [checkInDate, checkOutDate, isBoardingService, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const regularServices = services.filter((s) => {
    const category = s.category || s.category_name || ""
    return !category.toLowerCase().includes("boarding")
  })

  const boardingServices = services.filter((s) => {
    const category = s.category || s.category_name || ""
    return category.toLowerCase().includes("boarding")
  })

  const selectedPaymentDetails =
    paymentMethod === " GCash" ? paymentDetails.gcash : paymentMethod === "paymaya" ? paymentDetails.paymaya : null

  const isSubmitDisabled =
    isSubmitting ||
    !acceptedTerms ||
    !selectedService ||
    !paymentMethod ||
    selectedPets.length === 0 || // Ensure at least one pet is selected
    ((paymentMethod === " GCash" || paymentMethod === "paymaya") && !receiptFile) ||
    (isBoardingService && (!boardingIdFile || !boardingSignatureFile))

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Book Appointment</h1>
              <p className="text-xs text-blue-100">Schedule a service for your pet</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PawPrint className="w-5 h-5" />
                Select Pets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pets.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No pets found. Please add a pet first.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-3">Select one or more pets for this appointment:</p>
                  <div className="space-y-2">
                    {pets.map((pet) => (
                      <div key={pet.id} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id={`pet-${pet.id}`}
                          checked={selectedPets.includes(pet.id.toString())}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPets([...selectedPets, pet.id.toString()])
                            } else {
                              setSelectedPets(selectedPets.filter((id) => id !== pet.id.toString()))
                            }
                          }}
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={`pet-${pet.id}`}
                          className="flex-1 cursor-pointer text-sm font-medium leading-none"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-900">{pet.name}</span>
                              <span className="text-gray-500 ml-2">({pet.species})</span>
                            </div>
                            {selectedPets.includes(pet.id.toString()) && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedPets.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200 mt-3">
                      <p className="text-sm font-semibold text-blue-800 text-center">
                        {selectedPets.length} pet{selectedPets.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Service Selection with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Service</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={serviceTab} onValueChange={setServiceTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="regular" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Regular Services
                  </TabsTrigger>
                  <TabsTrigger value="boarding" className="flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    Boarding Services
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="regular" className="space-y-3">
                  <Select
                    value={!isBoardingService ? selectedService : ""}
                    onValueChange={(value) => handleServiceChange(value, false)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {regularServices.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-xs text-blue-600">₱{Number(service.price).toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService && !isBoardingService && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">
                        {services.find((s) => s.id.toString() === selectedService)?.description}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="boarding" className="space-y-3">
                  <Select
                    value={isBoardingService ? selectedService : ""}
                    onValueChange={(value) => handleServiceChange(value, true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a boarding service" />
                    </SelectTrigger>
                    <SelectContent>
                      {boardingServices.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-xs text-blue-600">₱{Number(service.price).toFixed(2)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService && isBoardingService && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">
                        {services.find((s) => s.id.toString() === selectedService)?.description}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Boarding Dates */}
          {isBoardingService && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Boarding Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Check-in Date</Label>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={getTodayDate()}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Check-out Date</Label>
                  <Input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={getMinCheckOutDate()}
                    required
                    className="w-full"
                    disabled={!checkInDate}
                  />
                </div>
                {checkInDate && checkOutDate && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Duration:</span>
                      <span className="text-sm font-bold text-blue-600">{calculateBoardingDays()} day(s)</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cage Selection */}
          {isBoardingService && checkInDate && checkOutDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Select Cage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCages ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading available cages...</p>
                  </div>
                ) : cages.length > 0 ? (
                  <Select value={selectedCage} onValueChange={setSelectedCage} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a cage" />
                    </SelectTrigger>
                    <SelectContent>
                      {cages.map((cage) => (
                        <SelectItem key={cage.id} value={cage.id.toString()}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {cage.cage_number} - {cage.cage_type}
                            </span>
                            <span className="text-xs text-blue-600">₱{Number(cage.daily_rate).toFixed(2)}/day</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">No available cages</p>
                    <p className="text-xs text-gray-500 mt-1">Try different dates</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Appointment Details for Regular Services */}
          {!isBoardingService && selectedService && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Date</Label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={getTodayDate()}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Time</Label>
                  <Select value={appointmentTime} onValueChange={setAppointmentTime} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00:00">11:00 AM</SelectItem>
                      <SelectItem value="13:00:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PhilippinePeso className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" GCash">GCash</SelectItem>
                  <SelectItem value="paymaya">PayMaya</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Details */}
              {selectedPaymentDetails && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="text-center mb-3">
                    <h3 className="font-bold text-lg text-gray-800">{selectedPaymentDetails.name} Payment</h3>
                    <p className="text-xs text-gray-600 mt-1">Scan QR code or send to number below</p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <div className="relative w-full aspect-square max-w-[250px] mx-auto">
                      <Image
                        src={selectedPaymentDetails.qrCode || "/placeholder.svg"}
                        alt={`${selectedPaymentDetails.name} QR Code`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="font-mono font-semibold text-gray-800">{selectedPaymentDetails.number}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent"
                        onClick={() => copyToClipboard(selectedPaymentDetails.number)}
                      >
                        {copiedNumber ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Receipt Upload */}
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Payment Receipt
                      <span className="text-red-500">*</span>
                    </Label>

                    {!receiptFile ? (
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptChange}
                          className="cursor-pointer"
                          id="receipt-upload"
                        />
                        <p className="text-xs text-gray-500 mt-2">Accepted: JPG, PNG (Max 5MB)</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Receipt Preview */}
                        <div className="relative">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={receiptPreview || "/placeholder.svg"}
                              alt="Receipt preview"
                              fill
                              className="object-contain bg-gray-50"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeFile(setReceiptFile, setReceiptPreview)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* File Info */}
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 truncate">{receiptFile.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{(receiptFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-gray-700 space-y-1">
                        <p className="font-semibold">Payment Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Send exact amount (₱{calculateTotalCost().toFixed(2)}) to the number above</li>
                          <li>Take a screenshot of your payment confirmation</li>
                          <li>Upload the receipt screenshot above</li>
                          <li>Your appointment will be verified within 24 hours</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Total Cost */}
          {selectedService && (
            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-700">Total Cost:</span>
                  <span className="text-2xl font-bold text-blue-600">₱{calculateTotalCost().toFixed(2)}</span>
                </div>
                {isBoardingService && checkInDate && checkOutDate && selectedCage && (
                  <div className="pt-2 border-t border-blue-200 space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service Fee:</span>
                      <span>
                        ₱{Number(services.find((s) => s.id.toString() === selectedService)?.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Boarding ({calculateBoardingDays()} days):</span>
                      <span>
                        ₱
                        {(
                          Number(cages.find((c) => c.id.toString() === selectedCage)?.daily_rate || 0) *
                          calculateBoardingDays()
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Terms & Conditions */}
          {selectedService && (
            <Card className="border-2 border-orange-400 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {isBoardingService ? "Boarding Terms & Conditions" : "Service Terms & Conditions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Read Full Terms
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>
                        {isBoardingService ? "Hotel Boarding Terms & Conditions" : "Service Terms & Conditions"}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      {isBoardingService ? (
                        <div className="space-y-4 text-sm">
                          <section>
                            <h3 className="font-semibold text-base mb-2">1️⃣ Health & Safety</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ My pet is fully vaccinated and free from fleas, ticks, parasites, and contagious
                                diseases.
                              </li>
                              <li>
                                ☑ I confirm my pet has no severe medical conditions that require immediate or intensive
                                care.
                              </li>
                              <li>
                                ☑ I understand that Peppa Pets is not liable for any pre-existing medical conditions
                                that may worsen during my pet's stay.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">2️⃣ Behavior & Special Handling</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I confirm my pet does not have a history of aggression toward humans or other animals.
                              </li>
                              <li>
                                ☑ If my pet exhibits aggressive behavior, I understand Peppa Pets may relocate my pet to
                                a special care area (₱500/night fee applies) or require early pick-up.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">3️⃣ Liability & Emergency Vet Care</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ In case of a medical emergency, I authorize Peppa Pets to transport my pet to their
                                partner veterinary clinic.
                              </li>
                              <li>
                                ☑ I accept full financial responsibility for all veterinary costs incurred during my
                                pet's stay.
                              </li>
                              <li>
                                ☑ Peppa Pets is not liable for injuries, accidents, or illnesses that may occur during
                                boarding.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">4️⃣ Personal Belongings</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I understand that Peppa Pets is not responsible for any lost or damaged personal
                                belongings (toys, beds, leashes, etc.).
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">5️⃣ Fees & Additional Charges</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I agree to pay all applicable fees before check-out, including late check-out fees,
                                special care charges, and additional services.
                              </li>
                              <li>
                                ☑ I acknowledge that late pickup after the scheduled check-out time will incur a penalty fee of ₱500.00 per occurrence.
                              </li>
                              <li>
                                ☑ If my pet is not picked up within 48 hours of the scheduled check-out date, I
                                acknowledge Peppa Pets reserves the right to take legal action and rehome the pet if
                                necessary.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">7️⃣ Cancellation & No-Show Policy</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I acknowledge that cancellations must be made at least 24 hours before check-in to
                                avoid charges.
                              </li>
                              <li>☑ I understand that no-shows will be charged one full night's stay.</li>
                            </ul>
                          </section>
                        </div>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <section>
                            <h3 className="font-semibold text-base mb-2">1️⃣ Health & Safety</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ My pet is fully vaccinated and free from fleas, ticks, parasites, and contagious
                                diseases.
                              </li>
                              <li>
                                ☑ I confirm my pet has no severe medical conditions that require immediate or intensive
                                care.
                              </li>
                              <li>
                                ☑ I understand that Peppa Pets is not liable for any pre-existing medical conditions
                                that may worsen during my pet's stay.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">2️⃣ Behavior & Special Handling</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I confirm my pet does not have a history of aggression toward humans or other animals.
                              </li>
                              <li>
                                ☑ If my pet exhibits aggressive behavior, I understand Peppa Pets may relocate my pet to
                                a special care area (₱500/night fee applies) or require early pick-up.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">3️⃣ Liability & Emergency Vet Care</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ In case of a medical emergency, I authorize Peppa Pets to transport my pet to their
                                partner veterinary clinic.
                              </li>
                              <li>
                                ☑ I accept full financial responsibility for all veterinary costs incurred during my
                                pet's stay.
                              </li>
                              <li>
                                ☑ Peppa Pets is not liable for injuries, accidents, or illnesses that may occur during
                                boarding.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">4️⃣ Personal Belongings</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I understand that Peppa Pets is not responsible for any lost or damaged personal
                                belongings (toys, beds, leashes, etc.).
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">5️⃣ Fees & Additional Charges</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I agree to pay all applicable fees before check-out, including late check-out fees,
                                special care charges, and additional services.
                              </li>
                              <li>
                                ☑ I acknowledge that late pickup after the scheduled check-out time will incur a penalty fee of ₱500.00 per occurrence.
                              </li>
                              <li>
                                ☑ If my pet is not picked up within 48 hours of the scheduled check-out date, I
                                acknowledge Peppa Pets reserves the right to take legal action and rehome the pet if
                                necessary.
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">7️⃣ Cancellation & No-Show Policy</h3>
                            <ul className="list-none pl-0 space-y-2">
                              <li>
                                ☑ I acknowledge that cancellations must be made at least 24 hours before check-in to
                                avoid charges.
                              </li>
                              <li>☑ I understand that no-shows will be charged one full night's stay.</li>
                            </ul>
                          </section>
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-orange-300">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer text-gray-700">
                    I have read and agree to the {isBoardingService ? "Boarding" : "Service"} Terms & Conditions
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Required Boarding Documents - Only shown after accepting boarding terms */}
          {isBoardingService && acceptedTerms && (
            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  Required Documents for Boarding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  Please upload the following documents to complete your boarding reservation:
                </p>

                {/* Valid Government-Issued ID */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    Valid Government-Issued ID
                    <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-blue-600">
                    Upload a clear photo of your valid government-issued ID (Driver's License, Passport, National ID,
                    etc.)
                  </p>

                  {!boardingIdFile ? (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white">
                      <div className="flex flex-col items-center justify-center">
                        <IdCard className="w-12 h-12 text-blue-400 mb-3" />
                        <Label
                          htmlFor="boarding-id-upload"
                          className="text-sm font-medium text-blue-600 cursor-pointer mb-2"
                        >
                          Upload your ID
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleBoardingIdChange}
                          className="cursor-pointer"
                          id="boarding-id-upload"
                        />
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-300">
                          <Image
                            src={boardingIdPreview || "/placeholder.svg"}
                            alt="ID preview"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeFile(setBoardingIdFile, setBoardingIdPreview)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700 truncate">{boardingIdFile.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{(boardingIdFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Signature */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Signature
                    <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-blue-600">
                    Upload a clear image of your signature (you can sign on white paper and take a photo)
                  </p>

                  {!boardingSignatureFile ? (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white">
                      <div className="flex flex-col items-center justify-center">
                        <PenTool className="w-12 h-12 text-blue-400 mb-3" />
                        <Label
                          htmlFor="boarding-signature-upload"
                          className="text-sm font-medium text-blue-600 cursor-pointer mb-2"
                        >
                          Upload your signature
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleBoardingSignatureChange}
                          className="cursor-pointer"
                          id="boarding-signature-upload"
                        />
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-300">
                          <Image
                            src={boardingSignaturePreview || "/placeholder.svg"}
                            alt="Signature preview"
                            fill
                            className="object-contain bg-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeFile(setBoardingSignatureFile, setBoardingSignaturePreview)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700 truncate">{boardingSignatureFile.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(boardingSignatureFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Notice */}
                <div className="flex gap-2 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    These documents are required for security purposes and to verify pet ownership. Your information
                    will be kept confidential and used only for boarding verification.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitDisabled}>
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </Button>

          {/* Warning Messages */}
          {!acceptedTerms && selectedService && (
            <div className="flex items-center gap-2 justify-center text-sm text-orange-600 pb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Please accept the terms to continue</span>
            </div>
          )}

          {(paymentMethod === " GCash" || paymentMethod === "paymaya") && !receiptFile && (
            <div className="flex items-center gap-2 justify-center text-sm text-red-600 pb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Please upload your payment receipt</span>
            </div>
          )}
        </form>
      </div>
    </>
  )
}
