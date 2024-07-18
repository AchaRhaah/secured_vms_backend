import { Router } from "express";
import { getWeeklyVaccineReport } from "../../controllers/report/WeeklyStockCard";
import { getVaccineInventoryBalance } from "../../controllers/report/vaccineBalance";
import { getAllVaccinesMonthlyReport } from "../../controllers/report/monthlyVaccinationTollReport";
import { getChildrenVaccinatedByVaccine } from "../../controllers/report/childrenVacinated";
const router = Router();
router.get("/weekly-stock-card/:vaccineId", getWeeklyVaccineReport);
router.get(
  "/monthly-report-total-vaccination/:month",
  getAllVaccinesMonthlyReport
);
router.get("/children-vaccinated/:vaccineId", getChildrenVaccinatedByVaccine);

router.get("/vaccine-inventory-balance", getVaccineInventoryBalance);

export default router;
