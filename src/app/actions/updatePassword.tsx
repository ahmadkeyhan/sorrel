"use server"

import { auth } from "@/auth"
import connectToDatabase from "@/lib/mongodb"
import { User } from "@/models/User"

export async function updatePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await auth()

    if (!session || !session.user.id) {
      return { success: false, message: "You must be logged in to change your password" }
    }

    await connectToDatabase()

    // Find the user and include the password field
    const user = await User.findById(session.user.id).select("+password")

    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)

    if (!isPasswordValid) {
      return { success: false, message: "Current password is incorrect" }
    }

    // Update the password (the pre-save hook in the User model will hash it)
    user.password = newPassword
    await user.save()

    return { success: true, message: "Password updated successfully" }
  } catch (error: any) {
    console.error("Error updating password:", error)
    return { success: false, message: error.message || "Failed to update password" }
  }
}
