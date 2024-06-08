import { Router } from "express";
import {
  getChildVaccinationRecords,
  getChildrenUnderGuardian,
} from "../../controllers/childRecord/records";
import { authMiddleware } from "../../middleware/auth/auth";

const router = Router();
router.get("/children", authMiddleware, getChildrenUnderGuardian);
router.get(
  "/children/:childId/vaccinations",
  authMiddleware,
  getChildVaccinationRecords
);

export default router;
