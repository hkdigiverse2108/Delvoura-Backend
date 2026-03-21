import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { productModel, ratingModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createRatingSchema, deleteRatingSchema, getRatingsSchema, updateRatingSchema } from "../../validation";

export const createRating = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createRatingSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const product = await getFirstMatch(productModel, { _id: isValidObjectId(value.productId), isDeleted: false }, {}, {});
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    const response = await createData(ratingModel, value);
    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Rating"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateRating = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateRatingSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(ratingModel, { _id: isValidObjectId(value.ratingId), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Rating"), {}, {}));

    const updated = await updateData(ratingModel, { _id: isValidObjectId(value.ratingId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Rating"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteRating = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteRatingSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(ratingModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Rating"), {}, {}));

    await updateData(ratingModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Rating"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getRatings = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getRatingsSchema.validate(req.query);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const product = await getFirstMatch(productModel, { _id: isValidObjectId(value.productId), isDeleted: false }, {}, {});
    if (!product) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Product"), {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter } = value;
    let criteria: any = { productId: product._id, isDeleted: false }, options: any = { lean: true, sort: { createdAt: -1 } };

    if (search) {
      criteria.$or = [
        { firstName: { $regex: search, $options: "si" } },
        { lastName: { $regex: search, $options: "si" } },
        { email: { $regex: search, $options: "si" } },
        { description: { $regex: search, $options: "si" } },
      ];
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

    const response = await getDataWithSorting(ratingModel, criteria, {}, options);
    const totalCount = await countData(ratingModel, criteria);

    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Ratings"), { rating_data: response, totalData: totalCount, state: stateObj, }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

