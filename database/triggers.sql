-- the trigger function to populate the VaccinationRecords table with default information when a new child is created. This trigger function will set default values for fields such as taken, eligible, date_administered, batch_number, next_appointment_date, and administered_by.

CREATE OR REPLACE FUNCTION populate_vaccination_record_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a record already exists for the child and vaccine
    IF NOT EXISTS (
        SELECT 1 
        FROM VaccinationRecords 
        WHERE child_id = NEW.id
    ) THEN
        -- Insert default values into the VaccinationRecords table
        INSERT INTO VaccinationRecords (child_id, taken, eligible, vaccine_id, date_administered, batch_number, next_appointment_date, administered_by)
        SELECT NEW.id, FALSE, FALSE, id, NULL, NULL, NULL, NULL
        FROM Vaccines;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- This function will be triggered after a new row is inserted into the Children table. It will populate the VaccinationRecords table with default information for each vaccine record.

CREATE TRIGGER populate_vaccination_record_trigger
AFTER INSERT ON Children
FOR EACH ROW
EXECUTE FUNCTION populate_vaccination_record_defaults();


-- The following PL/pgSQL trigger function, add_vaccination_records, is designed to automatically populate the VaccinationRecords table with vaccination records for each new child added to the Children table. This function performs several tasks to ensure that vaccination records are created with the correct eligibility status based on the child's age.


CREATE OR REPLACE FUNCTION add_vaccination_records() 
RETURNS TRIGGER AS $$
DECLARE
    child_age_months INT;
    vaccine RECORD;
BEGIN
    -- Calculate the child's age in months
    child_age_months := EXTRACT(YEAR FROM age(NEW.date_of_birth)) * 12 + EXTRACT(MONTH FROM age(NEW.date_of_birth));

    -- Loop through each vaccine and determine eligibility
    FOR vaccine IN SELECT * FROM Vaccines LOOP
        INSERT INTO VaccinationRecords (
            child_id, 
            taken, 
            eligible, 
            vaccine_id, 
            date_administered, 
            batch_number, 
            next_appointment_date, 
            administered_by
        ) VALUES (
            NEW.id, 
            FALSE, 
            (child_age_months >= vaccine.eligible_age), 
            vaccine.id, 
            NULL, 
            NULL, 
            NULL, 
            NULL
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger will call the trigger function whenever a new record is inserted into the Children table.

CREATE TRIGGER after_child_insert
AFTER INSERT ON Children
FOR EACH ROW
EXECUTE FUNCTION add_vaccination_records();

-- To keep the eligibility status up-to-date, you can create a function that recalculates the eligibility for all children. This function can be scheduled to run periodically using a job scheduler like cron or pg_cron.

CREATE OR REPLACE FUNCTION update_vaccine_eligibility() 
RETURNS VOID AS $$
DECLARE
    child RECORD;
    child_age_months INT;
    vaccine RECORD;
BEGIN
    FOR child IN SELECT * FROM Children LOOP
        -- Calculate the child's age in months
        child_age_months := EXTRACT(YEAR FROM age(child.date_of_birth)) * 12 + EXTRACT(MONTH FROM age(child.date_of_birth));
        
        FOR vaccine IN SELECT * FROM Vaccines LOOP
            UPDATE VaccinationRecords
            SET eligible = (child_age_months >= vaccine.eligible_age)
            WHERE child_id = child.id AND vaccine_id = vaccine.id;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 

CREATE OR REPLACE FUNCTION populate_vaccination_appointments()
RETURNS TRIGGER AS $$
DECLARE
    vaccine_record RECORD;
    appointment_date DATE;
BEGIN
    -- Loop through each vaccine and calculate the appointment date
    FOR vaccine_record IN
        SELECT id, eligible_age
        FROM Vaccines
    LOOP
        -- Calculate the appointment date based on the child's date of birth and the vaccine's eligible age
        appointment_date := NEW.date_of_birth + INTERVAL '1 month' * vaccine_record.eligible_age;

        -- Insert the calculated appointment into the VaccinationAppointments table
        INSERT INTO VaccinationAppointments (
            child_id, vaccine_id, appointment_date, notified_guardian
        ) VALUES (
            NEW.id, vaccine_record.id, appointment_date, FALSE
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- Trigger: populate_vaccination_appointments_trigger

CREATE TRIGGER populate_vaccination_appointments_trigger
AFTER INSERT ON Children
FOR EACH ROW
EXECUTE FUNCTION populate_vaccination_appointments();


CREATE OR REPLACE FUNCTION create_vaccine_inventory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO VaccineInventory (vaccine_id, quantity, vvm, daily_usage, restock, children_vaccinated)
  VALUES (NEW.id, 0, '', 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_vaccine_insert
AFTER INSERT ON Vaccines
FOR EACH ROW
EXECUTE FUNCTION create_vaccine_inventory();





-- This trigger function ensures that every time a new record is inserted into the VaccinationRecords table, the corresponding inventory counts in the VaccineInventory table are updated accordingly.
-- -- Trigger function: update_vaccine_inventory

CREATE OR REPLACE FUNCTION update_vaccine_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrement the quantity in VaccineInventory by 1 for the used vaccine
    UPDATE VaccineInventory
    SET quantity = quantity - 1,
        daily_usage = daily_usage + 1,
        children_vaccinated = children_vaccinated + 1
    WHERE vaccine_id = NEW.vaccine_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: update_vaccine_inventory_trigger

CREATE TRIGGER update_vaccine_inventory_trigger
AFTER INSERT ON VaccinationRecords
FOR EACH ROW
EXECUTE FUNCTION update_vaccine_inventory();



-- booster dose eligibility
CREATE OR REPLACE FUNCTION check_booster_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    regular_dose_count INT;
BEGIN
    -- Check if the new record is marked as a booster
    IF NEW.is_booster THEN
        -- Count the number of regular doses taken by the child for the same vaccine
        SELECT COUNT(*) INTO regular_dose_count
        FROM VaccinationRecords
        WHERE child_id = NEW.child_id
        AND vaccine_id = NEW.vaccine_id
        AND is_booster = FALSE
        AND taken = TRUE;

        -- If no regular dose has been taken, raise an exception
        IF regular_dose_count = 0 THEN
            RAISE EXCEPTION 'Child must have taken the regular dose before receiving a booster';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER check_booster_eligibility_trigger
BEFORE INSERT ON VaccinationRecords
FOR EACH ROW
EXECUTE FUNCTION check_booster_eligibility();

