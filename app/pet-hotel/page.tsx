"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Check } from "lucide-react"

export default function PetHotelPage() {
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showCageAvailability, setShowCageAvailability] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [selectedCage, setSelectedCage] = useState<number | null>(null)

  const [cages] = useState([
    { id: 1, name: "CAGE 1", occupied: true },
    { id: 2, name: "CAGE 2", occupied: false },
    { id: 3, name: "CAGE 3", occupied: false },
    { id: 4, name: "CAGE 4", occupied: false },
  ])

  const [formData, setFormData] = useState({
    // Pet Owner Information
    ownerName: "",
    contactNumber: "",
    emailAddress: "",
    emergencyContact: "",

    // Pet Information
    petName: "",
    breedSpecies: "",
    age: "",
    colorMarkings: "",
    microchip: "",
    gender: "",
    spayedNeutered: "",
    allergies: "",
    specialInstructions: "",

    // Health & Safety
    healthSafety1: false,
    healthSafety2: false,
    healthSafety3: false,

    // Behavior & Special Handling
    behavior1: false,
    behavior2: false,

    // Liability & Emergency Vet Care
    liability1: false,
    liability2: false,
    liability3: false,

    // Personal Belongings
    belongings: false,

    // Fees & Additional Charges
    fees: false,

    // Security Deposit
    deposit1: false,
    deposit2: false,

    // Cancellation & No-Show Policy
    cancellation1: false,
    cancellation2: false,

    // Late Pickup Policy
    latePickup: false,

    // Owner Consent
    ownerConsent: "",
    date: "",
    ownerSignature: "",
    checkInDate: "",
    checkOutDate: "",

    // Staff Use Only
    vaccinationRecords: "",
    securityDeposit: "",
    specialInstructionsNoted: "",
    petCheckedInBy: "",
  })

  const handleServiceSelect = (serviceName: string, size: string, price: number) => {
    setSelectedService(serviceName)
    setSelectedSize(size)
    setSelectedPrice(price)
  }

  const isSelected = (serviceName: string, size: string) => {
    return selectedService === serviceName && selectedSize === size
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    const requiredFields = [
      "ownerName",
      "contactNumber",
      "emailAddress",
      "emergencyContact",
      "petName",
      "breedSpecies",
      "age",
      "gender",
      "healthSafety1",
      "healthSafety2",
      "healthSafety3",
      "behavior1",
      "behavior2",
      "liability1",
      "liability2",
      "liability3",
      "belongings",
      "fees",
      "cancellation1",
      "cancellation2",
      "latePickup",
      "ownerConsent",
      "date",
      "ownerSignature",
      "checkInDate",
      "checkOutDate",
    ]

    return requiredFields.every((field) => {
      const value = formData[field as keyof typeof formData]
      return typeof value === "boolean" ? value : value.trim() !== ""
    })
  }

  const handleTermsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      setShowTermsModal(false)
    }
  }

  const handleCageSelect = (cageId: number, isOccupied: boolean) => {
    if (!isOccupied) {
      setSelectedCage(cageId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center text-2xl font-bold text-blue-600">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              Pawpal
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/pet-hotel" className="text-blue-600 font-semibold">
                Pet Hotel
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent">
              Login
            </Button>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">Register</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Pet Hotel
            <span className="text-blue-600"> Booking</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Safe and comfortable boarding facilities for your beloved pets
          </p>
        </div>

        {/* Hotel Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          <div className="space-y-6">
            {/* Standard Stay */}
            <div className="bg-blue-500 p-6 rounded-lg text-white">
              <div className="bg-cyan-400 text-blue-900 px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                STANDARD STAY
              </div>
              <p className="text-sm mb-4">Cozy Kennel Stay, Fresh Water, Daily Photo Update</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { size: "Small", price: 349 },
                  { size: "Large", price: 749 },
                  { size: "Medium", price: 549 },
                  { size: "X-large", price: 949 },
                ].map(({ size, price }) => (
                  <button
                    key={size}
                    onClick={() => handleServiceSelect("Standard Stay", size, price)}
                    className={`flex justify-between p-2 rounded transition-all hover:bg-blue-400 ${
                      isSelected("Standard Stay", size) ? "bg-blue-400 ring-2 ring-white" : ""
                    }`}
                  >
                    <span>{size}</span>
                    <span className="font-bold flex items-center">
                      ₱ {price}*{isSelected("Standard Stay", size) && <Check className="ml-1 h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2">*per night</p>
            </div>

            {/* Premium Stay */}
            <div className="bg-blue-500 p-6 rounded-lg text-white">
              <div className="bg-cyan-400 text-blue-900 px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                PREMIUM STAY
              </div>
              <p className="text-sm mb-4">
                Cozy Kennel Stay, Fresh Water, 2x Meals, Playtime, Daily Photo & Video Update
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { size: "Small", price: 649 },
                  { size: "Large", price: 899 },
                  { size: "Medium", price: 749 },
                  { size: "X-large", price: 1199 },
                ].map(({ size, price }) => (
                  <button
                    key={size}
                    onClick={() => handleServiceSelect("Premium Stay", size, price)}
                    className={`flex justify-between p-2 rounded transition-all hover:bg-blue-400 ${
                      isSelected("Premium Stay", size) ? "bg-blue-400 ring-2 ring-white" : ""
                    }`}
                  >
                    <span>{size}</span>
                    <span className="font-bold flex items-center">
                      ₱ {price.toLocaleString()}*
                      {isSelected("Premium Stay", size) && <Check className="ml-1 h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2">*per night</p>
            </div>

            {/* VIP Stay */}
            <div className="bg-blue-500 p-6 rounded-lg text-white">
              <div className="bg-cyan-400 text-blue-900 px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                VIP STAY
              </div>
              <p className="text-sm mb-4">
                Standard Stay + Larger Kennel, Soft Bed, Meals upgrade, Daily Walk, CCTV Access
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { size: "Small", price: 949 },
                  { size: "Large", price: 1399 },
                  { size: "Medium", price: 1099 },
                  { size: "X-large", price: 1799 },
                ].map(({ size, price }) => (
                  <button
                    key={size}
                    onClick={() => handleServiceSelect("VIP Stay", size, price)}
                    className={`flex justify-between p-2 rounded transition-all hover:bg-blue-400 ${
                      isSelected("VIP Stay", size) ? "bg-blue-400 ring-2 ring-white" : ""
                    }`}
                  >
                    <span>{size}</span>
                    <span className="font-bold flex items-center">
                      ₱ {price.toLocaleString()}*{isSelected("VIP Stay", size) && <Check className="ml-1 h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2">*per night</p>
            </div>

            {/* Weekend Stay */}
            <div className="bg-blue-500 p-6 rounded-lg text-white">
              <div className="bg-cyan-400 text-blue-900 px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                WEEKEND STAY (Friday-Sunday)
              </div>
              <p className="text-sm mb-4">VIP Suite + Extra Playtime & Treats</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { size: "Small", price: 999 },
                  { size: "Large", price: 1499 },
                  { size: "Medium", price: 1299 },
                  { size: "X-large", price: 1999 },
                ].map(({ size, price }) => (
                  <button
                    key={size}
                    onClick={() => handleServiceSelect("Weekend Stay", size, price)}
                    className={`flex justify-between p-2 rounded transition-all hover:bg-blue-400 ${
                      isSelected("Weekend Stay", size) ? "bg-blue-400 ring-2 ring-white" : ""
                    }`}
                  >
                    <span>{size}</span>
                    <span className="font-bold flex items-center">
                      ₱ {price.toLocaleString()}*
                      {isSelected("Weekend Stay", size) && <Check className="ml-1 h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2">*per night</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 5-Night Stay Bundle */}
            <div className="bg-yellow-400 p-6 rounded-lg text-blue-900">
              <div className="bg-cyan-400 text-blue-900 px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                5-NIGHT STAY BUNDLE
              </div>
              <p className="text-sm mb-4">PREMIUM Stay for 5 Nights (Save upto PHP 500)</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { size: "Small", price: 2999 },
                  { size: "Large", price: 4499 },
                  { size: "Medium", price: 3499 },
                  { size: "X-large", price: 5499 },
                ].map(({ size, price }) => (
                  <button
                    key={size}
                    onClick={() => handleServiceSelect("5-Night Stay Bundle", size, price)}
                    className={`flex justify-between p-2 rounded transition-all hover:bg-yellow-300 ${
                      isSelected("5-Night Stay Bundle", size) ? "bg-yellow-300 ring-2 ring-blue-900" : ""
                    }`}
                  >
                    <span>{size}</span>
                    <span className="font-bold flex items-center">
                      ₱ {price.toLocaleString()}*
                      {isSelected("5-Night Stay Bundle", size) && <Check className="ml-1 h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Stay Plan */}
            <div className="bg-yellow-400 p-6 rounded-lg text-blue-900">
              <div className="bg-cyan-400 text-blue-900 px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                MONTHLY STAY PLAN
              </div>
              <p className="text-sm mb-4">VIP Suite for 1 Month (Save 50% up to PHP 30K )</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { size: "Small", price: 15000 },
                  { size: "Large", price: 21000 },
                  { size: "Medium", price: 16500 },
                  { size: "X-large", price: 27000 },
                ].map(({ size, price }) => (
                  <button
                    key={size}
                    onClick={() => handleServiceSelect("Monthly Stay Plan", size, price)}
                    className={`flex justify-between p-2 rounded transition-all hover:bg-yellow-300 ${
                      isSelected("Monthly Stay Plan", size) ? "bg-yellow-300 ring-2 ring-blue-900" : ""
                    }`}
                  >
                    <span>{size}</span>
                    <span className="font-bold flex items-center">
                      ₱ {price.toLocaleString()}*
                      {isSelected("Monthly Stay Plan", size) && <Check className="ml-1 h-4 w-4" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-Ons */}
            <div className="bg-pink-500 p-6 rounded-lg text-white">
              <div className="bg-pink-600 text-white px-4 py-2 rounded-t-lg font-bold text-center mb-4">
                Add-Ons for Your Pet's Stay:
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>✓ CCTV Monitoring Access (View Your Pet Online)</span>
                  <span className="font-bold">₱ 200/per night</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>✓ Personalized Playtime & Extra Walks</span>
                  <span className="font-bold">₱ 150/per session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>✓ Gourmet Meal Upgrade</span>
                  <span className="font-bold">₱ 150/per session</span>
                </div>
                <div className="text-xs mt-2">(Fresh Cooked Meat & Veggies)</div>
              </div>
              <div className="bg-pink-600 text-white px-3 py-1 rounded mt-4 text-xs">
                Loyalty Offer: Stay for 5 nights and get 1 FREE night or Classic Grooming
              </div>
            </div>

            {/* Daycare Package */}
            <div className="bg-pink-500 p-4 rounded-lg text-white">
              <div className="bg-pink-600 text-white px-3 py-1 rounded-t-lg font-bold text-center mb-3">
                Daycare Package
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Standard Stay (4-6 hours)</span>
                  <span>₱ 160</span>
                </div>
                <div className="flex justify-between">
                  <span>Half-Day Stay (5-6 hours)</span>
                  <span>₱ 250</span>
                </div>
                <div className="flex justify-between">
                  <span>Full-Day Stay (7-10 hours)</span>
                  <span>₱ 350</span>
                </div>
                <div className="flex justify-between">
                  <span>VIP Daycare (10 hours + Grooming)</span>
                  <span>₱ 1000</span>
                </div>
              </div>
            </div>

            {/* Special Offer */}
            <div className="bg-pink-500 p-4 rounded-lg text-white">
              <div className="bg-pink-600 text-white px-3 py-1 rounded-t-lg font-bold text-center mb-3">
                SPECIAL OFFER!
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Membership Plan:</span>
                  <span>₱ 6,500 (Save PHP 3,500)</span>
                </div>
                <div className="text-xs">Monthly Unlimited Daycare Pass</div>
                <div className="text-xs">(Valid for 30 days)</div>
                <div className="flex justify-between mt-2">
                  <span>10-Day Pass</span>
                  <span>₱ 3,000 (Save PHP 500)</span>
                </div>
                <div className="text-xs">All fees consumable</div>
              </div>
            </div>
          </div>
        </div>

        {selectedService && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-2 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Selected Service</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-blue-600">{selectedService}</p>
                <p className="text-gray-600">Pet Size: {selectedSize}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₱ {selectedPrice.toLocaleString()}</p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions Button */}
        <div className="text-center space-y-4">
          {selectedService ? (
            <Button
              onClick={() => setShowCageAvailability(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg rounded-lg mr-4"
            >
              Check Availability - {selectedService} ({selectedSize})
            </Button>
          ) : (
            <p className="text-gray-600 mb-4">Please select a service above to continue</p>
          )}

          <Button
            onClick={() => setShowTermsModal(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-lg"
          >
            View Terms & Conditions
          </Button>
        </div>
      </div>

      {showCageAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-teal-500 rounded-lg shadow-xl max-w-2xl w-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">AVAILABLE CAGES</h2>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                {cages.map((cage) => (
                  <div
                    key={cage.id}
                    onClick={() => handleCageSelect(cage.id, cage.occupied)}
                    className={`bg-gray-100 p-6 rounded-lg relative min-h-[120px] flex flex-col items-center justify-center transition-all ${
                      !cage.occupied
                        ? `cursor-pointer hover:bg-gray-200 ${
                            selectedCage === cage.id ? "ring-4 ring-white bg-green-100" : ""
                          }`
                        : "cursor-not-allowed"
                    }`}
                  >
                    <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm font-bold mb-2">{cage.name}</div>
                    {cage.occupied ? (
                      <div className="text-red-600 font-bold text-lg">OCCUPIED</div>
                    ) : (
                      <div className="text-center">
                        {selectedCage === cage.id ? (
                          <div className="text-green-600 font-bold text-lg flex items-center">
                            <Check className="h-6 w-6 mr-2" />
                            SELECTED
                          </div>
                        ) : (
                          <div className="text-green-600 font-bold text-lg">AVAILABLE</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                onClick={() => setShowCageAvailability(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg"
              >
                Back
              </Button>
              {selectedCage ? (
                <Button
                  onClick={() => {
                    setShowCageAvailability(false)
                    setShowTermsModal(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Proceed to Booking - Cage {selectedCage}
                </Button>
              ) : (
                <Button disabled className="bg-gray-400 cursor-not-allowed text-white px-8 py-3 rounded-lg">
                  Select a Cage to Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">PEPPA PETS HOTEL STAY WAIVER & AGREEMENT FORM</h1>
                <p className="text-gray-600">
                  Peppa Pets - 1 King Charles corner King Alexander, Kingspoint Subdivision, Barangay Bagbag,
                  Novaliches, Quezon City
                </p>
                <p className="text-gray-600">Contact Number: 0929 949 4037 | Email: peppapets.ph@gmail.com</p>
              </div>

              <form onSubmit={handleTermsSubmit} className="space-y-8">
                {/* Pet Owner Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">🐾 PET OWNER INFORMATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Owner's Full Name:</label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => updateFormData("ownerName", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Contact Number:</label>
                      <input
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) => updateFormData("contactNumber", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Email Address:</label>
                      <input
                        type="email"
                        value={formData.emailAddress}
                        onChange={(e) => updateFormData("emailAddress", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Emergency Contact (Name & Number):</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => updateFormData("emergencyContact", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pet Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">🐕 PET INFORMATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Pet's Name:</label>
                      <input
                        type="text"
                        value={formData.petName}
                        onChange={(e) => updateFormData("petName", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Breed & Species (Dog/Cat):</label>
                      <input
                        type="text"
                        value={formData.breedSpecies}
                        onChange={(e) => updateFormData("breedSpecies", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Age:</label>
                      <input
                        type="text"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Color/Markings:</label>
                      <input
                        type="text"
                        value={formData.colorMarkings}
                        onChange={(e) => updateFormData("colorMarkings", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Microchip (if applicable):</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="microchip"
                            value="Yes"
                            checked={formData.microchip === "Yes"}
                            onChange={(e) => updateFormData("microchip", e.target.value)}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="microchip"
                            value="No"
                            checked={formData.microchip === "No"}
                            onChange={(e) => updateFormData("microchip", e.target.value)}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Gender:</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={formData.gender === "Male"}
                            onChange={(e) => updateFormData("gender", e.target.value)}
                            className="mr-2"
                            required
                          />
                          Male
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Female"
                            checked={formData.gender === "Female"}
                            onChange={(e) => updateFormData("gender", e.target.value)}
                            className="mr-2"
                            required
                          />
                          Female
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Spayed/Neutered:</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="spayedNeutered"
                            value="Yes"
                            checked={formData.spayedNeutered === "Yes"}
                            onChange={(e) => updateFormData("spayedNeutered", e.target.value)}
                            className="mr-2"
                          />
                          Yes
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="spayedNeutered"
                            value="No"
                            checked={formData.spayedNeutered === "No"}
                            onChange={(e) => updateFormData("spayedNeutered", e.target.value)}
                            className="mr-2"
                          />
                          No
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-1">Allergies/Medical Conditions:</label>
                      <input
                        type="text"
                        value={formData.allergies}
                        onChange={(e) => updateFormData("allergies", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-1">Special Instructions/Diet:</label>
                      <input
                        type="text"
                        value={formData.specialInstructions}
                        onChange={(e) => updateFormData("specialInstructions", e.target.value)}
                        className="w-full border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none p-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Pet Hotel Stay Agreement */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🏨 PET HOTEL STAY AGREEMENT</h3>
                  <p className="text-gray-700 mb-4">Terms and conditions of Peppa Pets Hotel Stay:</p>

                  {/* Health & Safety */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                        1
                      </span>
                      Health & Safety
                    </h4>
                    <div className="space-y-2 text-gray-700 ml-7">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.healthSafety1}
                          onChange={(e) => updateFormData("healthSafety1", e.target.checked)}
                          className="mr-2 mt-1"
                          required
                        />
                        <span>
                          My pet is fully vaccinated and free from fleas, ticks, parasites, and contagious diseases.
                        </span>
                      </div>
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.healthSafety2}
                          onChange={(e) => updateFormData("healthSafety2", e.target.checked)}
                          className="mr-2 mt-1"
                          required
                        />
                        <span>
                          I confirm my pet has no severe medical conditions that require immediate or intensive care.
                        </span>
                      </div>
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.healthSafety3}
                          onChange={(e) => updateFormData("healthSafety3", e.target.checked)}
                          className="mr-2 mt-1"
                          required
                        />
                        <span>
                          I understand that Peppa Pets is not liable for any pre-existing medical conditions that may
                          worsen during my pet's stay.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Behavior & Special Handling */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                        2
                      </span>
                      Behavior & Special Handling
                    </h4>
                    <div className="space-y-2 text-gray-700 ml-7">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.behavior1}
                          onChange={(e) => updateFormData("behavior1", e.target.checked)}
                          className="mr-2 mt-1"
                          required
                        />
                        <span>
                          I confirm my pet does not have a history of aggression toward humans or other animals.
                        </span>
                      </div>
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.behavior2}
                          onChange={(e) => updateFormData("behavior2", e.target.checked)}
                          className="mr-2 mt-1"
                          required
                        />
                        <span>
                          If my pet exhibits aggressive behavior, I understand Peppa Pets may relocate my pet to a
                          special care area (₱500/night fee applies) or require early pick-up.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Consent & Signature */}
                  <div className="border-t pt-4 mt-8">
                    <h4 className="font-bold text-gray-900 mb-4">OWNER CONSENT & SIGNATURE</h4>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center flex-wrap">
                        <span className="mr-2">I,</span>
                        <input
                          type="text"
                          value={formData.ownerConsent}
                          onChange={(e) => updateFormData("ownerConsent", e.target.value)}
                          className="border-b border-gray-400 bg-transparent mx-2 focus:border-blue-600 outline-none"
                          style={{ width: "200px" }}
                          required
                        />
                        <span>
                          , acknowledge that I have read, understood, and agreed to the Peppa Pets Hotel Stay Rules &
                          Policies.
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center">
                          <span className="mr-2">📅 Date:</span>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => updateFormData("date", e.target.value)}
                            className="border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none"
                            required
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">✍️ Owner's Signature:</span>
                          <input
                            type="text"
                            value={formData.ownerSignature}
                            onChange={(e) => updateFormData("ownerSignature", e.target.value)}
                            className="border-b border-gray-400 bg-transparent focus:border-blue-600 outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    onClick={() => setShowTermsModal(false)}
                    className="px-8 py-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid()}
                    className={`px-8 py-3 rounded-full text-white font-semibold ${
                      isFormValid() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    NEXT
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
