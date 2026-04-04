import type mongoose from "mongoose";

export type Order = {
  userId?: mongoose.Types.ObjectId | null;
  addressId?: mongoose.Types.ObjectId | null;
  orderId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: {
    country: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pinCode: string;
    default?: boolean;
  }[];
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  discountCode?: string;
  subtotal: number;
  total: number;
  currency?: string;
  razorpayId?: string | null;
  phonePeId?: string | null;
  paymentStatus?: string;
  orderStatus?: string;
  isDeleted?: boolean;
};
