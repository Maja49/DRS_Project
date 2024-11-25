CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    adress VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL,
    is_approved BOOLEAN NOT NULL
);

INSERT INTO User (name, lastname, adress, city, country, phone_number, email, password, username, is_admin)
VALUES 
('Maja', 'Pavić', 'Neka Adresa 1', 'Novi Sad', 'Serbia', '1234567890', 'maja2@example.com', 'primer', 'primer', FALSE);

ALTER TABLE User ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE Theme DROP COLUMN id2;


SELECT * FROM Theme;
