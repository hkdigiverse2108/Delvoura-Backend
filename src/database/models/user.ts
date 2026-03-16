import { USER_ROLES } from "../../common";
import mongoose from "mongoose"

const userSchema: any = new mongoose.Schema({
    firstName: { type: String },
    lastName:{type:String},
    email: { type: String, required: true },
    phoneNo: {
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

export const userModel = mongoose.model('user', userSchema);