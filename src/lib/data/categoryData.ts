"use server";

import connectToDatabase from "../mongodb";
import { Category, ICategory } from "../../models/Category";
import { MenuItem } from "../../models/MenuItem";
import mongoose from "mongoose";

// Category CRUD operations
export async function getCategories() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ order: 1, name: 1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function createCategory(categoryData: ICategory) {
  try {
    await connectToDatabase();
    if (categoryData.order === undefined) {
      const lastCategory = await Category.findOne({})
        .sort({ order: -1 })
        .limit(1);

      categoryData.order = lastCategory ? (lastCategory.order || 0) + 1 : 0;
    }
    const newCategory = new Category({
      ...categoryData,
      _id: new mongoose.Types.ObjectId(),
    });
    await newCategory.save();
    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategory(id: string, categoryData: ICategory) {
  try {
    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: categoryData },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new Error("Category not found");
    }

    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectToDatabase();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the category
      const deletedCategory = await Category.findByIdAndDelete(id).session(
        session
      );
      if (!deletedCategory) {
        throw new Error("Category not found");
      }

      // Remove this category from all menu items that reference it
      await MenuItem.updateMany({ categoryIds: id }, { $pull: { categoryIds: id } }).session(session)

      // Delete menu items that have no categories left
      await MenuItem.deleteMany({ categoryIds: { $size: 0 } }).session(session)

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}

export async function reorderCategories(orderedIds: string[]) {
  console.log(orderedIds);
  try {
    await connectToDatabase();

    // Update each category with its new order
    const updatePromises = orderedIds.map((id, index) => {
      return Category.findByIdAndUpdate(id, { order: index });
    });

    await Promise.all(updatePromises);

    return { success: true, message: "Categories reordered successfully" };
  } catch (error) {
    console.error("Error reordering categories:", error);
    throw new Error("Failed to reorder categories");
  }
}

// New function to get items grouped by categories
export async function getItemsGroupedByCategories() {
  try {
    await connectToDatabase()
    const categories = await Category.find().sort({ order: 1, name: 1 })
    const items = await MenuItem.find({ available: true }).populate("categoryIds", "name")

    const grouped: { [categoryId: string]: any[] } = {}

    categories.forEach((category) => {
      grouped[category._id.toString()] = items.filter((item) =>
        item.categoryIds.some((catId: any) => catId._id.toString() === category._id.toString()),
      )
    })

    return {
      categories: JSON.parse(JSON.stringify(categories)),
      grouped: JSON.parse(JSON.stringify(grouped)),
    }
  } catch (error) {
    console.error("Error fetching grouped items:", error)
    throw new Error("Failed to fetch grouped items")
  }
}