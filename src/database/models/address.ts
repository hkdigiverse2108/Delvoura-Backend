import mongoose from "mongoose";
import type { Address } from "../../types";

const addressSchema = new mongoose.Schema<Address>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    country: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const addressModel = mongoose.model<Address>("address", addressSchema, "address");
