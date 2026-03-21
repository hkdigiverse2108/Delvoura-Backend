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

      let folderName = "others";

      if (req.baseUrl.includes("product")) {
        folderName = "products";
      } else if (req.baseUrl.includes("blog")) {
        folderName = "blogs";
      }

      const baseDir = "public/images";
      const dir = path.join(process.cwd(), baseDir, folderName);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, path.join(baseDir, folderName));
    } catch (error) {
      cb(error, "");
    }
  },

  filename: (_, file, cb) => {
    try {
      const sanitizedOriginalName = file.originalname.replace(/\s+/g, "-");
      cb(null, `${Date.now()}_${sanitizedOriginalName}`);
    } catch (error) {
      cb(error, "");
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