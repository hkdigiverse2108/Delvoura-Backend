import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { userModel } from "../../database";
import {apiResponse,generateHash,generateToken,getOtpExpireTime,getUniqueOtp,HTTP_STATUS,USER_ROLES,} from "../../common";
import {createData,email_verification_mail,getFirstMatch,password_reset_mail,reqInfo,responseMessage,updateData,} from "../../helper";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, verifyOtpSchema } from "../../validation";

const toSafeUser = (user: any) => {
  const userObject = user?.toObject ? user.toObject() : user;
  const { password, otp, otpExpireTime, __v, ...safeUser } = userObject || {};
  return safeUser;
};

//sigup
export const signup = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const { firstName, lastName, email, password, phoneNo, countryCode } = value ;
    const emailValue = email;
    const firstNameValue = firstName;
    const lastNameValue = lastName;
    const existingUser = await getFirstMatch(userModel, { email: emailValue, isDeleted: false }, {}, {});

    if (existingUser) {
      if (existingUser?.email === emailValue) {
        return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.alreadyEmail, {}, {}));
      }
      return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("User"), {}, {}));
    }

    const hashedPassword = await generateHash(password);
    const createdUser = await createData(userModel, {firstName: firstNameValue,lastName: lastNameValue,email: emailValue,phoneNo,password: hashedPassword,roles: USER_ROLES.USER,isActive: true,isDeleted: false,});

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED,responseMessage.signupSuccess,toSafeUser(createdUser),{}));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR,responseMessage.internalServerError,{},error));
  }
};

//login
export const login = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const { email, password } = value;
    const emailValue = email;

    const user = await getFirstMatch(userModel, { email: emailValue, isDeleted: false }, {}, {});

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidUserPasswordEmail, {}, {}));
    }

    if (user?.isActive === false) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(new apiResponse(HTTP_STATUS.FORBIDDEN, responseMessage.accountBlock, {}, {}));
    }

    const isPasswordMatch = await bcryptjs.compare(password, user?.password || "");
    if (!isPasswordMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidUserPasswordEmail, {}, {}));
    }

    if (user?.roles === USER_ROLES.ADMIN) {
      const otp = await getUniqueOtp();
      const otpExpireTime = getOtpExpireTime();
      await updateData(userModel, { _id: user._id }, { otp, otpExpireTime }, {});
      try {
        await email_verification_mail(user, otp);
      } catch (error) {
        await updateData(userModel, { _id: user._id }, { otp: null, otpExpireTime: null }, {});
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.otpSendFailed, {}, error));
      }
      const responseData = process.env.NODE_ENV === "production" ? {} : { otp, otpExpireTime };
      return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.otpSent, responseData, {}));
    }
    
    const tokenPayload = {_id: user._id,email: user.email,roles: user.roles,type: user.roles,generatedOn: Date.now(),};
    const token = await generateToken(tokenPayload, { expiresIn: "24h" });

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK,responseMessage.loginSuccess,{ token, user: toSafeUser(user) },{}) );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR,responseMessage.internalServerError,{},error));
  }
};

//forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const { email } = value;
    const user = await getFirstMatch(userModel, { email, isDeleted: false }, {}, {});

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidEmail, {}, {}));
    }

    if (user?.isActive === false) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(new apiResponse(HTTP_STATUS.FORBIDDEN, responseMessage.accountBlock, {}, {}));
    }

    const otp = await getUniqueOtp();
    const otpExpireTime = getOtpExpireTime();
    await updateData(userModel, { _id: user._id }, { otp, otpExpireTime }, {});

    try {
      await password_reset_mail(user, otp);
    } catch (error) {
      await updateData(userModel, { _id: user._id }, { otp: null, otpExpireTime: null }, {});
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.otpSendFailed, {}, error));
    }

    const responseData = process.env.NODE_ENV === "production" ? {} : { otp, otpExpireTime };
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.otpSent, responseData, {}));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

//reset password
export const resetPassword = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const { email, otp, password } = value;
    const user = await getFirstMatch(userModel, { email, isDeleted: false }, {}, {});

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidEmail, {}, {}));
    }

    if (user?.isActive === false) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(new apiResponse(HTTP_STATUS.FORBIDDEN, responseMessage.accountBlock, {}, {}));
    }

    if (Number(user?.otp) !== Number(otp)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidOTP, {}, {}));
    }

    if (user?.otpExpireTime && user.otpExpireTime < new Date()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.expireOTP, {}, {}));
    }

    const hashedPassword = await generateHash(password);
    await updateData(userModel, { _id: user._id }, { password: hashedPassword, otp: null, otpExpireTime: null }, {});

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.resetPasswordSuccess, {}, {}));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.resetPasswordError, {}, error));
  }
};

//verifyOtp
export const verifyOtp = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { error, value } = verifyOtpSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const { email, otp } = value;

    const user = await getFirstMatch(userModel, { email, isDeleted: false }, {}, {});
    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.getDataNotFound("User"), {}, {}));
    }

    if (user?.roles !== USER_ROLES.ADMIN) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {}));
    }

    if (user?.isActive === false) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(new apiResponse(HTTP_STATUS.FORBIDDEN, responseMessage.accountBlock, {}, {}));
    }

    if (Number(user?.otp) !== Number(otp)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidOTP, {}, {}));
    }

    if (user?.otpExpireTime && user.otpExpireTime < new Date()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.expireOTP, {}, {}));
    }

    await updateData(userModel, { _id: user._id }, { otp: null, otpExpireTime: null }, {});

    const tokenPayload = {_id: user._id,email: user.email,roles: user.roles,type: user.roles,generatedOn: Date.now(),};
    const token = await generateToken(tokenPayload, { expiresIn: "24h" });

    return res.status(HTTP_STATUS.OK).json( new apiResponse(HTTP_STATUS.OK,responseMessage.loginSuccess,{ token, user: toSafeUser(user) },{}) );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
