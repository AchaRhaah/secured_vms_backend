import { Router } from "express";
import { getWeeklyVaccineReport } from "../../controllers/report/WeeklyStockCard";
import { getVaccineInventoryBalance } from "../../controllers/report/vaccineBalance";
import { getAllVaccinesMonthlyReport } from "../../controllers/report/monthlyVaccinationTollReport";
const router = Router();
router.get("/weekly-stock-card/:vaccineId", getWeeklyVaccineReport);
router.get(
  "/monthly-report-total-vaccination/:month",
  getAllVaccinesMonthlyReport
);

router.get("/vaccine-inventory-balance", getVaccineInventoryBalance);

export default router;
