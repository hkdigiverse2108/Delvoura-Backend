import { Router } from "express";
import { adminJwt } from "../helper";
import { contactUsController } from "../controllers";

const router = Router();

router.post("/add", contactUsController.createContactUs);
router.put("/edit", adminJwt, contactUsController.updateContactUs);
router.delete("/:id", adminJwt, contactUsController.deleteContactUs);
router.get("/", adminJwt, contactUsController.getContactUs);

export const contactUsRouter = router;
