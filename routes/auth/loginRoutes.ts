import { Router } from "express";
import { loginController } from "../../controllers/auth/login/staffLogin";

const router = Router();

router.post("/login-staff", loginController);

export default router;
