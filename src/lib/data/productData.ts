"use server";

import connectToDatabase from "../mongodb";
import { Product, IProduct } from "@/models/Product";
import mongoose from "mongoose";
import { formatCurrency } from "../utils";

// Product CRUD operations
export async function getAllProducts() {
  try {
    await connectToDatabase();
    // Updated to sort by categoryId first, then order
    const products = await Product.find().sort({ order: 1 });
    const formattedProducts = products.map((product) => {
      const isNumeric = (word: string) => /^[+-]?\d+(\.\d+)?$/.test(word)
      //check for numbers in name
      const nameArray = product.name.split(" ")
      const formattedNameArray: string[] = []
      nameArray.map((nameWord: string) => {
        if (isNumeric(nameWord)) formattedNameArray.push(formatCurrency(Number(nameWord)))
        else formattedNameArray.push(nameWord)
      })
      product.name = formattedNameArray.join(" ")

      //check for numbers in description
      const descriptionArray = product.description.split(" ")
      const formattedDescriptionArray: string[] = []
      descriptionArray.map((descriptionWord: string) => {
        if (isNumeric(descriptionWord)) formattedDescriptionArray.push(formatCurrency(Number(descriptionWord)))
        else formattedDescriptionArray.push(descriptionWord)
      })
      product.description = formattedDescriptionArray.join(" ")

      return product
    })
    return JSON.parse(JSON.stringify(formattedProducts));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function getAvailableProducts() {
  try {
    await connectToDatabase();
    const products = await Product.find({ available: true }).sort({ order: 1 });
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function createProduct(productData: IProduct) {
  try {
    await connectToDatabase();

    if (productData.order === undefined) {
      const lastProduct = await Product.findOne().sort({ order: -1 }).limit(1);
      productData.order = lastProduct ? (lastProduct.order || 0) + 1 : 0;
    }
    const newProduct = new Product({
      ...productData,
      _id: new mongoose.Types.ObjectId(),
    });
    await newProduct.save();
    return JSON.parse(JSON.stringify(newProduct));
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

export async function updateProduct(id: string, productData: IProduct) {
  try {
    await connectToDatabase();
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error("Product not found");
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
}

export async function deleteProduct(id: string) {
  try {
    await connectToDatabase();
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      throw new Error("Product not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}

export async function reorderProducts(orderedIds: string[]) {
  try {
    await connectToDatabase();

    const updatePromises = orderedIds.map((id, index) => {
      return Product.findByIdAndUpdate(id, { order: index });
    });

    await Promise.all(updatePromises);

    return { success: true, message: "Products reordered successfully" };
  } catch (error) {
    console.error("Error reordering products:", error);
    throw new Error("Failed to reorder products");
  }
}
