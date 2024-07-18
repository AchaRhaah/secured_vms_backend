import db from "../../db";

export const deductVaccineInventoryController = async (vaccineId: number) => {
  console.log("Deduction!!!!!!!!!!!!!!!!!!!!");
  const checkQuantityQuery = `
    SELECT quantity
    FROM VaccineInventory
    WHERE vaccine_id = $1;
  `;

  const updateInventoryQuery = `
    UPDATE VaccineInventory
    SET 
      quantity = quantity - 1
    WHERE vaccine_id = $1
    RETURNING *;
  `;

  const currentDate = new Date().toISOString().split("T")[0];

  try {
    const quantityResult = await db.query(checkQuantityQuery, [vaccineId]);

    if (quantityResult.rows.length === 0) {
      return { error: "Vaccine not found." };
    }

    const currentQuantity = quantityResult.rows[0].quantity;
console.log("current quantity:", currentQuantity);
    if (currentQuantity < 1) {
      return { error: "Vaccine is out of stock." };
    }

    const result = await db.query(updateInventoryQuery, [vaccineId]);
    const updatedInventory = result.rows[0];

    const dailyUsageQuery = `
      INSERT INTO DailyVaccineUsage (vaccine_id, date, usage_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (vaccine_id, date)
      DO UPDATE SET usage_count = DailyVaccineUsage.usage_count + 1;
    `;
    await db.query(dailyUsageQuery, [vaccineId, currentDate]);
    return updatedInventory;
  } catch (error) {
    console.error(error);
    return { error: "Failed to deduct vaccine inventory." };
  }
};
