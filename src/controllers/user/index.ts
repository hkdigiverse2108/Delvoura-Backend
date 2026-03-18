import { apiResponse, generateHash, HTTP_STATUS, isValidObjectId, parseDateRange, USER_ROLES } from "../../common";
import { userModel } from "../../database";
import { countData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData, } from "../../helper";
import { deleteUserSchema, getUsersSchema, updateUserSchema } from "../../validation";

export const updateUser = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateUserSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    let isExist = await getFirstMatch(userModel, { _id: isValidObjectId(value.userId), isDeleted: false }, {}, {});
    if (!isExist) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("User"), {}, {}));

    isExist = await getFirstMatch(userModel, { email: value.email, _id: { $ne: isValidObjectId(value.userId) }, isDeleted: false }, {}, {});
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Email"), {}, {}));

    if (value.password) value.password = await generateHash(value.password);

    const response = await updateData(userModel, { _id: isValidObjectId(value.userId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("User"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteUser = async (req, res) => {
  reqInfo(req);
  try {

    const { error, value } = deleteUserSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    let isExist = await getFirstMatch(userModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!isExist) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("User"), {}, {}));

    await updateData(userModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("User"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getUsers = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getUsersSchema.validate(req.query)
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter } = value
    let criteria: any = { role: USER_ROLES.USER, isDeleted: false }, options: any = { lean: true }

    if (search) {
      criteria.$or = [
        { firstName: { $regex: search, $options: 'si' } },
        { lastName: { $regex: search, $options: 'si' } },
        { email: { $regex: search, $options: 'si' } },
        { 'contact.phoneNo': { $regex: search, $options: 'si' } },
      ]
    }

    const dateRange = parseDateRange(startDateFilter, endDateFilter);
    if (startDateFilter && endDateFilter && !dateRange) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.customMessage("Invalid date filter"), {}, {}));
    }
    if (dateRange) {
      criteria.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    if (page && limit) {
      options.page = parseInt(page)
      options.limit = parseInt(limit)
    }

    const response = await getDataWithSorting(userModel, criteria, {}, options)
    const totalCount = await countData(userModel, criteria)

    const stateObj = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || totalCount,
      page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Users"), {
      user_data: response,
      totalData: totalCount,
      state: stateObj
    }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};


