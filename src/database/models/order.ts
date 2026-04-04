import mongoose from "mongoose";
import { randomUUID } from "crypto";
import type { Order } from "../../types";

const generateOrderId = () => randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();

const orderSchema = new mongoose.Schema<Order>(
  {
    orderId: {type: String,unique: true,sparse: true,index: true,minlength: 5,maxlength: 5,default: generateOrderId,},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "address", default: null },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    shippingAddress: [
      {
        country: { type: String, required: true },
        address1: { type: String, required: true },
        address2: { type: String, default: "" },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pinCode: { type: String, required: true },
        default: { type: Boolean, default: false },
      },
    ],
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    discountCode: { type: String },
    subtotal: { type: Number, required: true },
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
