import { apiResponse, getPaginationState, HTTP_STATUS, isValidObjectId, parseDateRange, resolvePagination } from "../../common";
import { blogModel } from "../../database";
import { countData, createData, getDataWithSorting, getFirstMatch, reqInfo, responseMessage, updateData } from "../../helper";
import { createBlogSchema, deleteBlogSchema, getBlogByIdSchema, getBlogsSchema, updateBlogSchema } from "../../validation";

export const createBlog = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = createBlogSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const titleValue = value.title;
    value.title = titleValue;
    const exists = await getFirstMatch(blogModel, { title: titleValue, isDeleted: false }, {}, {});
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Title"), {}, {}));

    const response = await createData(blogModel, value);
    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage.addDataSuccess("Blog"), response, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const updateBlog = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = updateBlogSchema.validate(req.body || {});
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(blogModel, { _id: isValidObjectId(value.blogId), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Blog"), {}, {}));

    const titleValue = value.title;
    const isExist = await getFirstMatch(blogModel, { title: titleValue, _id: { $ne: isValidObjectId(value.blogId) }, isDeleted: false }, {}, {});
    if (isExist) return res.status(HTTP_STATUS.CONFLICT).json(new apiResponse(HTTP_STATUS.CONFLICT, responseMessage.dataAlreadyExist("Title"), {}, {}));
    value.title = titleValue;

    const updated = await updateData(blogModel, { _id: isValidObjectId(value.blogId) }, value, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.updateDataSuccess("Blog"), updated, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const deleteBlog = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = deleteBlogSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const existing = await getFirstMatch(blogModel, { _id: isValidObjectId(value.id), isDeleted: false }, {}, {});
    if (!existing) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Blog"), {}, {}));

    await updateData(blogModel, { _id: isValidObjectId(value.id) }, { isDeleted: true }, {});
    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.deleteDataSuccess("Blog"), {}, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getBlogs = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getBlogsSchema.validate(req.query);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const { page, limit, search, startDateFilter, endDateFilter, ActiveFilter, status } = value;
    let criteria: any = { isDeleted: false }, options: any = { lean: true };

    if (search) {
      criteria.$or = [
        { title: { $regex: search, $options: "si" } },
        { content: { $regex: search, $options: "si" } },
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

    const response = await getDataWithSorting(blogModel, criteria, {}, options);
    const totalCount = await countData(blogModel, criteria);

    const stateObj = getPaginationState(totalCount, pageValue, limitValue);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Blogs"), { blog_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};

export const getBlogById = async (req, res) => {
  reqInfo(req);
  try {
    const { error, value } = getBlogByIdSchema.validate(req.params);
    if (error) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error.details[0].message, {}, {}));

    const blogId = isValidObjectId(value.id);
    if (!blogId) return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage.invalidId("Blog"), {}, {}));

    const blog = await getFirstMatch(blogModel, { _id: blogId, isDeleted: false }, {}, {});
    if (!blog) return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage.getDataNotFound("Blog"), {}, {}));

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage.getDataSuccess("Blog"), blog, {}));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage.internalServerError, {}, error));
  }
};
