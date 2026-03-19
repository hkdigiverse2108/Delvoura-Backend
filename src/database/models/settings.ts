import mongoose from "mongoose";

export type Settings = {
  logo?: string;
  razorpayKey?: string;
  razorpaySecret?: string;
  phonepeKey?: string;
  phonepeSecret?: string;
  enrolledLearners?: number;
  classCompleted?: number;
  satisfactionRate?: number;
  link?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  socialMediaLinks?: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  isDeleted?: boolean;
};

const settingsSchema = new mongoose.Schema<Settings>(
  {
    logo: { type: String },
    razorpayKey: { type: String },
    razorpaySecret: { type: String },
    phonepeKey: { type: String },
    phonepeSecret: { type: String },
    enrolledLearners: { type: Number, default: 0 },
    classCompleted: { type: Number, default: 0 },
    satisfactionRate: { type: Number, default: 0 },
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
