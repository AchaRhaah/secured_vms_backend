"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const records_1 = require("../../controllers/childRecord/records");
const auth_1 = require("../../middleware/auth/auth");
const checkTokenBlackList_1 = require("../../middleware/auth/checkTokenBlackList");
const router = (0, express_1.Router)();
router.get("/guardian-children/:guardianId", 
// verifyToken,
// checkTokenBlacklist,
records_1.getChildrenUnderGuardian);
router.get("/children/:childId/vaccinations/:guardianID", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, records_1.getChildVaccinationRecords);
exports.default = router;
