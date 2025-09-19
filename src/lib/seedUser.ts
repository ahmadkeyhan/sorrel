import connectToDatabase from "./mongodb"
import { User } from "../models/User"

async function seedAdminUser() {
  try {
    await connectToDatabase()

    // Check if admin user already exists
    const adminExists = await User.findOne({ name: "admin" })

    if (!adminExists) {
      // Create admin user
      const adminUser = new User({
        name: "admin",
      //   email: "admin@example.com",
        password: "adminqq", // This will be hashed by the pre-save hook
        role: "admin",
      })

      await adminUser.save()
      console.log("Admin user created successfully")
    } else {
      console.log("Admin user already exists")
    }

    // Check if employee user already exists
    const employeeExists = await User.findOne({ name: "waiter" })

    if (!employeeExists) {
      // Create employee user
      const employeeUser = new User({
        name: "waiter",
        // email: "employee@example.com",
        password: "waiter123", // This will be hashed by the pre-save hook
        role: "employee",
      })

      await employeeUser.save()
      console.log("Employee user created successfully")
    } else {
      console.log("Employee user already exists")
    }

  } catch (error) {
    console.error("Error seeding users:", error)
  }
}

export default seedAdminUser

