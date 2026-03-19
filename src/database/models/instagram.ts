import mongoose from "mongoose";

export type InstagramPost = {
  imageUrl: string;
  postUrl: string;
  altText?: string | null;
};

export type Instagram = {
  instagramPosts: InstagramPost[];
  isActive?: boolean;
  isDeleted?: boolean;
};

const instagramSchema = new mongoose.Schema<Instagram>(
  {
    instagramPosts: [
      {
        imageUrl: { type: String, required: true },
        postUrl: { type: String, required: true },
        altText: { type: String, default: null },
      },
    ],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const instagramModel = mongoose.model<Instagram>("instagram", instagramSchema, "instagram");
