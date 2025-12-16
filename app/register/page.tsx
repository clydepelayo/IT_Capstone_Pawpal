"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, ArrowLeft, Eye, EyeOff, Check, X, FileText, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters long", test: (pwd) => pwd.length >= 8 },
  { label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Contains number", test: (pwd) => /\d/.test(pwd) },
  { label: "Contains special character", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
]

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const getPasswordStrength = (password: string) => {
    const passedRequirements = passwordRequirements.filter((req) => req.test(password)).length
    if (passedRequirements === 0) return { strength: 0, label: "", color: "" }
    if (passedRequirements <= 2) return { strength: 1, label: "Weak", color: "bg-red-500" }
    if (passedRequirements <= 3) return { strength: 2, label: "Fair", color: "bg-yellow-500" }
    if (passedRequirements <= 4) return { strength: 3, label: "Good", color: "bg-blue-500" }
    return { strength: 4, label: "Strong", color: "bg-green-500" }
  }

  const isPasswordValid = (password: string) => {
    return passwordRequirements.every((req) => req.test(password))
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
      toast({
        title: "Terms Read",
        description: "You can now accept the terms and conditions.",
      })
    }
  }

  const handleOpenTermsModal = () => {
    setIsTermsModalOpen(true)
    setHasScrolledToBottom(false) // Reset scroll state when opening modal
  }

  const handleAcceptTerms = () => {
    setAcceptTerms(true)
    setIsTermsModalOpen(false)
    toast({
      title: "Terms Accepted",
      description: "Thank you for accepting our terms and conditions.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please read and accept the terms and conditions to continue",
        variant: "destructive",
      })
      setIsTermsModalOpen(true)
      return
    }

    if (!isPasswordValid(formData.password)) {
      toast({
        title: "Password Requirements",
        description: "Please ensure your password meets all requirements",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Welcome to Pawpal! Please sign in to continue.",
        })
        router.push("/login")
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">Pawpal</span>
            </div>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join Pawpal to manage your pet's health</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+63 912 345 6789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          passwordStrength.strength === 4
                            ? "text-green-600"
                            : passwordStrength.strength === 3
                              ? "text-blue-600"
                              : passwordStrength.strength === 2
                                ? "text-yellow-600"
                                : "text-red-600"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => {
                        const isValid = req.test(formData.password)
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {isValid ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={isValid ? "text-green-600" : "text-gray-500"}>{req.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword &&
                  formData.confirmPassword.length > 0 && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
              </div>

              {/* Terms and Conditions Modal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Terms and Conditions</p>
                      <p className="text-xs text-gray-600">
                        {acceptTerms ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Terms accepted
                          </span>
                        ) : (
                          "Please read and accept our terms"
                        )}
                      </p>
                    </div>
                  </div>
                  <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant={acceptTerms ? "outline" : "default"} size="sm" onClick={handleOpenTermsModal}>
                        {acceptTerms ? "View Terms" : "Read Terms"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Terms and Conditions
                        </DialogTitle>
                        <DialogDescription>
                          Please read our terms and conditions carefully before creating your account.
                        </DialogDescription>
                      </DialogHeader>

                      {/* Scroll indicator */}
                      {!hasScrolledToBottom && (
                        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                          <ChevronDown className="h-4 w-4 animate-bounce" />
                          Please scroll to the bottom to continue
                        </div>
                      )}

                      <ScrollArea
                        className="h-[400px] w-full rounded-md border p-4"
                        onScrollCapture={handleScroll}
                        ref={scrollAreaRef}
                      >
                        <div className="space-y-4 text-sm">
                          <section>
                            <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
                            <p className="text-gray-700 leading-relaxed">
                              By creating an account with Pawpal, you agree to be bound by these Terms and Conditions.
                              If you do not agree to these terms, please do not use our services. These terms constitute
                              a legally binding agreement between you and Pawpal Veterinary Clinic.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">2. Service Description</h3>
                            <p className="text-gray-700 leading-relaxed">
                              Pawpal provides comprehensive veterinary services including but not limited to routine
                              check-ups, vaccinations, surgical procedures, emergency care, pet boarding, grooming
                              services, and related products through our platform. We strive to provide quality care for
                              your pets and excellent customer service at all times.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">3. User Responsibilities</h3>
                            <p className="text-gray-700 leading-relaxed mb-2">
                              As a user of our services, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              <li>
                                Provide accurate and complete information about your pets and their medical history
                              </li>
                              <li>Keep your account information up to date and secure</li>
                              <li>Follow all appointment scheduling and boarding policies</li>
                              <li>Pay for services in a timely manner according to our payment terms</li>
                              <li>Treat our staff, other clients, and facilities with respect</li>
                              <li>Inform us of any changes in your pet's condition or behavior</li>
                              <li>Follow all post-treatment care instructions provided by our veterinarians</li>
                            </ul>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">4. Privacy Policy</h3>
                            <p className="text-gray-700 leading-relaxed">
                              We respect your privacy and are committed to protecting your personal information and your
                              pet's medical records. Your data will be used only for providing veterinary services,
                              appointment scheduling, billing, and communication purposes. We will not share your
                              information with third parties without your explicit consent, except as required by law or
                              in emergency situations involving your pet's health and safety.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">5. Appointment and Cancellation Policy</h3>
                            <p className="text-gray-700 leading-relaxed">
                              Appointments must be cancelled at least 24 hours in advance to avoid cancellation fees.
                              Late cancellations (less than 24 hours) or no-shows may result in a cancellation fee
                              equivalent to 50% of the scheduled service cost. Emergency appointments are subject to
                              availability and may incur additional charges. We reserve the right to reschedule
                              appointments due to emergencies or unforeseen circumstances.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">6. Payment Terms</h3>
                            <p className="text-gray-700 leading-relaxed">
                              Payment is due at the time of service unless other arrangements have been made in advance.
                              We accept cash, major credit cards, and GCash payments. For boarding services, a deposit
                              may be required at the time of booking. Unpaid balances over 30 days may result in
                              collection actions and additional fees. Returned checks will incur a processing fee.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">7. Medical Care and Treatment</h3>
                            <p className="text-gray-700 leading-relaxed">
                              Our veterinarians will provide medical care based on their professional judgment and
                              current veterinary standards. You acknowledge that veterinary medicine is not an exact
                              science and that no guarantee of cure or successful treatment can be made. You consent to
                              necessary medical procedures and understand that complications may arise during treatment
                              despite proper care.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">8. Boarding and Care Services</h3>
                            <p className="text-gray-700 leading-relaxed">
                              For boarding services, you certify that your pet is in good health and has current
                              vaccinations as required by our facility. We reserve the right to refuse boarding services
                              if your pet shows signs of illness or aggression. You authorize us to seek emergency
                              veterinary care if needed during boarding, and you will be responsible for all associated
                              costs.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">9. Limitation of Liability</h3>
                            <p className="text-gray-700 leading-relaxed">
                              While we strive to provide the best care possible, veterinary medicine involves inherent
                              risks and uncertainties. Our liability is limited to the cost of services provided. We are
                              not responsible for outcomes beyond our reasonable control, including but not limited to
                              pre-existing conditions, genetic disorders, or complications arising from your pet's
                              individual response to treatment.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">10. Emergency Situations</h3>
                            <p className="text-gray-700 leading-relaxed">
                              In emergency situations where you cannot be reached, you authorize us to provide necessary
                              medical care to save your pet's life or prevent suffering. We will make every effort to
                              contact you before proceeding with major procedures, but in life- threatening situations,
                              we may proceed with treatment in your pet's best interest.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">11. Modifications to Terms</h3>
                            <p className="text-gray-700 leading-relaxed">
                              We reserve the right to modify these terms at any time. Users will be notified of
                              significant changes via email or through our platform, and continued use of our services
                              constitutes acceptance of the modified terms. It is your responsibility to review these
                              terms periodically for updates.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">12. Dispute Resolution</h3>
                            <p className="text-gray-700 leading-relaxed">
                              Any disputes arising from these terms or our services will be resolved through binding
                              arbitration in accordance with local laws. Both parties agree to attempt resolution
                              through mediation before proceeding to arbitration.
                            </p>
                          </section>

                          <section>
                            <h3 className="font-semibold text-base mb-2">13. Contact Information</h3>
                            <p className="text-gray-700 leading-relaxed">
                              If you have questions about these terms or our services, please contact us at
                              info@Pawpal.com, call us at +63 912 345 6789, or visit our clinic during business hours.
                              Our staff will be happy to assist you with any concerns.
                            </p>
                          </section>

                          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 font-medium">
                              ✓ You have reached the end of our Terms and Conditions
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Thank you for taking the time to read through our complete terms.
                            </p>
                          </div>
                        </div>
                      </ScrollArea>

                      <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsTermsModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAcceptTerms}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!hasScrolledToBottom}
                        >
                          {hasScrolledToBottom ? "Accept Terms & Conditions" : "Scroll to Bottom First"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !acceptTerms || !isPasswordValid(formData.password)}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
