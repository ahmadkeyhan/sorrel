import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Button } from "./ui/button"

interface ProductSlideProps {
  product: any
}

export default function ProductSlide({ product }: ProductSlideProps) {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

  return (
    <Link href={`/market`}>
        <div className="relative w-full h-full">
        {/* Product image */}
        <div className="relative h-1/2">
            <Image
            src={product.image || "/placeholder.svg?height=400&width=800"}
            alt={product.name}
            fill
            className="object-cover"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-qqdarkbrown/90 to-qqdarkbrown/10" /> */}
        </div>

        {/* Product details */}
        <div className=" px-6 py-4 text-teal-700">
            <div className="w-full flex items-center justify-between">
                <h3 className="text-xl font-extrabold">{product.name}</h3>
            </div>
            <p className="mb-2 line-clamp-2 font-semibold min-h-12 text-teal-600">{product.description}</p>
            <div className="flex w-full justify-center">
                <Button variant="outline">
                    <p>{formatCurrency(product.price)} هزار تومان</p>
                </Button>
            </div>
        </div>
        </div>
    </Link>
  )
}

