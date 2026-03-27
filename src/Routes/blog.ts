import { Router } from "express";
import { adminJwt } from "../helper";
import { blogController } from "../controllers";

const router = Router();

router.post("/add", adminJwt,blogController.createBlog);
router.put("/edit", adminJwt, blogController.updateBlog);
router.delete("/:id", adminJwt, blogController.deleteBlog);
router.get("/", blogController.getBlogs);
router.get("/:id", blogController.getBlogById);

export const blogRouter = router;
