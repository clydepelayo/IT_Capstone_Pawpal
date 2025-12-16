import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pawpal Veterinary Clinic",
    short_name: "Pawpal",
    description: "Your trusted veterinary clinic for pet care, appointments, and services",
    start_url: "/pwa",
    scope: "/pwa",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any maskable",
      },
    ],
    categories: ["health", "medical", "lifestyle"],
    shortcuts: [
      {
        name: "Book Appointment",
        short_name: "Book",
        description: "Book a new appointment",
        url: "/pwa/book",
        icons: [{ src: "/icon-192x192.jpg", sizes: "192x192" }],
      },
      {
        name: "My Appointments",
        short_name: "Appointments",
        description: "View your appointments",
        url: "/pwa/appointments",
        icons: [{ src: "/icon-192x192.jpg", sizes: "192x192" }],
      },
      {
        name: "My Orders",
        short_name: "Orders",
        description: "View your orders",
        url: "/pwa/orders",
        icons: [{ src: "/icon-192x192.jpg", sizes: "192x192" }],
      },
    ],
    prefer_related_applications: false,
  }
}
