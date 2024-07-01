import { Router } from "express";
import {
  getChildVaccinationRecords,
  getChildrenUnderGuardian,
} from "../../controllers/childRecord/records";
import { authMiddleware, verifyToken } from "../../middleware/auth/auth";
import { checkTokenBlacklist } from "../../middleware/auth/checkTokenBlackList";

const router = Router();
router.get(
  "/guardian-children/:guardianId",
  // verifyToken,
  // checkTokenBlacklist,
  getChildrenUnderGuardian
);
router.get(
  "/children/:childId/vaccinations/:guardianID",
  verifyToken,
  checkTokenBlacklist,
  getChildVaccinationRecords
);

export default router;
