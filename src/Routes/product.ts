import { Router } from "express";
import { adminJwt, userJwt } from "../helper";
import { productController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, productController.createProduct);
router.put("/edit", adminJwt, productController.updateProduct);
router.delete("/:id", adminJwt, productController.deleteProduct);
router.get("/admin", adminJwt, productController.getProducts);
router.get("/", userJwt, productController.getProducts);
router.get("/:id", userJwt, productController.getProductById);

export const productRouter = router;
