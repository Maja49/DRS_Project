select * from user;

SELECT * from Theme;

CREATE TABLE Theme(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id2 VARCHAR(255) NOT NULL,
    description VARCHAR(255)
)

ALTER TABLE Theme DROP COLUMN id2;


SELECT * FROM Theme;

select * from User;