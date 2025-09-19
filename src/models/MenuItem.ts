// import type mongoose from "mongoose"
import { Schema, model } from "mongoose"
import mongoose from "mongoose"

export interface IMenuItemMaterial {
  materialId: mongoose.Types.ObjectId
  units: number // how many units of this material are needed
}

export interface IPriceListItem {
  subItem: string,
  price: number
  materials?: IMenuItemMaterial[] // NEW: materials for this specific variation
}


export interface IMenuItem {
  _id?: mongoose.Types.ObjectId | string
  name: string
  description?: string
  iconName?: string
  priceList: IPriceListItem[] // Add the price list array
  categoryIds: mongoose.Types.ObjectId[] | string[]
  ingredients?: string
  image?: string
  order?: number
  available: boolean
  createdAt?: Date
  updatedAt?: Date
}

const MenuItemMaterialSchema = new Schema<IMenuItemMaterial>({
  materialId: {
    type: Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  units: {
    type: Number,
    required: true,
    min: 0,
  },
})

const PriceListItemSchema = new Schema<IPriceListItem>({
  subItem: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  materials: [MenuItemMaterialSchema], // Materials for this specific variation
})

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String},
    iconName: {type: String},
    priceList: [PriceListItemSchema], // Add the price list array
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
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

