import { Router } from "express";
import { authJwt } from "../helper";
import { addressController } from "../controllers";

const router = Router();

router.post("/add", authJwt, addressController.createAddress);
router.put("/edit", authJwt, addressController.updateAddress);
router.delete("/:id", authJwt, addressController.deleteAddress);
router.get("/", authJwt, addressController.getAddresses);
router.get("/:id", authJwt, addressController.getAddressById);

export const addressRouter = router;
