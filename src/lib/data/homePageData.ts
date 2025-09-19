"use server"

import { getAllProducts } from "./productData"

export async function getLatestProducts(limit = 3) {
  try {
    const products = await getAllProducts()

    // Sort items by creation date (newest first)
    const sortedProducts = [...products].sort((a, b) => {
      // If createdAt is available, use it
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }

      // Fallback to sorting by ID (assuming newer items have higher IDs)
      const idA = a.id || a._id || ""
      const idB = b.id || b._id || ""
      return idB.localeCompare(idA)
    })

    // Filter only available items and limit to the specified number
    return sortedProducts.slice(0, limit)
  } catch (error) {
    console.error("Error fetching latest menu items:", error)
    return []
  }
}

