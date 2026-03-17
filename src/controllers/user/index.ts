import { Request, Response } from "express";
import { apiResponse, generateHash, HTTP_STATUS, isValidObjectId } from "../../common";
import { userModel } from "../../database";
import { getData, getFirstMatch, reqInfo, responseMessage, updateData, } from "../../helper";
import { adminUpdateUserSchema } from "../../validation";

const toSafeUser = (user: any) => {
  const userObject = user?.toObject ? user.toObject() : user;
  const { password, otp, otpExpireTime, __v, ...safeUser } = userObject || {};
  return safeUser;
};

const normalizeParamId = (raw: string | string[] | undefined) => {
  if (Array.isArray(raw)) return raw[0];
  return raw;
};

export const adminGetUsers = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const users = await getData(userModel, { isDeleted: false }, {}, {});
    const safeUsers = Array.isArray(users) ? users.map(toSafeUser) : [];

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Users"), safeUsers, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const adminUpdateUser = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const id = normalizeParamId(req.params.id);
    if (!id || !isValidObjectId(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("User"), {}, {}));
    }

    const { error, value } = adminUpdateUserSchema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    }

    const existingUser = await getFirstMatch(userModel, { _id: id, isDeleted: false }, {}, {});

    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("User"), {}, {}));
    }

    const updatePayload: any = {};

    if (value.firstName !== undefined) updatePayload.firstName = value.firstName.trim();
    if (value.lastName !== undefined) updatePayload.lastName = value.lastName.trim();
    if (value.name) {
      const nameValue = value.name.trim();
      updatePayload.firstName = nameValue.split(" ")[0];
      updatePayload.lastName = nameValue.split(" ").slice(1).join(" ");
    }
    if (value.phoneNo !== undefined) updatePayload.phoneNo = value.phoneNo;
    if (value.phoneNumber !== undefined) updatePayload.phoneNo = value.phoneNumber;
    if (value.roles !== undefined) updatePayload.roles = value.roles;
    if (value.role !== undefined) updatePayload.roles = value.role;
    if (typeof value.isActive === "boolean") updatePayload.isActive = value.isActive;

    if (value.email) {
      const normalizedEmail = value.email.toLowerCase().trim();
      const emailExists = await getFirstMatch(userModel, { email: normalizedEmail, _id: { $ne: id }, isDeleted: false }, {}, {});
      if (emailExists) {
        return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("User"), {}, {}));
      }
      updatePayload.email = normalizedEmail;
    }

    if (value.password) {
      updatePayload.password = await generateHash(value.password);
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.addDataError, {}, {}));
    }
    const updatedUser = await updateData(userModel, { _id: id }, updatePayload, {});

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("User"), toSafeUser(updatedUser), {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const adminDeleteUser = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const id = normalizeParamId(req.params.id);
    if (!id || !isValidObjectId(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("User"), {}, {}));
    }
    const existingUser = await getFirstMatch(userModel, { _id: id, isDeleted: false }, {}, {});

    if (!existingUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("User"), {}, {}));
    }

    await updateData(userModel, { _id: id }, { isDeleted: true, isActive: false }, {});

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("User"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
