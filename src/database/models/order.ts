import mongoose from "mongoose";
import type { Order } from "../../types";

const orderSchema = new mongoose.Schema<Order>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

  
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    shippingAddress: [
      {
        country: { type: String, required: true },
        address1: { type: String, required: true },
        address2: { type: String, isDefault: "" },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pinCode: { type: String, required: true },
        default: { type: Boolean, default: false }, 
      },
    ],
    items: [{
        productId: {type: mongoose.Schema.Types.ObjectId,ref: "product",required: true,},
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    discountCode: { type: String },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayId: { type: String, default: null },
    phonePeId: { type: String, default: null },
    paymentStatus: { type: String, default: "pending" },
    orderStatus: { type: String, default: "placed" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const orderModel = mongoose.model<Order>("order", orderSchema, "order");
