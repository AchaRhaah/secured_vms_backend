import { Router } from "express";
import { getAllChildrenController } from "../../controllers/getData/getAllChildren";
import { getVaccinationReccordController } from "../../controllers/getData/getVaccinationRecord";
import { updateVaccinationRecordController } from "../../controllers/updateRecord/updateRecord";
import { verifyToken, requireRole } from "../../middleware/auth/auth";
import { checkTokenBlacklist } from "../../middleware/auth/checkTokenBlackList";

const router = Router();

router.get("/all", getAllChildrenController);
router.get("/:childId/vaccinationRecords", getVaccinationReccordController);
router.patch("/:childId/update-vrecord", updateVaccinationRecordController);

export default router;
