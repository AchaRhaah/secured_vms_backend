import db from "../../db";

// Deduct Vaccine Inventory Controller
export const deductVaccineInventoryController = async (vaccineId: number) => {
  const checkQuantityQuery = `
    SELECT quantity
    FROM VaccineInventory
    WHERE vaccine_id = $1;
  `;

  const updateInventoryQuery = `
    UPDATE VaccineInventory
    SET 
      quantity = quantity - 1, 
      children_vaccinated = children_vaccinated + 1
    WHERE vaccine_id = $1
    RETURNING *;
  `;

  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format

  try {
    // Check the current quantity of the vaccine
    const quantityResult = await db.query(checkQuantityQuery, [vaccineId]);

    // If no rows are returned, the vaccine does not exist
    if (quantityResult.rows.length === 0) {
      return { error: "Vaccine not found." };
    }
    //

    const currentQuantity = quantityResult.rows[0].quantity;

    // Check if the quantity is less than 1
    if (currentQuantity < 1) {
      return { error: "Vaccine is out of stock." };
    }

    // Deduct the vaccine from the inventory
    if (currentQuantity >= 1) {
      const result = await db.query(updateInventoryQuery, [vaccineId]);
      const updatedInventory = result.rows[0];

      // Update the daily usage count
      const dailyUsageQuery = `
        INSERT INTO DailyVaccineUsage (vaccine_id, date, usage_count)
        VALUES ($1, $2, 1)
        ON CONFLICT (vaccine_id, date)
        DO UPDATE SET usage_count = DailyVaccineUsage.usage_count + 1;
      `;
      await db.query(dailyUsageQuery, [vaccineId, currentDate]);
      return updatedInventory;
    }
  } catch (error) {
    // Handle the error
    console.error(error);
    return { error: "Failed to deduct vaccine inventory." };
  }
};
