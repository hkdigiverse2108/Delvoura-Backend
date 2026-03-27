import type mongoose from "mongoose";

export type Address = {
  userId: mongoose.Types.ObjectId;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
};
