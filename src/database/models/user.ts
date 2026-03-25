import { USER_ROLES } from "../../common";
import mongoose from "mongoose"
import type { User } from "../../types";

const userSchema = new mongoose.Schema<User>({
    firstName: { type: String },
    lastName:{type:String},
    email: { type: String, required: true },
    contact: {
        countryCode: { type: String },
        phoneNo: { type: Number },
    },
    roles: { type: String, default: USER_ROLES.USER },
    password: { type: String },
    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })

export const userModel = mongoose.model<User>('user', userSchema);
