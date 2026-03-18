import { apiResponse, HTTP_STATUS, isValidObjectId } from "../../common";
import { ingredientModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createIngredientSchema, deleteIngredientSchema, getIngredientsSchema, updateIngredientSchema } from "../../validation";

export const createIngredient = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createIngredientSchema.validate(req.body);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const nameValue = value.name.trim();
    value.name = nameValue;
    const exists = await getFirstMatch(ingredientModel, { name: nameValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));

    const response = await createData(ingredientModel, value);

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Ingredient"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateIngredient = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateIngredientSchema.validate(req.body);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(ingredientModel, { _id: isValidObjectId(value.ingredientId), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Ingredient"), {}, {}));

    const nameValue = value.name.trim();
    let isExist = await getFirstMatch(ingredientModel, { name: nameValue, _id: { $ne: isValidObjectId(value.ingredientId) }, isDeleted: false }, {}, {});
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Name"), {}, {}));
    value.name = nameValue;

    const updated = await updateData(ingredientModel, { _id: isValidObjectId(value.ingredientId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Ingredient"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteIngredient = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteIngredientSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(ingredientModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Ingredient"), {}, {}));

    await updateData(ingredientModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Ingredient"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getIngredients = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getIngredientsSchema.validate(req.query)
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

    const response = await getDataWithSorting(ingredientModel, criteria, {}, options)
    const totalCount = await countData(ingredientModel, criteria)

    const stateObj = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || totalCount,
      page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
    }

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Ingredients"), {
      ingredient_data: response,
      totalData: totalCount,
      state: stateObj
    }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
