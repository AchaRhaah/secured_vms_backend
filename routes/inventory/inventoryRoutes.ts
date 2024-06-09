import { Router } from "express";
import { restockVaccineController } from "../../controllers/inventory/restock";
import { checkTokenBlacklist } from "../../controllers/logout/checkTokenBlackList";
import { requireRole, verifyToken } from "../../middleware/auth/auth";
const router = Router();

router.post(
  "/restock",
  verifyToken,
  checkTokenBlacklist,
  requireRole(["VaccinationStaff", "departmentManager"]),
  restockVaccineController
);
export default router;