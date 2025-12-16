import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col p-4">
      <div className="pt-4 pb-8">
        <Skeleton className="h-10 w-20 bg-white/20" />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
