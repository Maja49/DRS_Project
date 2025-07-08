-- DROP TABLES (cascade zbog FK)
DROP TABLE IF EXISTS like_dislike CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS commentdiscussion CASCADE;
DROP TABLE IF EXISTS comment CASCADE;
DROP TABLE IF EXISTS discussion CASCADE;
DROP TABLE IF EXISTS theme CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Tabela User
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
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
  is_approved BOOLEAN DEFAULT FALSE,
  is_first_login BOOLEAN DEFAULT TRUE
);

-- Tabela theme
CREATE TABLE theme (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela discussion
CREATE TABLE discussion (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  theme_id INTEGER NOT NULL REFERENCES theme(id),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  user_id INTEGER NOT NULL REFERENCES "User"(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  title TEXT NOT NULL
);

-- Tabela comment
CREATE TABLE comment (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  mentioned_user_id INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
  discussion_id INTEGER NOT NULL
);

-- Tabela commentdiscussion
CREATE TABLE commentdiscussion (
  comment_id INTEGER NOT NULL REFERENCES comment(id) ON DELETE CASCADE,
  discussion_id INTEGER NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, discussion_id)
);

-- Tabela comments (druga tabela komentara)
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id),
  discussion_id INTEGER NOT NULL REFERENCES discussion(id),
  text VARCHAR(255) NOT NULL,
  mentioned_user_id INTEGER REFERENCES "User"(id)
);

-- Tabela like_dislike
CREATE TABLE like_dislike (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  discussion_id INTEGER NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
  action VARCHAR(7) NOT NULL CHECK (action IN ('like','dislike'))
);
