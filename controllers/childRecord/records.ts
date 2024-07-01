import { Request, Response } from "express";
import db from "../../db";
import { JwtPayload } from "../../middleware/auth/auth";

// Define interfaces for Child and Guardian types
interface Child {
  id: number;
  name: string;
  gender: string;
  date_of_birth: Date;
  mother_name: string;
  mother_phone_number: string;
  father_name: string;
  father_phone_number: string;
  place_of_birth: string;
  weight_at_birth: string;
}

interface Guardian {
  id: number;
  name: string;
  phone_number: string;
  address: string;
  gender: string; // Add guardian gender
  number_of_children: number; // Add number of children
}

interface VaccineRecord {
  name: string;
  disease: string[];
  taken: boolean;
  batchNumber: string | null;
  givenBy: string;
  givenOn: string | null;
}
interface AgeCategory {
  age: number;
  ageInWords: string;
  nextAppointment: string;
  eligible: boolean;
  vaccines: VaccineRecord[];
}

// Get all children under the logged-in guardian
export const getChildrenUnderGuardian = async (req: Request, res: Response) => {
  const { guardianId } = req.params;

  try {
    // Query to fetch children details
    const childrenQuery = `
      SELECT id, name, gender, date_of_birth, mother_name, mother_phone_number, father_name, father_phone_number, place_of_birth, weight_at_birth
      FROM Children
      WHERE guardian_id = $1
    `;
    const { rows: children } = await db.query<Child>(childrenQuery, [
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
    const { rows: guardians } = await db.query<Guardian>(guardianQuery, [
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
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get vaccination records for a specific child under the logged-in guardian
export const getChildVaccinationRecords = async (
  req: Request,
  res: Response
) => {
  const { guardianID, childId } = req.params;

  try {
    // Check if the guardian has access to the child's records
    const guardianCheckQuery = `
      SELECT id FROM Children WHERE id = $1 AND guardian_id = $2
    `;
    const { rows: guardianCheck } = await db.query(guardianCheckQuery, [
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
    const { rows: vaccinationRecords } = await db.query(
      vaccinationRecordsQuery,
      [childId]
    );

    // Group vaccination records by age categories
    const groupedVaccinationRecords: AgeCategory[] = [];

    vaccinationRecords.forEach((record) => {
      const {
        age_for_vaccine,
        vaccine_name,
        disease,
        taken,
        batch_number,
        given_by,
        given_on,
      } = record;

      // Format age_for_vaccine to one decimal place
      const formattedAge = parseFloat(age_for_vaccine).toFixed(1);

      // Adjust ageInWords based on formatted age
      let ageInWords =
        formattedAge !== "0.0" ? `At ${formattedAge} months` : "At birth";

      // Find or create the appropriate age category
      let ageCategory = groupedVaccinationRecords.find(
        (category) => category.age === age_for_vaccine
      );

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
  } catch (error) {
    console.error("Error fetching vaccination records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
