import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hydro-white pt-24 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <ShoppingCart className="h-24 w-24 text-hydro-green/30 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-hydro-onyx mb-4">Product Not Found</h1>
        <p className="text-hydro-onyx/70 mb-8">
          Sorry, we couldn't find the product you're looking for. It may have been moved or is no longer available.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-hydro-green hover:bg-hydro-green/90 text-hydro-white">
            <Link href="/store">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-hydro-green text-hydro-green hover:bg-hydro-green hover:text-hydro-white bg-transparent"
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
