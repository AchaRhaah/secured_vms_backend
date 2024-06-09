import { Router } from "express";
import { createChildAccountController } from "../../controllers/auth/registration/createChild";
import { verifyToken, requireRole } from "../../middleware/auth/auth";
import createVaccinationStaffController from "../../controllers/auth/registration/createVstaff";

const router = Router();

router.post(
  "/create-child",
  requireRole(["VaccinationStaff", "departmentManager"]),
  createChildAccountController
);
router.post(
  "/create-vstaff",
  requireRole(["departmentManager"]),
  createVaccinationStaffController
);

export default router;
// ;departmentManager