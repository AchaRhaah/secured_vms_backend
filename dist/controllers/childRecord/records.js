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
exports.getChildVaccinationRecords = exports.getChildrenUnderGuardian = void 0;
const db_1 = __importDefault(require("../../db"));
// Get all children under the logged-in guardian
const getChildrenUnderGuardian = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guardianId } = req.params;
    try {
        // Query to fetch children details
        const childrenQuery = `
      SELECT id, name, gender, date_of_birth, mother_name, mother_phone_number, father_name, father_phone_number, place_of_birth, weight_at_birth
      FROM Children
      WHERE guardian_id = $1
    `;
        const { rows: children } = yield db_1.default.query(childrenQuery, [
            guardianId,
        ]);
        if (children.length === 0) {
            return res
                .status(404)
                .json({ error: "No children found for the guardian" });
        }
        // Query to fetch guardian details including gender and number of children
        const guardianQuery = `
      SELECT 
        g.id,
        g.name,
        g.phone_number,
        g.address,
        g.gender,
        COUNT(c.id) AS number_of_children
      FROM Guardians g
      LEFT JOIN Children c ON g.id = c.guardian_id
      WHERE g.id = $1
      GROUP BY g.id
    `;
        const { rows: guardians } = yield db_1.default.query(guardianQuery, [
            guardianId,
        ]);
        if (guardians.length === 0) {
            return res.status(404).json({ error: "Guardian not found" });
        }
        // Structure the response object
        const response = {
            guardian: guardians[0], // Assuming one guardian per guardianID
            children: children,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error fetching children:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getChildrenUnderGuardian = getChildrenUnderGuardian;
// Get vaccination records for a specific child under the logged-in guardian
const getChildVaccinationRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guardianID, childId } = req.params;
    try {
        // Check if the guardian has access to the child's records
        const guardianCheckQuery = `
      SELECT id FROM Children WHERE id = $1 AND guardian_id = $2
    `;
        const { rows: guardianCheck } = yield db_1.default.query(guardianCheckQuery, [
            childId,
            guardianID,
        ]);
        if (guardianCheck.length === 0) {
            return res
                .status(403)
                .json({ error: "You do not have access to this child's records" });
        }
        // Query to fetch vaccination records with additional details
        const vaccinationRecordsQuery = `
      SELECT
        vr.id,
        vr.taken,
        vr.eligible,
        vr.date_administered AS given_on,
        vs.position AS given_by,
        vr.batch_number,
        vr.next_appointment_date,
        v.name AS vaccine_name,
        v.disease,
        v.eligible_age AS age_for_vaccine
      FROM VaccinationRecords vr
      INNER JOIN Vaccines v ON vr.vaccine_id = v.id
      LEFT JOIN VaccinationStaff vs ON vr.administered_by = vs.id
      WHERE vr.child_id = $1
    `;
        const { rows: vaccinationRecords } = yield db_1.default.query(vaccinationRecordsQuery, [childId]);
        // Group vaccination records by age categories
        const groupedVaccinationRecords = [];
        vaccinationRecords.forEach((record) => {
            const { age_for_vaccine, vaccine_name, disease, taken, batch_number, given_by, given_on, } = record;
            // Format age_for_vaccine to one decimal place
            const formattedAge = parseFloat(age_for_vaccine).toFixed(1);
            // Adjust ageInWords based on formatted age
            let ageInWords = formattedAge !== "0.0" ? `At ${formattedAge} months` : "At birth";
            // Find or create the appropriate age category
            let ageCategory = groupedVaccinationRecords.find((category) => category.age === age_for_vaccine);
            if (!ageCategory) {
                ageCategory = {
                    age: age_for_vaccine,
                    ageInWords,
                    nextAppointment: "", // You can set this value as needed
                    eligible: true, // Determine eligibility based on business logic
                    vaccines: [],
                };
                groupedVaccinationRecords.push(ageCategory);
            }
            // Add vaccine record to the corresponding age category
            ageCategory.vaccines.push({
                name: vaccine_name,
                disease: disease.split(","), // Assuming disease is a comma-separated string
                taken,
                batchNumber: batch_number,
                givenBy: given_by || "",
                givenOn: given_on || null,
            });
        });
        res.json(groupedVaccinationRecords);
    }
    catch (error) {
        console.error("Error fetching vaccination records:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getChildVaccinationRecords = getChildVaccinationRecords;
