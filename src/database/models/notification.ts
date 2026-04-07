import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    eventType: { type: String, required: true, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const notificationModel = mongoose.model("notification", notificationSchema, "notification");
