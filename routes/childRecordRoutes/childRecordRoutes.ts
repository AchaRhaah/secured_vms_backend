import { Router } from "express";
import {
  getChildVaccinationRecords,
  getChildrenUnderGuardian,
} from "../../controllers/childRecord/records";
import { authMiddleware } from "../../middleware/auth/auth";

const router = Router();
router.get("/guardian-children", getChildrenUnderGuardian);
router.get("/children/:childId/vaccinations", getChildVaccinationRecords);

export default router;
