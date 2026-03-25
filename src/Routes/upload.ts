import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers";
import { fileFilter, fileStorage } from "../middleware";

const router = Router();

const upload = multer({
  storage: fileStorage,
  fileFilter,
});

router.post("/", upload.array("files"), uploadController.uploadFile);
router.get("/", uploadController.getAllImages);
router.delete("/", uploadController.deleteUploadedFile);

export const uploadRouter = router;
