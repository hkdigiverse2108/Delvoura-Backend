import mongoose from "mongoose";

export type Season = {
  name: string;
  isActive?: boolean;
  isDeleted?: boolean;
};

const seasonSchema = new mongoose.Schema<Season>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const seasonModel = mongoose.model<Season>("season", seasonSchema, "season");
