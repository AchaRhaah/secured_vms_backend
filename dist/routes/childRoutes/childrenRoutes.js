"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getAllChildren_1 = require("../../controllers/getData/getAllChildren");
const getVaccinationRecord_1 = require("../../controllers/getData/getVaccinationRecord");
const updateRecord_1 = require("../../controllers/updateRecord/updateRecord");
const auth_1 = require("../../middleware/auth/auth");
const router = (0, express_1.Router)();
router.get("/all", auth_1.verifyToken, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), getAllChildren_1.getAllChildrenController);
router.get("/:childId/vaccinationRecords", auth_1.verifyToken, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), getVaccinationRecord_1.getVaccinationReccordController);
router.patch("/:childId/update-vrecord", auth_1.verifyToken, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), updateRecord_1.updateVaccinationRecordController);
exports.default = router;
