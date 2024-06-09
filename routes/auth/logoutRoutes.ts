import { forceExpireTokenController } from "../../controllers/logout/logout";
import { checkTokenBlacklist } from "../../controllers/logout/checkTokenBlackList";
import { revokeTokenController } from "../../controllers/logout/revokToken";
import { Router } from "express";

const router = Router();

router.get(
  "/logout",
  //   checkTokenBlacklist,
  revokeTokenController,
  forceExpireTokenController
);

export default router;
