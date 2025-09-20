// import type mongoose from "mongoose"
import { Schema, model } from "mongoose"
import mongoose from "mongoose"



export interface IMenuItem {
  _id?: mongoose.Types.ObjectId | string
  name: string
  price?: number[]
  categoryId: mongoose.Types.ObjectId | string
  ingredients?: string
  image?: string
  order?: number
  available: boolean
  createdAt?: Date
  updatedAt?: Date
}



const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    price: [{ type: Number }], 
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ingredients: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

export const MenuItem = mongoose.models?.MenuItem || model<IMenuItem>("MenuItem", menuItemSchema)

