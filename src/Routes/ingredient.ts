import { Router } from "express";
import { adminJwt } from "../helper";
import { ingredientController } from "../controllers";

const router = Router();

router.post("/add", adminJwt, ingredientController.createIngredient);
router.put("/edit", adminJwt, ingredientController.updateIngredient);
router.delete("/:id", adminJwt, ingredientController.deleteIngredient);
router.get("/", adminJwt, ingredientController.getIngredients);

export const ingredientRouter = router;
