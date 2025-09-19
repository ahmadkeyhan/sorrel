// import type mongoose from "mongoose"
import { Schema, model } from "mongoose"
import mongoose from "mongoose"

export interface IProduct {
  _id?: mongoose.Types.ObjectId | string
  name: string
  description?: string
  price: number
  image?: string
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String},
    price: {type: Number, required: true},
    image: { type: String },
    order: { type: Number, default: 0 }
  },
  {
    timestamps: true
  },
)

export const Product = mongoose.models?.Product || model<IProduct>("Product", productSchema)

