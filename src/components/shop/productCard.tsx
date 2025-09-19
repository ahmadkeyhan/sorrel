"use client"
import { IProduct } from "@/models/Product"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "../ui/button"

export default function ProductCard({product}: {product:IProduct}) {
    if (!product) return null
    return (
        <Card key={product.name} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
                <Image 
                    src={product.image || "/placeholder.svg?height=200&width=400"}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
            </div>
            <CardContent className="flex flex-col p-4 gap-4">
                <h2 className="text-xl font-bold text-qqteal">{product.name}</h2>
                <p className="text-qqbrown">{product.description}</p>
                <Button variant="outline" className="border-qqteal text-qqteal">
                    <p>{formatCurrency(product.price)} هزار تومان</p>
                </Button>
            </CardContent>
        </Card>
    )
}