import { getFirstMatch } from "../helper";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"
import { Types } from "mongoose";
import { userModel } from "../database";

const jwtSecretKey = process.env.JWT_TOKEN_SECRET;

export class apiResponse {
    private status:number | null;
    private message:string |null;
    private data:any | null;
    private error:any | null;

    constructor(status:number,message:string,data:any,error:any){
        this.status=status;
        this.message=message;
        this.data=data;
        this.error=error;
    }
}


const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

export const getUniqueOtp = async () => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const otp = generateOtp();
    const isAlreadyAssign = await getFirstMatch(userModel, { otp }, {}, {});

    if (!isAlreadyAssign) return otp;
    attempts++;
  }

  throw new Error("Failed To Generate Otp");
};

export const getOtpExpireTime = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

export const generateHash = async (password = "") => {
  const salt = await bcryptjs.genSalt(10);
  const hashPassword = bcryptjs.hash(password, salt);
  return hashPassword;
};

export const generateToken = async (data = {}, expiresIn = {}) => {
  const token = jwt.sign(data, jwtSecretKey, expiresIn);
  return token;
};

export const isValidObjectId = (id = "") => {
  return Types.ObjectId.isValid(id) ? id : false;
};
