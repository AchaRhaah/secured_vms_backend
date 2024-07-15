CREATE TYPE USER_TYPE AS ENUM('departmentManager', 'VaccinationStaff', 'Guardian');

CREATE TYPE GENDER_TYPE AS ENUM('Male', 'Female');

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    gender GENDER_TYPE,
    address VARCHAR(255),
    user_type USER_TYPE NOT NULL
    
);

CREATE TABLE VaccinationStaff (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    position VARCHAR(255),
    hire_date DATE,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Guardians (
    id SERIAL PRIMARY KEY ,
    user_id INT NOT NULL UNIQUE,
    gender GENDER_TYPE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);


CREATE TABLE Children (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(255),
    gender GENDER_TYPE,
    mother_name VARCHAR(255),
    mother_phone_number VARCHAR(20) NOT NULL,
    father_name VARCHAR(255),
    father_phone_number VARCHAR(20),
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(255),
    weight_at_birth DECIMAL(5, 2) NOT NULL,
    birth_declaration_date DATE,
    guardian_id INT NOT NULL,
    FOREIGN KEY (guardian_id) REFERENCES Guardians(id)
);

CREATE TABLE Vaccines (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(255) NOT NULL,
    disease TEXT,
    eligible_age DECIMAL(5, 2) NOT NULL, 
    eligible_age_words VARCHAR(255) NOT NULL
);

CREATE TABLE VaccinationRecords (
    id SERIAL PRIMARY KEY,
    child_id INT NOT NULL,
    taken BOOLEAN,
    eligible BOOLEAN,
    vaccine_id INT NOT NULL,
    date_administered DATE,
    batch_number VARCHAR(255),
    next_appointment_date DATE,
    administered_by INT,
    FOREIGN KEY (child_id) REFERENCES Children(id),
    FOREIGN KEY (administered_by) REFERENCES VaccinationStaff(id),
    FOREIGN KEY (vaccine_id) REFERENCES Vaccines(id)
);

CREATE TABLE VaccineInventory (
    id SERIAL PRIMARY KEY ,
    vaccine_id INT NOT NULL,
    quantity INT NOT NULL,
    vvm VARCHAR(255),
    daily_usage INT DEFAULT 0,
    restock INT DEFAULT 0,
    expiry_date Date NOT NULL,
    batch_number VARCHAR(255),
    children_vaccinated INT DEFAULT 0,
    FOREIGN KEY (vaccine_id) REFERENCES Vaccines(id)
);


CREATE TABLE DailyVaccineUsage (
    id SERIAL PRIMARY KEY,
    vaccine_id INT NOT NULL,
    date DATE NOT NULL,
    usage_count INT DEFAULT 0,
    FOREIGN KEY (vaccine_id) REFERENCES Vaccines(id)
);

CREATE TABLE VaccineRestock (
    id SERIAL PRIMARY KEY,
    vaccine_id INT NOT NULL,
    restock_quantity INT NOT NULL,
    restock_date DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (vaccine_id) REFERENCES Vaccines(id)
);

CREATE TABLE VaccinationAppointments (
    id SERIAL PRIMARY KEY ,
    child_id INT NOT NULL,
    vaccine_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    notified_guardian BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (child_id) REFERENCES Children(id),
    FOREIGN KEY (vaccine_id) REFERENCES Vaccines(id)
);

CREATE TABLE VaccineIncidents (
    id SERIAL PRIMARY KEY,
    vaccine_id INT NOT NULL,
    incident_type VARCHAR(255) NOT NULL,
    description TEXT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vaccine_id) REFERENCES VaccineInventory(id)
);


CREATE TABLE TokenBlacklist (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    expiry TIMESTAMP NOT NULL
);





ALTER TABLE DailyVaccineUsage
ADD CONSTRAINT unique_vaccine_date UNIQUE (vaccine_id, date);


ALTER TABLE DailyVaccineUsage
ADD COLUMN balance INT; 


ALTER TABLE VaccineInventory
ADD COLUMN batch_number Date; 

ALTER TABLE VaccineInventory
ADD CONSTRAINT unique_vaccine_id UNIQUE (vaccine_id);
ALTER TABLE VaccinationRecords ADD COLUMN is_booster BOOLEAN DEFAULT FALSE;
