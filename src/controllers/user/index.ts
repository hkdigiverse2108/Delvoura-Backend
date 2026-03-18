import { Request, Response } from "express";
import { apiResponse, generateHash, HTTP_STATUS, isValidObjectId } from "../../common";
import { userModel } from "../../database";
import { countData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
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

const applyDateFilter = (criteria: any, startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return;

  const createdAt: any = {};
  if (typeof startDate === "string") {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) createdAt.$gte = start;
  }
  if (typeof endDate === "string") {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) createdAt.$lte = end;
  }

  if (Object.keys(createdAt).length > 0) criteria.createdAt = createdAt;
};

const parsePositiveInt = (value: any) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const adminGetUsers = async (req: Request, res: Response) => {
  reqInfo(req);
  try {
    const { page, limit, search, startDate, endDate, activeFilter } = req.query;

    const criteria: any = { isDeleted: false };

    const searchValue = typeof search === "string" ? search : "";
    if (searchValue) {
      criteria.$or = [
        { firstName: { $regex: searchValue, $options: "si" } },
        { lastName: { $regex: searchValue, $options: "si" } },
        { email: { $regex: searchValue, $options: "si" } },
      ];
    }

    if (activeFilter !== undefined) criteria.isActive = activeFilter == "true";

    applyDateFilter(criteria, startDate as string, endDate as string);

    const options: any = { sort: { createdAt: -1 } };
    const pageValue = parsePositiveInt(page);
    const limitValue = parsePositiveInt(limit);

    if (pageValue && limitValue) {
      options.skip = (pageValue - 1) * limitValue;
      options.limit = limitValue;
    }

    const users = await getDataWithSorting(userModel, criteria, { password: 0 }, options);
    const safeUsers = Array.isArray(users) ? users.map(toSafeUser) : [];
    const totalData = await countData(userModel, criteria);
    const totalPages = limitValue ? Math.ceil(totalData / limitValue) || 1 : 1;

    const stateObj = {
      page,
      limit,
      totalPages,
    };

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Users"), { user_data: safeUsers, totalData, state: stateObj }, {}));
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
