"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const records_1 = require("../../controllers/childRecord/records");
const auth_1 = require("../../middleware/auth/auth");
const router = (0, express_1.Router)();
router.get("/children", auth_1.authMiddleware, records_1.getChildrenUnderGuardian);
router.get("/children/:childId/vaccinations", auth_1.authMiddleware, records_1.getChildVaccinationRecords);
exports.default = router;
