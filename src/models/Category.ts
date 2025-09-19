// import type mongoose from "mongoose"
import { Schema, model } from "mongoose"
import mongoose from "mongoose"

export interface ICategory {
  _id?: mongoose.Types.ObjectId | string
  name: string
  mainCategory: "صبحانه" | "قلیان" | "بار گرم" | "بار سرد" | "کیک و دسر" | "غذاها"
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    mainCategory: {
      type: String,
      enum: ["صبحانه", "قلیان", "بار گرم", "بار سرد", "کیک و دسر", "غذاها"],
      default: "غذاها",
    },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

export const Category = mongoose.models?.Category || model<ICategory>("Category", categorySchema)

