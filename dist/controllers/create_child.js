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
exports.createChildAccountController = void 0;
const db_1 = __importDefault(require("../db"));
const createChildAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { childName, childDob, placeOfBirth, weightAtBirth, birthDeclarationDate, motherName, motherTelephone, fatherName, fatherTelephone, guardianName, guardianTelephone, guardianAddress, childGender, guardianGender, } = req.body;
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        // Check if the guardian exists in the database
        let guardianId = null;
        const guardianQuery = `
      SELECT id FROM Guardians WHERE name = $1 AND phone_number = $2 LIMIT 1
    `;
        const guardianValues = [guardianName, guardianTelephone];
        const guardianResult = yield client.query(guardianQuery, guardianValues);
        if (guardianResult.rows.length > 0) {
            guardianId = guardianResult.rows[0].id;
        }
        else {
            // Insert new user for the guardian
            const newUserQuery = `
        INSERT INTO Users (name, gender, address, user_type)
        VALUES ($1, $2, $3, 'Guardian')
        RETURNING id
      `;
            const newUserValues = [guardianName, guardianGender, guardianAddress];
            const newUserResult = yield client.query(newUserQuery, newUserValues);
            const newUserId = newUserResult.rows[0].id;
            // Insert new guardian data into the Guardians table
            const newGuardianQuery = `
  INSERT INTO Guardians (user_id, name, phone_number, address, gender, password)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id
`;
            const newGuardianValues = [
                newUserId,
                guardianName,
                guardianTelephone,
                guardianAddress,
                guardianGender,
                "defaultpassword", // Default password, should be updated later for security
            ];
            const newGuardianResult = yield client.query(newGuardianQuery, newGuardianValues);
            guardianId = newGuardianResult.rows[0].id;
            //
        }
        // Insert new child data into the Children table
        const childQuery = `
      INSERT INTO Children (
        name,
        gender,
        mother_name,
        mother_phone_number,
        father_name,
        father_phone_number,
        date_of_birth,
        place_of_birth,
        weight_at_birth,
        birth_declaration_date,
        guardian_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const childValues = [
            childName,
            childGender,
            motherName,
            motherTelephone,
            fatherName,
            fatherTelephone,
            childDob,
            placeOfBirth,
            weightAtBirth,
            birthDeclarationDate,
            guardianId,
        ];
        const { rows } = yield client.query(childQuery, childValues);
        yield client.query("COMMIT");
        res.status(201).json(rows[0]);
    }
    catch (error) {
        yield client.query("ROLLBACK");
        console.error("Error creating child:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the child" });
    }
    finally {
        client.release();
    }
});
exports.createChildAccountController = createChildAccountController;
