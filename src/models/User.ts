import { Schema, model, models } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser {
  _id?: string
  name: string
//   email: string
  password: string
  role: "admin" | "employee"
  createdAt?: Date
  updatedAt?: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    // },
    password: {
      type: String,
      required: true,
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
  },
  {
    timestamps: true
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    console.log(error)
    return false
  }
}

export const User = models.User || model<IUser>("User", userSchema)

