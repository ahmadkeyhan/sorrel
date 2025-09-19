"use server";

import connectToDatabase from "../mongodb";
import { User, IUser } from "../../models/User";
import mongoose from "mongoose";

//User CRUD operations
// Get all users
export async function getUsers() {
  try {
    await connectToDatabase();
    const users = await User.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Create a new user
export async function createUser(userData: IUser) {
  try {
    await connectToDatabase();
    const newUser = new User({
      ...userData,
      _id: new mongoose.Types.ObjectId(),
    });
    await newUser.save();
    return JSON.parse(JSON.stringify(newUser));
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      throw new Error("Username already exists");
    }
    throw new Error("Failed to create user");
  }
}

// Update a user
export async function updateUser(
  id: string,
  userData: Partial<{
    name: string;
    email: string;
    password: string;
    role: "admin" | "employee";
  }>
) {
  try {
    await connectToDatabase();

    // If password is being updated, we need to handle it specially
    if (userData.password) {
      // Find the user first
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Update user fields
      if (userData.name) user.name = userData.name;
      if (userData.email) user.email = userData.email;
      if (userData.role) user.role = userData.role;

      // Set the password - it will be hashed by the pre-save hook
      user.password = userData.password;

      // Save the user to trigger the pre-save hook
      await user.save();
      return JSON.parse(JSON.stringify(user));
    } else {
      // For non-password updates, we can use findByIdAndUpdate
      const user = await User.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return JSON.parse(JSON.stringify(user));
    }
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      throw new Error("Username already exists");
    }
    throw new Error(error.message || "Failed to update user");
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}