import path from "path";
import fs from "fs";
import url from "url"
import { apiResponse, HTTP_STATUS } from "../../common";
import { reqInfo, responseMessage } from "../../helper";
import { deleteImageSchema } from "../../validation";
import { ok } from "assert";

export const uploadFile = async (req, res) => {
    reqInfo(req)
    try {
        const hasImage = (req?.files && req?.files?.length > 0) || req?.file;

        if (!hasImage) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage?.noFileUploaded, {}, {}))
        }

        const uploadedImages = [];

        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
                const cleanPath = file.path.replace(/\\/g, "/");
                uploadedImages.push(`${process.env.BACKEND_URL}/${cleanPath}`);
            });
        }

        if (req.file) {
            const cleanPath = req.file.path.replace(/\\/g, "/");
            uploadedImages.push(`${process.env.BACKEND_URL}/${cleanPath}`);
        }

        return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED, responseMessage?.fileUploadSuccess, { images: uploadedImages }, {}))
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage?.internalServerError, {}, error))
    }
}

export const getAllImages = async (req, res) => {
    reqInfo(req)
    try {
        const dir = path.join("public/images");

        if (!fs.existsSync(dir)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage?.noFileUploaded, {}, {}))
        }

        const image = fs.readdirSync(dir).map(
            (file) => `${process.env.BACKEND_URL}/public/images/${file}`
        )

        return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage?.getDataSuccess("images"), {}, {}))
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage?.internalServerError, {}, error))
    }
}

export const deleteUploadedFile = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteImageSchema.validate(req.body);

        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, error?.details[0].message, {}, {}))
        }

        const { fileUrl } = value;

        const parsedUrl = new URL(fileUrl);

        if (!parsedUrl.pathname.includes("/images/")) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST, responseMessage?.unsupportedFileType, {}, {}))
        }

        const filePath = path.join(process.cwd(), parsedUrl.pathname.replace(/^\\/, ""))

        if (!fs.existsSync(filePath)) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND, responseMessage?.getDataNotFound("image"), {}, {}))
        }

        fs.unlinkSync(filePath);

        return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK, responseMessage?.deleteDataSuccess("images"), {}, {}))
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage?.internalServerError, {}, error))
    }
}