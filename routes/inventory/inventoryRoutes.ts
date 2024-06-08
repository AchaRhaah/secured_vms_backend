import { Router } from "express";
import { restockVaccineController } from "../../controllers/inventory/restock";
import { deductVaccineInventoryController } from "../../controllers/inventory/deduction";
import { requireRole, verifyToken } from "../../middleware/auth/auth";
const router = Router();

router.post(
  "/restock",
  verifyToken,
  requireRole("VaccinationStaff"),
  restockVaccineController
);
export default router;