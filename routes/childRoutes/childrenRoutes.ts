import { Router } from "express";
import { getAllChildrenController } from "../../controllers/getData/getAllChildren";
import { getVaccinationReccordController } from "../../controllers/getData/getVaccinationRecord";
import { updateVaccinationRecordController } from "../../controllers/updateRecord/updateRecord";

const router = Router();

router.get("/all", getAllChildrenController);
router.get("/:childId/vaccinationRecords", getVaccinationReccordController);
router.patch("/update-vrecord", updateVaccinationRecordController);

export default router;
