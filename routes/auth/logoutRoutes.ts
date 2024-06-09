import { forceExpireTokenController } from "../../controllers/logout/logout";
import { checkTokenBlacklist } from "../../middleware/auth/checkTokenBlackList";
import { revokeTokenController } from "../../middleware/auth/revokToken";
import { Router } from "express";

const router = Router();

router.get("/logout", revokeTokenController, forceExpireTokenController);

export default router;
