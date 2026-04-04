import path from "path";
import fs from "fs";
import { apiResponse, HTTP_STATUS } from "../../common";
import { reqInfo, responseMessage } from "../../helper";
import { deleteImageSchema } from "../../validation";

export const uploadFile = async (req, res) => {
  reqInfo(req);
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST,responseMessage?.noFileUploaded,{},{})
        );
    }

    const uploadedImages = files.map((file) => {
      const cleanPath = file.path.replace(/\\/g, "/");
      return `${process.env.BACKEND_URL}/${cleanPath}`;
    });

    return res.status(HTTP_STATUS.CREATED).json(new apiResponse(HTTP_STATUS.CREATED,responseMessage?.fileUploadSuccess,{ images: uploadedImages }, {}  ));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR,responseMessage?.internalServerError,{},error  ));
  }
};

export const getAllImages = async (req, res) => {
  reqInfo(req);

  try {
    const baseDir = path.join(process.cwd(), "public/images");

    if (!fs.existsSync(baseDir)) {
      return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK,responseMessage?.getDataSuccess("images"),[],{}));
    }

    const listImages = (dir: string): any[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      return entries.flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          return listImages(fullPath);
        }

        const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
        const fileUrl = `${process.env.BACKEND_URL}/${relativePath}`;

        return [
          {
            name: entry.name,
            url: fileUrl,
          },
        ];
      });
    };

    const images = listImages(baseDir);

    return res.status(HTTP_STATUS.OK).json(new apiResponse(HTTP_STATUS.OK,responseMessage?.getDataSuccess("images"),images,{}  )
      );
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR,responseMessage?.internalServerError,{},error  )
      );
  }
};

export const deleteUploadedFile = async (req, res) => {
  reqInfo(req);

  try {
    const { error, value } = deleteImageSchema.validate(req.body || {});
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(  new apiResponse(HTTP_STATUS.BAD_REQUEST,error?.details[0].message,{}, {})
        );
    }

    const { fileUrl } = value;

    const parsedUrl = new URL(fileUrl);
    if (!parsedUrl.pathname.includes("/images/")) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(new apiResponse(HTTP_STATUS.BAD_REQUEST,responseMessage?.unsupportedFileType,{},{}  )
        );
    }

    const filePath = path.join(process.cwd(), parsedUrl.pathname.replace(/^\//, ""));

    if (!fs.existsSync(filePath)) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(new apiResponse(HTTP_STATUS.NOT_FOUND,responseMessage?.getDataNotFound("image"),{},{}  )
        );
    }

    fs.unlinkSync(filePath);

    return res.status(HTTP_STATUS.OK).json(  new apiResponse(HTTP_STATUS.OK,responseMessage?.deleteDataSuccess("images"),{},{} ));
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR,responseMessage?.internalServerError,{},error)
      );
  }
};