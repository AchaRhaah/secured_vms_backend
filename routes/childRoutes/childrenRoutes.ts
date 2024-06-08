import { Router } from "express";
import { getAllChildrenController } from "../../controllers/getData/getAllChildren";
import { getVaccinationReccordController } from "../../controllers/getData/getVaccinationRecord";
import { updateVaccinationRecordController } from "../../controllers/updateRecord/updateRecord";
import { verifyToken, requireRole } from "../../middleware/auth/auth";

const router = Router();

router.get(
  "/all",
  verifyToken,
  requireRole("VaccinationStaff"),
  getAllChildrenController
);
router.get(
  "/:childId/vaccinationRecords",
  verifyToken,
  requireRole("VaccinationStaff"),
  getVaccinationReccordController
);
router.patch(
  "/:childId/update-vrecord",
  verifyToken,
  requireRole("VaccinationStaff"),
  updateVaccinationRecordController
);

export default router;
