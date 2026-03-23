import mongoose from "mongoose";

export type ContactUs = {
  fullName: string;
  email: string;
  countryCode?: string;
  phone?: string;
  message: string;
  isRead?: boolean;
  isDeleted?: boolean;
};

const contactUsSchema = new mongoose.Schema<ContactUs>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const contactUsModel = mongoose.model<ContactUs>("contactus", contactUsSchema, "contactus");
