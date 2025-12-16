"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Calendar, ShoppingBag, ArrowRight, MapPin, Phone, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  quickActions?: QuickAction[]
}

interface QuickAction {
  label: string
  action: string
  icon?: React.ReactNode
}

interface ClientChatbotProps {
  isAuthenticated?: boolean
}

export function ClientChatbot({ isAuthenticated = true }: ClientChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "bot",
        content:
          "Hello! 👋 Kumusta! I'm your Pawpal assistant. How can I help you today? / Paano kita matutulungan ngayon?",
        timestamp: new Date(),
        quickActions: [
          { label: "Book Appointment", action: "/client/appointments/book", icon: <Calendar className="h-4 w-4" /> },
          { label: "Contact Info", action: "contact", icon: <Phone className="h-4 w-4" /> },
          { label: "Location", action: "location", icon: <MapPin className="h-4 w-4" /> },
        ],
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue.toLowerCase())
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const generateBotResponse = (input: string): Message => {
    let content = ""
    let quickActions: QuickAction[] = []

    // Contact, Address, Location queries (English and Tagalog)
    if (
      input.includes("contact") ||
      input.includes("phone") ||
      input.includes("number") ||
      input.includes("call") ||
      input.includes("email") ||
      input.includes("telepono") ||
      input.includes("numero") ||
      input.includes("tawagan") ||
      input.includes("makipag-ugnayan")
    ) {
      content = `📞 Here's how to reach us / Narito ang aming contact details:

**Phone / Telepono:** +63 929 494 4937
**Email:** peppapets.ph@gmail.com

You can call us anytime during business hours or send us an email! / Maaari kang tumawag o mag-email sa amin!`
      quickActions = [
        { label: "View Location", action: "location", icon: <MapPin className="h-4 w-4" /> },
        { label: "Business Hours", action: "hours", icon: <Clock className="h-4 w-4" /> },
      ]
    }

    // Address and Location queries (English and Tagalog)
    else if (
      input.includes("address") ||
      input.includes("location") ||
      input.includes("where") ||
      input.includes("saan") ||
      input.includes("lugar") ||
      input.includes("direksyon") ||
      input.includes("matatagpuan")
    ) {
      content = `📍 Our clinic is located at / Matatagpuan kami sa:

**Address / Direksyon:**
1 King Charles corner King Alexander
Kingspoint Subdivision, Novaliches
Philippines

We're easy to find in Kingspoint Subdivision! / Madaling hanapin kami sa Kingspoint Subdivision!`
      quickActions = [
        { label: "Contact Us", action: "contact", icon: <Phone className="h-4 w-4" /> },
        { label: "Business Hours", action: "hours", icon: <Clock className="h-4 w-4" /> },
        { label: "Book Appointment", action: "/client/appointments/book", icon: <Calendar className="h-4 w-4" /> },
      ]
    }

    // Business Hours queries (English and Tagalog)
    else if (
      input.includes("hour") ||
      input.includes("time") ||
      input.includes("open") ||
      input.includes("close") ||
      input.includes("schedule") ||
      input.includes("oras") ||
      input.includes("bukas") ||
      input.includes("sarado") ||
      input.includes("kailan") ||
      input.includes("anong oras")
    ) {
      content = `🕒 Our business hours / Oras ng operasyon:

**Monday - Saturday / Lunes - Sabado:**
8:00 AM - 6:00 PM

**Sunday / Linggo:**
9:00 AM - 4:00 PM

We're here to serve you and your pets! / Nandito kami para sa inyo at sa inyong mga alaga!`
      quickActions = [
        { label: "Book Appointment", action: "/client/appointments/book", icon: <Calendar className="h-4 w-4" /> },
        { label: "Contact Us", action: "contact", icon: <Phone className="h-4 w-4" /> },
        { label: "View Location", action: "location", icon: <MapPin className="h-4 w-4" /> },
      ]
    }

    // Appointment queries (English and Tagalog)
    else if (
      input.includes("appointment") ||
      input.includes("book") ||
      input.includes("schedule") ||
      input.includes("reserve") ||
      input.includes("mag-book") ||
      input.includes("mag-schedule") ||
      input.includes("pagreserba") ||
      input.includes("appointment")
    ) {
      content = `📅 I can help you book an appointment! / Matutulungan kita mag-book!

We offer / Nag-aalok kami ng:
- Veterinary checkups / Check-up
- Grooming / Pag-aayos
- Boarding services / Pag-aalaga

Our clinic is open:
**Mon-Sat:** 8:00 AM - 6:00 PM
**Sunday:** 9:00 AM - 4:00 PM

Would you like to book now? / Gusto mo bang mag-book ngayon?`
      quickActions = [
        { label: "Book Now", action: "/client/appointments/book", icon: <Calendar className="h-4 w-4" /> },
        { label: "View Services", action: "services" },
        { label: "Contact Us", action: "contact" },
      ]
    }

    // Product/Shop queries (English and Tagalog)
    else if (
      input.includes("product") ||
      input.includes("shop") ||
      input.includes("buy") ||
      input.includes("food") ||
      input.includes("bili") ||
      input.includes("bumili") ||
      input.includes("tindahan") ||
      input.includes("pagkain")
    ) {
      content = `🛍️ Great! Our shop offers / Ang aming tindahan ay nag-aalok ng:

- Premium pet food / Pagkain para sa alaga
- Toys / Laruan
- Grooming supplies / Kagamitan sa pag-aayos
- Health products / Produktong pangkalusugan

We have special offers on selected items! / May special offers kami!`
      quickActions = [
        { label: "Browse Shop", action: "/client/shop", icon: <ShoppingBag className="h-4 w-4" /> },
        { label: "View Offers", action: "offers" },
      ]
    }

    // Services queries (English and Tagalog)
    else if (
      input.includes("service") ||
      input.includes("offer") ||
      input.includes("provide") ||
      input.includes("serbisyo") ||
      input.includes("alok") ||
      input.includes("ano ang")
    ) {
      content = `We provide comprehensive pet care services / Nag-aalok kami ng:

🏥 **Veterinary Care / Pag-aalaga ng Beterinaryo**
- Checkups / Check-up
- Vaccinations / Bakuna
- Surgery / Operasyon

✨ **Pet Grooming / Pag-aayos**
- Bathing / Paliligo
- Haircuts / Gupit
- Nail trimming / Paggupit ng kuko

🏠 **Pet Boarding / Pag-aalaga**
- Safe facilities / Ligtas na pasilidad
- Daily care / Araw-araw na pag-aalaga

🛍️ **Pet Shop**
- Food, toys, accessories / Pagkain, laruan, accessories

Which service interests you? / Alin ang gusto mo?`
      quickActions = [
        { label: "Book Service", action: "/client/appointments/book" },
        { label: "View Pricing", action: "pricing" },
      ]
    }

    // Pricing queries (English and Tagalog)
    else if (
      input.includes("price") ||
      input.includes("cost") ||
      input.includes("how much") ||
      input.includes("presyo") ||
      input.includes("magkano") ||
      input.includes("halaga")
    ) {
      content = `💰 Our pricing / Presyo:

**Basic Checkup / Check-up:** Php 500-800
**Vaccinations / Bakuna:** Php 300-600
**Grooming / Pag-aayos:** Php 800-1,500
**Boarding / Pag-aalaga:** Php 300-600/day

For detailed pricing, would you like to see our services? / Para sa detalyadong presyo, gusto mo bang makita ang aming mga serbisyo?`
      quickActions = [
        { label: "View Services", action: "services" },
        { label: "Book Now", action: "/client/appointments/book" },
      ]
    }

    // Boarding queries (English and Tagalog)
    else if (
      input.includes("boarding") ||
      input.includes("hotel") ||
      input.includes("stay") ||
      input.includes("pag-aalaga") ||
      input.includes("matutulog") ||
      input.includes("iwan")
    ) {
      content = `🏠 Our pet boarding facility offers / Nag-aalok ng:

- Clean, comfortable cages / Malinis at komportableng kulungan
- Regular feeding / Regular na pagpapakain
- Playtime and exercise / Paglalaro at ehersisyo
- Daily health monitoring / Araw-araw na health check
- Photo updates / Larawan ng updates

Rates start at Php 300/day. Book now? / Magsimula sa Php 300/araw. Mag-book na?`
      quickActions = [
        { label: "Book Boarding", action: "/client/appointments/book" },
        { label: "View Services", action: "services" },
      ]
    }

    // Grooming queries (English and Tagalog)
    else if (
      input.includes("grooming") ||
      input.includes("bath") ||
      input.includes("haircut") ||
      input.includes("pag-aayos") ||
      input.includes("paligo") ||
      input.includes("gupit")
    ) {
      content = `✨ Our grooming services / Serbisyo sa pag-aayos:

**Full grooming package:** Php 1,200-1,500
**Bath only / Paligo lang:** Php 500-800
**Haircut / Gupit:** Php 600-1,000
**Nail trimming / Paggupit ng kuko:** Php 200

All services include ear cleaning and dental check! / Lahat ay may kasamang linis ng tenga at dental check!`
      quickActions = [
        { label: "Book Grooming", action: "/client/appointments/book" },
        { label: "View Packages", action: "services" },
      ]
    }

    // Vaccination queries (English and Tagalog)
    else if (
      input.includes("vaccination") ||
      input.includes("vaccine") ||
      input.includes("shot") ||
      input.includes("bakuna") ||
      input.includes("turок")
    ) {
      content = `💉 We offer all essential vaccinations / Nag-aalok ng lahat ng bakuna:

**Dog vaccines / Para sa aso:**
- 5-in-1, rabies, bordetella

**Cat vaccines / Para sa pusa:**
- 3-in-1, rabies

**Prices / Presyo:** Php 300-600 per vaccine

We'll create a vaccination schedule for your pet! / Gagawa kami ng schedule ng bakuna para sa iyong alaga!`
      quickActions = [
        { label: "Book Vaccination", action: "/client/appointments/book" },
        { label: "View Services", action: "services" },
      ]
    }

    // Emergency queries (English and Tagalog)
    else if (
      input.includes("emergency") ||
      input.includes("urgent") ||
      input.includes("help") ||
      input.includes("sick") ||
      input.includes("emerhensya") ||
      input.includes("tulong") ||
      input.includes("may sakit")
    ) {
      content = `🚨 For emergencies / Para sa emerhensya:

**24/7 Hotline:** +63 929 494 4937

If your pet is experiencing / Kung ang iyong alaga ay:
- Severe bleeding / Malubhang pagdurugo
- Difficulty breathing / Hirap huminga
- Seizures / Kombulsyon
- Loss of consciousness / Nawalan ng malay

Please call immediately or go to the nearest emergency clinic! / Tumawag agad o pumunta sa pinakamalapit na emergency clinic!`
      quickActions = [
        { label: "Call Now", action: "emergency" },
        { label: "Book Appointment", action: "/client/appointments/book" },
      ]
    }

    // Greeting (English and Tagalog)
    else if (
      input.includes("hello") ||
      input.includes("hi") ||
      input.includes("hey") ||
      input.includes("kumusta") ||
      input.includes("kamusta") ||
      input.includes("magandang araw") ||
      input.includes("magandang umaga")
    ) {
      content = `Hello! Kumusta! 👋 

Welcome to Pawpal! How can I help you and your pet today? / Maligayang pagdating sa Pawpal! Paano kita matutulungan ngayon?`
      quickActions = [
        { label: "Book Appointment", action: "/client/appointments/book" },
        { label: "Contact Info", action: "contact" },
        { label: "Our Location", action: "location" },
      ]
    }

    // Thank you (English and Tagalog)
    else if (
      input.includes("thank") ||
      input.includes("thanks") ||
      input.includes("salamat") ||
      input.includes("maraming salamat")
    ) {
      content = `You're welcome! Walang anuman! 🐾 

Is there anything else I can help you with? / May iba pa ba akong matutulungan sa iyo?`
      quickActions = [
        { label: "Book Appointment", action: "/client/appointments/book" },
        { label: "Contact Us", action: "contact" },
        { label: "Browse Shop", action: "/client/shop" },
      ]
    }

    // Default response
    else {
      content = `I'm here to help! Nandito ako para tumulong! 😊

I can assist you with / Matutulungan kita sa:
📅 Booking appointments / Pag-book ng appointment
🛍️ Shopping for pet products / Pagbili ng produkto
📍 Location and contact info / Lokasyon at contact
🕒 Business hours / Oras ng operasyon
💰 Pricing / Presyo

What would you like to know? / Ano ang gusto mong malaman?`
      quickActions = [
        { label: "Book Appointment", action: "/client/appointments/book" },
        { label: "Contact Info", action: "contact", icon: <Phone className="h-4 w-4" /> },
        { label: "Our Location", action: "location", icon: <MapPin className="h-4 w-4" /> },
      ]
    }

    return {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
      quickActions,
    }
  }

  const handleQuickAction = (action: string) => {
    if (action.startsWith("/")) {
      if (!isAuthenticated) {
        sessionStorage.setItem("redirectAfterLogin", action)
        router.push("/login")
      } else {
        router.push(action)
      }
    } else if (action === "contact") {
      const contactMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `📞 Contact Information / Impormasyon sa Pakikipag-ugnayan:

**Phone / Telepono:** +63 929 494 4937
**Email:** peppapets.ph@gmail.com

**Address / Direksyon:**
1 King Charles corner King Alexander
Kingspoint Subdivision, Novaliches, Philippines

Feel free to reach out anytime! / Huwag mag-atubiling makipag-ugnayan!`,
        timestamp: new Date(),
        quickActions: [
          { label: "View Location", action: "location" },
          { label: "Business Hours", action: "hours" },
        ],
      }
      setMessages((prev) => [...prev, contactMessage])
    } else if (action === "location") {
      const locationMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `📍 Our Location / Aming Lokasyon:

**Address / Direksyon:**
1 King Charles corner King Alexander
Kingspoint Subdivision
Novaliches, Philippines

We're located in the heart of Kingspoint Subdivision, easy to find! / Matatagpuan kami sa gitna ng Kingspoint Subdivision!`,
        timestamp: new Date(),
        quickActions: [
          { label: "Contact Info", action: "contact" },
          { label: "Business Hours", action: "hours" },
        ],
      }
      setMessages((prev) => [...prev, locationMessage])
    } else if (action === "hours") {
      const hoursMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `🕒 Business Hours / Oras ng Operasyon:

**Monday - Saturday / Lunes - Sabado:**
8:00 AM - 6:00 PM

**Sunday / Linggo:**
9:00 AM - 4:00 PM

We look forward to seeing you! / Inaasahan namin kayo!`,
        timestamp: new Date(),
        quickActions: [
          { label: "Book Appointment", action: "/client/appointments/book" },
          { label: "Contact Us", action: "contact" },
        ],
      }
      setMessages((prev) => [...prev, hoursMessage])
    } else if (action === "services") {
      const element = document.querySelector("#services")
      element?.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    } else if (action === "offers") {
      const element = document.querySelector("#offers")
      element?.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    } else if (action === "pricing") {
      const pricingMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `💰 Service Pricing / Presyo ng Serbisyo:

**Veterinary Services:**
- Basic Checkup: Php 500-800
- Vaccinations: Php 300-600

**Grooming:**
- Full Package: Php 1,200-1,500
- Bath Only: Php 500-800
- Haircut: Php 600-1,000

**Boarding:**
- Php 300-600 per day

Contact us for more details! / Makipag-ugnayan para sa karagdagang detalye!`,
        timestamp: new Date(),
        quickActions: [
          { label: "Book Now", action: "/client/appointments/book" },
          { label: "Contact Us", action: "contact" },
        ],
      }
      setMessages((prev) => [...prev, pricingMessage])
    } else if (action === "emergency") {
      const emergencyMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: `🚨 Emergency Hotline / Emergency Hotline:

**Phone:** +63 929 494 4937

Available 24/7 for emergencies! / Available 24/7 para sa emerhensya!

Call immediately if your pet needs urgent care! / Tumawag agad kung kailangan ng urgent care ang iyong alaga!`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, emergencyMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-white text-blue-600">
                  <MessageCircle className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">Pawpal Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center">
                  <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-4 flex flex-col overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.type === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.quickActions && message.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.quickActions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAction(action.action)}
                              className="h-8 text-xs bg-white hover:bg-gray-50 border-gray-300"
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... / Mag-type ng mensahe..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx global>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </>
  )
}
