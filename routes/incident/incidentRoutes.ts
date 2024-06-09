import { reportVaccineIncident } from "../../controllers/incidents/incident";
import { Router } from "express";
import { requireRole, verifyToken } from "../../middleware/auth/auth";
import { checkTokenBlacklist } from "../../middleware/auth/checkTokenBlackList";

const router = Router();

router.post(
  "/report-incident",
  verifyToken,
  checkTokenBlacklist,
  requireRole(["VaccinationStaff", "departmentManager"]),
  reportVaccineIncident
);

export default router;
