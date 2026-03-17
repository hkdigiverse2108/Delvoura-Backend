import { Router } from "express";
import { adminJwt } from "../helper";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/category";

const categoryRouter = Router();

categoryRouter.post("/", adminJwt, createCategory);
categoryRouter.get("/", adminJwt, getCategories);
categoryRouter.put("/:id", adminJwt, updateCategory);
categoryRouter.delete("/:id", adminJwt, deleteCategory);

export { categoryRouter };
