import type mongoose from "mongoose";

export type Order = {
  userId?: mongoose.Types.ObjectId | null;
  email: string;
  shippingAddress: {
    country: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
  };
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    size?: string;
  }[];
  discountCode?: string;
  subtotal: number;
  shipping?: number;
  tax?: number;
  total: number;
  currency?: string;
  razorpayId?: string | null;
  phonePeId?: string | null;
  paymentStatus?: string;
  orderStatus?: string;
  isDeleted?: boolean;
};