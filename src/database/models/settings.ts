import mongoose from "mongoose";
import type { Settings } from "../../types";

const settingsSchema = new mongoose.Schema<Settings>(
  {
    logo: { type: String },
    isRazorpay: { type: Boolean, default: false },
    razorpayApiKey: { type: String, default: null },
    razorpayApiSecret: { type: String, default: null },
    isPhonePe: { type: Boolean, default: false },
    phonePeApiKey: { type: String, default: null },
    phonePeApiSecret: { type: String, default: null },
    phonePeVersion: { type: String, default: null },
    link: { type: String, default: null },
    address: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    email: { type: String, default: null },
    socialMediaLinks: {
      facebook: { type: String, default: null },
      twitter: { type: String, default: null },
      instagram: { type: String, default: null },
      linkedin: { type: String, default: null },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const settingsModel = mongoose.model<Settings>("settings", settingsSchema, "settings");
