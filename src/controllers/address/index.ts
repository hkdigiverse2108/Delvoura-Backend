import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { addressModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData, updateMany } from "../../helper";
import { createAddressSchema, deleteAddressSchema, getAddressByIdSchema, getAddressesSchema, updateAddressSchema } from "../../validation";

const buildAddressPayload = (value: any) => {
  const payload: any = {};
  if (typeof value.country !== "undefined") payload.country = value.country;
  if (typeof value.address1 !== "undefined") payload.address1 = value.address1;
  if (typeof value.address2 !== "undefined") payload.address2 = value.address2;
  if (typeof value.city !== "undefined") payload.city = value.city;
  if (typeof value.state !== "undefined") payload.state = value.state;
  if (typeof value.pinCode !== "undefined") payload.pinCode = value.pinCode;
  if (typeof value.isDefault !== "undefined") payload.isDefault = value.isDefault;
  if (typeof value.isActive !== "undefined") payload.isActive = value.isActive;
  return payload;
};

export const createAddress = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createAddressSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const authUser = req?.headers?.user as any;
    if (!authUser?._id) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {}));

    let isDefault = value.isDefault;
    if (typeof isDefault === "undefined") {
      const existingCount = await countData(addressModel, { userId: authUser._id, isDeleted: false });
      if (existingCount === 0) isDefault = true;
    }

    if (isDefault) {
      await updateMany(addressModel, { userId: authUser._id, isDeleted: false }, { isDefault: false }, {});
    }

    const payload = { ...value, userId: authUser._id, isDefault: Boolean(isDefault) };
    const response = await createData(addressModel, payload);

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Address"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateAddress = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateAddressSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const authUser = req?.headers?.user as any;
    if (!authUser?._id) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {}));

    const addressId = isValidObjectId(value.addressId);
    if (!addressId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Address"), {}, {}));

    const existing = await getFirstMatch(addressModel, { _id: addressId, isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Address"), {}, {}));
    if (String(existing.userId) !== String(authUser._id)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {}));
    }

    const payload = buildAddressPayload(value);
    if (Object.keys(payload).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Nothing to update"), {}, {}));
    }

    if (payload.isDefault === true) {
      await updateMany(addressModel, { userId: authUser._id, _id: { $ne: addressId }, isDeleted: false }, { isDefault: false }, {});
    }

    const updated = await updateData(addressModel, { _id: addressId }, payload, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Address"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteAddress = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteAddressSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const authUser = req?.headers?.user as any;
    if (!authUser?._id) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {}));

    const addressId = isValidObjectId(value.id);
    if (!addressId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Address"), {}, {}));

    const existing = await getFirstMatch(addressModel, { _id: addressId, isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Address"), {}, {}));
    if (String(existing.userId) !== String(authUser._id)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {}));
    }

    await updateData(addressModel, { _id: addressId }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Address"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getAddresses = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getAddressesSchema.validate(req.query || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const authUser = req?.headers?.user as any;
    if (!authUser?._id) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, ActiveFilter, status } = value;
    let criteria: any = { userId: authUser._id, isDeleted: false }, options: any = { lean: true, sort: { createdAt: -1 } };

    if (search) {
      criteria.$or = [
        { country: { $regex: search, $options: "si" } },
        { address1: { $regex: search, $options: "si" } },
        { address2: { $regex: search, $options: "si" } },
        { city: { $regex: search, $options: "si" } },
        { state: { $regex: search, $options: "si" } },
        { pinCode: { $regex: search, $options: "si" } },
      ];
    }
    
    if (typeof ActiveFilter !== "undefined") {
      criteria.isActive = ActiveFilter;
    } else if (status === "active") {
      criteria.isActive = true;
    } else if (status === "inactive") {
      criteria.isActive = false;
    }

    const dateRange = parseDateRange(startDateFilter, endDateFilter);
    if (startDateFilter && endDateFilter && !dateRange) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid date filter"), {}, {}));
    }
    if (dateRange) {
      criteria.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    const { page: pageValue, limit: limitValue, skip, hasLimit } = resolvePagination(page, limit);
    if (hasLimit) {
      options.skip = skip;
      options.limit = limitValue;
    }

    const response = await getDataWithSorting(addressModel, criteria, {}, options);
    const totalCount = await countData(addressModel, criteria);
    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Addresses"), { address_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getAddressById = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getAddressByIdSchema.validate(req.params || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const authUser = req?.headers?.user as any;
    if (!authUser?._id) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.invalidToken, {}, {}));

    const addressId = isValidObjectId(value.id);
    if (!addressId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Address"), {}, {}));

    const response = await getFirstMatch(addressModel, { _id: addressId, isDeleted: false }, {}, {});
    if (!response) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Address"), {}, {}));
    if (String(response.userId) !== String(authUser._id)) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage.accessDenied, {}, {}));
    

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Address"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
