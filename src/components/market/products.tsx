"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProducts } from "@/lib/data/productData";
import ProductCard from './productCard'
import { IProduct } from "@/models/Product";
import { Loader2 } from "lucide-react";

export default function Products() {
    const [products, setProducts]= useState<IProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true)
            const data = await getAllProducts();
            setProducts(data)
            setLoading(false)
        }

        loadProducts();
    }, [])

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => <ProductCard key={product.name} product={product} />)}
        </div>
    )
}