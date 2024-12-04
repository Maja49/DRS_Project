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

CREATE TABLE Comment(
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUser INT NOT NULL,
    content VARCHAR(500),
    idOfMentionUser INT NOT NULL
);

CREATE TABLE Discussion(
    id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(500),
    theme VARCHAR(255),
    likes INT NOT NULL,
    dislike INT NOT NULL,
    comment VARCHAR(500),
    idUser INT NOT NULL
);

CREATE TABLE theme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


SELECT * FROM discussion

select * from user

DROP TABLE theme;
DROP TABLE comment;
DROP TABLE discussion;

CREATE TABLE comment (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Auto-incrementing ID
    user_id INT NOT NULL,  -- ID korisnika koji je napisao komentar
    post_id INT NOT NULL,  -- ID objave kojoj komentar pripada
    text TEXT NOT NULL,  -- Tekst komentara
    mentioned_user_id INT,  -- ID korisnika koji je označen (opcionalno)

    -- Strani ključevi
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- povezivanje sa tabelom 'users'
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,  -- povezivanje sa tabelom 'posts'
    FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE SET NULL  -- povezivanje sa tabelom 'users', opcionalno
); 


CREATE TABLE discussion (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Jedinstveni ID diskusije
    text TEXT NOT NULL,                 -- Tekst diskusije
    theme VARCHAR(100) NOT NULL,        -- Tema diskusije
    likes INT DEFAULT 0,                -- Broj lajkova
    dislikes INT DEFAULT 0,             -- Broj dislajkova
    user_id INT NOT NULL                -- ID korisnika koji je kreirao diskusiju
);

CREATE TABLE commentdiscussion (
    comment_id INT NOT NULL,         -- ID komentara
    discussion_id INT NOT NULL,      -- ID diskusije

    -- Primarni ključ je kombinacija oba ID-a
    PRIMARY KEY (comment_id, discussion_id),

    -- Strani ključevi
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
    FOREIGN KEY (discussion_id) REFERENCES discussion(id) ON DELETE CASCADE
);

ALTER TABLE discussion RENAME COLUMN topic TO theme;

drop table commentdiscussion;
drop table discussion;

CREATE TABLE discussion (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Jedinstveni ID diskusije
    text TEXT NOT NULL,                         -- Tekst diskusije
    theme_id INT NOT NULL,                      -- ID teme povezano sa tabelom theme
    likes INT DEFAULT 0,                        -- Broj lajkova
    dislikes INT DEFAULT 0,                     -- Broj dislajkova
    user_id INT NOT NULL,                       -- ID korisnika koji je kreirao diskusiju
    FOREIGN KEY (theme_id) REFERENCES theme(id) -- Strani ključ ka tabeli theme
);

CREATE TABLE commentdiscussion (
    comment_id INT NOT NULL,         -- ID komentara
    discussion_id INT NOT NULL,      -- ID diskusije

    -- Primarni ključ je kombinacija oba ID-a
    PRIMARY KEY (comment_id, discussion_id),

    -- Strani ključevi
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
    FOREIGN KEY (discussion_id) REFERENCES discussion(id) ON DELETE CASCADE
);



CREATE TABLE like_dislike (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primarni ključ sa automatskim povećanjem
    user_id INT NOT NULL,              -- ID korisnika koji lajkuje/dislajkuje
    discussion_id INT NOT NULL,        -- ID diskusije na koju se odnosi akcija
    action ENUM('like', 'dislike') NOT NULL, -- Akcija: može biti 'like' ili 'dislike'
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE, -- Veza sa tabelom users
    FOREIGN KEY (discussion_id) REFERENCES discussion(id) ON DELETE CASCADE -- Veza sa tabelom discussion
);


-- Izmena tabele za komentare
-- Dodavanje nove kolone discussion_id
ALTER TABLE comment 
ADD COLUMN discussion_id INT NOT NULL;

-- Povezivanje discussion_id sa tabelom discussion
ALTER TABLE comment 
ADD CONSTRAINT fk_comment_discussion
FOREIGN KEY (discussion_id) REFERENCES discussion(id) ON DELETE CASCADE;

-- Uklanjanje kolone post_id ako više nije potrebna
ALTER TABLE comment 
DROP COLUMN post_id;

-- Dodavanje vremenskih oznaka u tabelu discussion
ALTER TABLE discussion
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN updated_at TIMESTAMP NULL;
