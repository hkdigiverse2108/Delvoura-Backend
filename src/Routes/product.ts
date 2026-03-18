import { Router } from "express";
import { adminJwt } from "../helper";
import { productController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, productController.createProduct);
router.put("/edit", adminJwt, productController.updateProduct);
router.delete("/:id", adminJwt, productController.deleteProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

export const productRouter = router;
