"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const records_1 = require("../../controllers/childRecord/records");
const router = (0, express_1.Router)();
router.get("/children", records_1.getChildrenUnderGuardian);
router.get("/children/:childId/vaccinations", records_1.getChildVaccinationRecords);
exports.default = router;
