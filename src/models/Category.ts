// import type mongoose from "mongoose"
import { Schema, model } from "mongoose"
import mongoose from "mongoose"

export interface ICategory {
  _id?: mongoose.Types.ObjectId | string
  name: string
  description?: string
  bgColor?: string
  textColor?: string
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    bgColor: {type: String},
    textColor: {type: String},
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

export const Category = mongoose.models?.Category || model<ICategory>("Category", categorySchema)

