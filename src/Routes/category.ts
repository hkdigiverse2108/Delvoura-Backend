import { Router } from "express";
import { adminJwt } from "../helper";
import { categoryController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, categoryController.createCategory);
router.put("/edit", adminJwt, categoryController.updateCategory);
router.delete("/:id", adminJwt, categoryController.deleteCategory);
router.get("/", adminJwt, categoryController.getCategories);

export const categoryRouter = router;
