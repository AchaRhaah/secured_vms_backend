import { Router } from "express";
import { createChildAccountController } from "../../controllers/auth/registration/createChild";
import { verifyToken, requireRole } from "../../middleware/auth/auth";
import createVaccinationStaffController from "../../controllers/auth/registration/createVstaff";

const router = Router();

router.post(
  "/create-child",
  verifyToken,
  requireRole("VaccinationStaff"),
  createChildAccountController
);
router.post("/create-vstaff", createVaccinationStaffController);

export default router;
