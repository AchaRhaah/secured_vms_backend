import { Router } from "express";
import { loginVaccinationStaffController } from "../../controllers/auth/login/staffLogin";
import { loginGuardianController } from "../../controllers/auth/login/guardianLogin";

const router = Router();

router.post("/login-staff", loginVaccinationStaffController);
router.post("/login-guardian", loginGuardianController);

export default router;
