import { reportVaccineIncident } from "../../controllers/incidents/incident";
import { Router } from "express";
import { requireRole, verifyToken } from "../../middleware/auth/auth";

const router = Router();

router.post(
  "/report-incident",
  verifyToken,
  requireRole("VaccinationStaff"),
  reportVaccineIncident
);

export default router;
