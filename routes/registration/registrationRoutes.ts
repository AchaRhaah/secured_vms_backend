import { Router } from "express";
import { createChildAccountController } from "../../controllers/registration/createChild";
import createVaccinationStaffController from "../../controllers/registration/createVstaff";

const router = Router();

router.post("/create-child", createChildAccountController);
router.post("/create-vstaff", createVaccinationStaffController);

export default router;
