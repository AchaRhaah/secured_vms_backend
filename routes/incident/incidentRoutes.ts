import { reportVaccineIncident } from "../../controllers/incidents/sideEffect";
import { Router } from "express";

const router = Router();

router.post("/report-incident", reportVaccineIncident);

export default router;
