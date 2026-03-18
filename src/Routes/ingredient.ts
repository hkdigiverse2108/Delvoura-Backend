import { Router } from "express";
import { adminJwt } from "../helper";
import { ingredientController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, ingredientController.createIngredient);
router.get("/edit", adminJwt, ingredientController.getIngredients);
router.put("/:id", adminJwt, ingredientController.updateIngredient);
router.delete("/:id", adminJwt, ingredientController.deleteIngredient);

export const ingredientRouter = router;
