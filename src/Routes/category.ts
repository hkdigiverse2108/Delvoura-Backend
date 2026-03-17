import { Router } from "express";
import { adminJwt } from "../helper";
import { categoryController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, categoryController.createCategory);
router.get("/edit", adminJwt, categoryController.getCategories);
router.put("/:id", adminJwt, categoryController.updateCategory);
router.delete("/:id", adminJwt, categoryController.deleteCategory);

export const categoryRouter = router;
