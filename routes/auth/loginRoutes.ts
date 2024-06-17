import { Router } from "express";
import { loginController } from "../../controllers/auth/login/login";

const router = Router();

router.post("/login", loginController);

export default router;
