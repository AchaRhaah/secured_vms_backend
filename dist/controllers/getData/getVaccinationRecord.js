"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVaccinationReccordController = void 0;
const db_1 = __importDefault(require("../../db"));
const getVaccinationReccordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const childId = req.params.childId;
    try {
        // Query to retrieve vaccination records for the child
        const query = `
   SELECT
    vr.id AS vaccination_record_id,
    v.name AS vaccine_name,
    v.id,
    v.disease,
    v.eligible_age,
    v.eligible_age_words,
    vr.taken,
    vr.eligible,
    vr.date_administered,
    vr.batch_number,
    vr.next_appointment_date,
    CASE 
        WHEN u.name IS NOT NULL THEN u.name
        ELSE '' 
    END AS administered_by,
    CASE 
        WHEN vr.date_administered IS NOT NULL THEN vr.date_administered::text
        ELSE '' 
    END AS administered_on
FROM
    VaccinationRecords vr
JOIN
    Children c ON vr.child_id = c.id
JOIN
    Vaccines v ON vr.vaccine_id = v.id
LEFT JOIN
    VaccinationStaff vs ON vr.administered_by = vs.id
LEFT JOIN
    Users u ON vs.user_id = u.id
WHERE
    c.id = $1
ORDER BY
    v.eligible_age;

    `;
        const { rows } = yield db_1.default.query(query, [childId]);
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching vaccination records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVaccinationReccordController = getVaccinationReccordController;
