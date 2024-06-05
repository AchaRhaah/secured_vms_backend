import { reportVaccineIncident } from "../../controllers/incidents/incident";
import { Router } from "express";

const router = Router();

router.post("/report-incident", reportVaccineIncident);

export default router;
