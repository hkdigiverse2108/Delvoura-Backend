import mongoose from "mongoose";

export type Topbar = {
  topbarItems: string[];
  isActive?: boolean;
  isDeleted?: boolean;
};

const topbarSchema = new mongoose.Schema<Topbar>(
  {
    topbarItems: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const topbarModel = mongoose.model<Topbar>("topbar", topbarSchema, "topbar");
