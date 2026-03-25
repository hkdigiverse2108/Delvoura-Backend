import mongoose from "mongoose";
import type { ContactUs } from "../../types";

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
