import { Router } from "express";
import { getAllChildrenController } from "../../controllers/getData/getAllChildren";
import { getVaccinationReccordController } from "../../controllers/getData/getVaccinationRecord";
import { updateVaccinationRecordController } from "../../controllers/updateRecord/updateRecord";
import { verifyToken, requireRole } from "../../middleware/auth/auth";
import { checkTokenBlacklist } from "../../controllers/logout/checkTokenBlackList";

const router = Router();

router.get(
  "/all",
  verifyToken,
  checkTokenBlacklist,
  requireRole(["VaccinationStaff", "departmentManager"]),
  getAllChildrenController
);
router.get(
  "/:childId/vaccinationRecords",
  verifyToken,
  requireRole(["VaccinationStaff", "departmentManager"]),
  getVaccinationReccordController
);
router.patch(
  "/:childId/update-vrecord",
  verifyToken,
  requireRole(["VaccinationStaff", "departmentManager"]),
  updateVaccinationRecordController
);

export default router;
