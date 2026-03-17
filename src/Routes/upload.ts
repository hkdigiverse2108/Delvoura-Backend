import { Router } from "express";
import multer from "multer";
import { deleteUploadedFile, getAllImages, uploadFile } from "../controllers/upload";
import { fileFilter, fileStorage } from "../middleware";

const uploadRouter = Router();

const upload = multer({
  storage: fileStorage,
  fileFilter,
});

uploadRouter.post("/", upload.any(), uploadFile);
uploadRouter.get("/", getAllImages);
uploadRouter.delete("/", deleteUploadedFile);

export { uploadRouter };
