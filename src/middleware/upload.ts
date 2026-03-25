import multer from "multer";
import path from "path";
import fs from "fs";

export const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const isImage = file.mimetype.startsWith("image/");

      if (!isImage) {
        return cb(new Error("Only image files are allowed"), "");
      }

      const baseDir = path.join(process.cwd(), "public/images");

      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }

      cb(null, baseDir);
    } catch (error) {
      cb(error as Error, "");
    }
  },

  filename: (_, file, cb) => {
    try {
      const sanitizedOriginalName = file.originalname.replace(/\s+/g, "-");
      cb(null, `${Date.now()}_${sanitizedOriginalName}`);
    } catch (error) {
      cb(error as Error, "");
    }
  },
});

export const fileFilter = (_, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only png, jpg, jpeg, webp images are allowed"));
  }
};