"use server";

import connectToDatabase from "../mongodb";
import { MenuItem, IMenuItem } from "../../models/MenuItem";
import mongoose from "mongoose";

// Menu Item CRUD operations
export async function getMenuItems() {
  try {
    await connectToDatabase();
    // Updated to populate category information
    const menuItems = await MenuItem.find().sort({ name: 1 })
    return JSON.parse(JSON.stringify(menuItems));
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw new Error("Failed to fetch menu items");
  }
}

// Update the getCategoryItems function to filter by available
export async function getCategoryItems(categoryId: string) {
  try {
    await connectToDatabase();
    // Find items that include this category in their categoryIds array
    const items = await MenuItem.find({
      categoryId,
      available: true,
    }).sort({ order: 1, name: 1 })
    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error("Error fetching category items:", error);
    throw new Error("Failed to fetch category items");
  }
}

// Add a new function to get all items for a category (for admin)
export async function getAllCategoryItems(categoryId: string) {
  try {
    await connectToDatabase();
    // Return all items regardless of availability status
    const items = await MenuItem.find({ categoryId }).sort({ order: 1 })
    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error("Error fetching all category items:", error);
    throw new Error("Failed to fetch all category items");
  }
}

export async function createMenuItem(itemData: IMenuItem) {
  try {
    await connectToDatabase();

    // If order is not provided, set it to be the last item overall
    if (itemData.order === undefined) {
      const lastItem = await MenuItem.findOne({categoryId : itemData.categoryId}).sort({ order: -1 }).limit(1)
      itemData.order = lastItem ? (lastItem.order || 0) + 1 : 0
    }

    const newItem = new MenuItem(itemData)
    await newItem.save()

    // Populate categories before returning
    await newItem.populate("categoryId", "name")
    return JSON.parse(JSON.stringify(newItem));
  } catch (error) {
    console.error("Error creating menu item:", error);
    throw new Error("Failed to create menu item");
  }
}

export async function updateMenuItem(id: string, itemData: IMenuItem) {
  try {
    await connectToDatabase();
    const item = await MenuItem.findByIdAndUpdate(
      id,
      { $set: itemData },
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new Error("Menu item not found");
    }

    return JSON.parse(JSON.stringify(item));
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw new Error("Failed to update menu item");
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await connectToDatabase();
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      throw new Error("Menu item not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw new Error("Failed to delete menu item");
  }
}

export async function reorderMenuItems(categoryId: string, orderedIds: string[]) {
  try {
    await connectToDatabase();

    // Update each menu item with its new order
    const updatePromises = orderedIds.map((id, index) => {
      return MenuItem.findByIdAndUpdate(id, { order: index });
    });

    await Promise.all(updatePromises);

    return { success: true, message: "Menu items reordered successfully" };
  } catch (error) {
    console.error("Error reordering menu items:", error);
    throw new Error("Failed to reorder menu items");
  }
}