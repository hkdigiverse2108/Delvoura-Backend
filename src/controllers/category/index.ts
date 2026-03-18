import { apiResponse, HTTP_STATUS, isValidObjectId } from "../../common";
import { categoryModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createCategorySchema, deleteCategorySchema, getCategoriesSchema, updateCategorySchema } from "../../validation";

export const createCategory = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const nameValue = value.name.trim();
    value.name = nameValue;
    const exists = await getFirstMatch(categoryModel, { name: nameValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));

    const response = await createData(categoryModel, value);

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Category"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateCategory = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(categoryModel, { _id: isValidObjectId(value.categoryId), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Category"), {}, {}));

    const nameValue = value.name.trim();
    let isExist = await getFirstMatch(categoryModel, { name: nameValue, _id: { $ne: isValidObjectId(value.categoryId) }, isDeleted: false }, {}, {});
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));
    value.name = nameValue;

    const updated = await updateData(categoryModel, { _id: isValidObjectId(value.categoryId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Category"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteCategory = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteCategorySchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(categoryModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Category"), {}, {}));

    await updateData(categoryModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Category"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getCategories = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getCategoriesSchema.validate(req.query)
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));
    
    const { page, limit, search, startDateFilter, endDateFilter } = value
    let criteria: any = { isDeleted: false }, options: any = { lean: true }

    if (search) {
      criteria.$or = [
        { name: { $regex: search, $options: 'si' } },
      ]
    }

    if (startDateFilter && endDateFilter) {
      criteria.createdAt = { $gte: new Date(startDateFilter), $lte: new Date(endDateFilter) }
    }

    if (page && limit) {
      options.page = parseInt(page)
      options.limit = parseInt(limit)
    }

    const response = await getDataWithSorting(categoryModel, criteria, {}, options)
    const totalCount = await countData(categoryModel, criteria)

    const stateObj = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || totalCount,
      page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Categories"), {
      category_data: response,
      totalData: totalCount,
      state: stateObj
    }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
