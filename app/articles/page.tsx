"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Calendar, User } from "lucide-react"
import Image from "next/image"

function ArticleContent() {
  const searchParams = useSearchParams()
  const title = searchParams.get("title") || "Article Not Found"
  const content = searchParams.get("content") || "This article content is not available."

  // Enhanced content based on the article title
  const getEnhancedContent = (title: string, baseContent: string) => {
    switch (title) {
      case "How to Choose the Best Food for Your Pet":
        return {
          content: `${baseContent}

**Understanding Your Pet's Nutritional Needs**

Every pet is unique, and their dietary requirements vary based on several factors including age, breed, size, activity level, and health conditions. Puppies and kittens need more calories and protein for growth, while senior pets may require specialized diets for joint health and easier digestion.

**Types of Pet Food**

1. **Dry Food (Kibble)**: Convenient, cost-effective, and helps maintain dental health through chewing action. Look for high-quality brands with real meat as the first ingredient.

2. **Wet Food**: Higher moisture content, more palatable for picky eaters, and easier to digest. Great for pets who don't drink enough water.

3. **Raw Diet**: Can provide excellent nutrition but requires careful handling and preparation. Consult with your veterinarian before switching to a raw diet.

**Reading Pet Food Labels**

- First ingredient should be a named meat source (chicken, beef, salmon)
- Avoid foods with excessive fillers like corn, wheat, or by-products
- Look for AAFCO (Association of American Feed Control Officials) certification
- Check for artificial preservatives, colors, and flavors

**Special Considerations**

For pets with allergies or sensitivities, consider limited ingredient diets. Always transition to new foods gradually over 7-10 days to avoid digestive upset.`,
          image: "/article1.jpg",
          author: "Dr. Sarah Johnson, DVM",
          date: "December 15, 2024",
          readTime: "5 min read",
        }

      case "Grooming Tips for Happy Pets":
        return {
          content: `${baseContent}

**Essential Grooming Tools**

Invest in quality grooming tools: a good brush suitable for your pet's coat type, nail clippers, pet-safe shampoo, ear cleaning solution, and dental care products.

**Brushing Techniques**

- **Short-haired pets**: Brush weekly with a rubber brush or short-bristled brush
- **Long-haired pets**: Daily brushing prevents mats and tangles
- **Double-coated breeds**: Use an undercoat rake during shedding seasons

**Bathing Best Practices**

Most pets need baths every 4-6 weeks, but this varies by breed and lifestyle. Use lukewarm water and pet-specific shampoo. Rinse thoroughly to prevent skin irritation.

**Nail Care**

Trim nails every 2-4 weeks. Cut only the white tip, avoiding the pink quick inside the nail. If you accidentally cut the quick, apply styptic powder to stop bleeding.

**Ear and Dental Care**

Check ears weekly for dirt, wax, or signs of infection. Clean with a vet-approved solution. Brush your pet's teeth regularly or provide dental chews to maintain oral health.

**Professional Grooming**

Consider professional grooming for breeds with complex coat requirements, nail grinding, or if your pet is anxious during grooming sessions.`,
          image: "/article2.jpg",
          author: "Maria Rodriguez, Professional Groomer",
          date: "December 12, 2024",
          readTime: "4 min read",
        }

      case "Traveling Safely with Pets":
        return {
          content: `${baseContent}

**Pre-Travel Preparation**

Schedule a vet visit 2-4 weeks before travel for health certificates, vaccinations, and any necessary medications. Research your destination's pet requirements and restrictions.

**Packing Essentials**

- Food and water for the entire trip plus extra
- Medications and first aid kit
- Comfort items (favorite toy, blanket)
- Leash, collar with ID tags, and harness
- Waste bags and cleaning supplies
- Recent photos of your pet

**Transportation Safety**

**By Car**: Use a secure carrier, pet seat belt, or barrier. Never leave pets unattended in a parked vehicle. Take breaks every 2-3 hours for exercise and bathroom needs.

**By Air**: Check airline pet policies well in advance. Ensure carriers meet size requirements and are properly ventilated. Consider direct flights to minimize stress.

**Accommodation Tips**

Book pet-friendly hotels in advance and understand their pet policies. Bring familiar bedding and maintain your pet's routine as much as possible.

**Managing Travel Anxiety**

Some pets experience motion sickness or anxiety. Consult your vet about anti-anxiety medications or natural calming aids. Practice short car rides before long trips.

**International Travel**

Research quarantine requirements, necessary vaccinations, and import permits. Some countries require months of preparation, so plan well ahead.`,
          image: "/article3.jpg",
          author: "Dr. Michael Chen, Veterinary Travel Specialist",
          date: "December 10, 2024",
          readTime: "6 min read",
        }

      default:
        return {
          content: baseContent,
          image: "/pet-care-article.jpg",
          author: "Pawpal Team",
          date: "December 2024",
          readTime: "3 min read",
        }
    }
  }

  const articleData = getEnhancedContent(title, content)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">Pawpal</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/#services" className="text-gray-500 hover:text-gray-900">
                Services
              </Link>
              <Link href="/pet-hotel" className="text-gray-500 hover:text-gray-900">
                Pet Hotel
              </Link>
              <Link href="/shop" className="text-gray-500 hover:text-gray-900">
                Shop
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                Contact
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-6 bg-transparent">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <Image
                src={articleData.image || "/placeholder.svg"}
                alt={title}
                width={800}
                height={400}
                className="rounded-lg object-cover w-full h-[300px]"
              />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">{title}</h1>

            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{articleData.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{articleData.date}</span>
              </div>
              <span className="text-blue-600 font-medium">{articleData.readTime}</span>
            </div>
          </CardContent>
        </Card>

        {/* Article Body */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              {articleData.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  // Handle bold headings
                  return (
                    <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                      {paragraph.replace(/\*\*/g, "")}
                    </h3>
                  )
                } else if (paragraph.includes("1. **") || paragraph.includes("2. **") || paragraph.includes("3. **")) {
                  // Handle numbered lists with bold items
                  return (
                    <div key={index} className="mb-4">
                      {paragraph.split("\n").map((line, lineIndex) => {
                        if (line.match(/^\d+\. \*\*/)) {
                          const [number, ...rest] = line.split(": ")
                          const title = number.replace(/\*\*/g, "")
                          const description = rest.join(": ")
                          return (
                            <div key={lineIndex} className="mb-3">
                              <strong className="text-blue-600">{title}:</strong>
                              <span className="ml-1">{description}</span>
                            </div>
                          )
                        }
                        return (
                          line && (
                            <p key={lineIndex} className="mb-2">
                              {line}
                            </p>
                          )
                        )
                      })}
                    </div>
                  )
                } else if (paragraph.startsWith("- ")) {
                  // Handle bullet points
                  return (
                    <ul key={index} className="list-disc list-inside mb-4 space-y-2">
                      {paragraph
                        .split("\n")
                        .filter((line) => line.startsWith("- "))
                        .map((item, itemIndex) => (
                          <li key={itemIndex} className="text-gray-700">
                            {item.substring(2)}
                          </li>
                        ))}
                    </ul>
                  )
                } else {
                  // Regular paragraphs
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  )
                }
              })}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white">
              <CardContent className="p-6">
                <Image
                  src="/article2.jpg"
                  alt="Pet Health Tips"
                  width={300}
                  height={150}
                  className="rounded-lg mb-4 object-cover w-full h-[120px]"
                />
                <h4 className="font-semibold text-gray-900 mb-2">Essential Pet Health Tips</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Keep your pets healthy with these essential care tips from our veterinary experts.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/">Read More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white">
              <CardContent className="p-6">
                <Image
                  src="/article3.jpg"
                  alt="Pet Training Guide"
                  width={300}
                  height={150}
                  className="rounded-lg mb-4 object-cover w-full h-[120px]"
                />
                <h4 className="font-semibold text-gray-900 mb-2">Pet Training Basics</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Learn fundamental training techniques to build a strong bond with your pet.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/">Read More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-blue-50 border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Professional Pet Care?</h3>
            <p className="text-gray-600 mb-6">
              Our experienced veterinarians and pet care specialists are here to help your furry friends stay healthy
              and happy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Pawpal</span>
              </div>
              <p className="text-gray-400">Your trusted partner in pet health and wellness.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/#services" className="hover:text-white">
                    Veterinary Care
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="hover:text-white">
                    Pet Grooming
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white">
                    Pet Shop
                  </Link>
                </li>
                <li>
                  <Link href="/pet-hotel" className="hover:text-white">
                    Pet Hotel
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Account</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white">
                    Shop Now
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pawpal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function ArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      }
    >
      <ArticleContent />
    </Suspense>
  )
}
