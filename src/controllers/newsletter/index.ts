import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { newsletterModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createNewsletterSchema, deleteNewsletterSchema, getNewslettersSchema } from "../../validation";

export const createNewsletter = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createNewsletterSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const emailValue = value.email.toLowerCase();
    value.email = emailValue;
    const exists = await getFirstMatch(newsletterModel, { email: emailValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Email"), {}, {}));

    const response = await createData(newsletterModel, value);

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Newsletter"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};


export const deleteNewsletter = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteNewsletterSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(newsletterModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Newsletter"), {}, {}));

    await updateData(newsletterModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Newsletter"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getNewsletters = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getNewslettersSchema.validate(req.query);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, ActiveFilter, status } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true };

    if (search) {
      criteria.$or = [
        { email: { $regex: search, $options: "si" } },
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

    const response = await getDataWithSorting(newsletterModel, criteria, {}, options);
    const totalCount = await countData(newsletterModel, criteria);

    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Newsletters"), { newsletter_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
