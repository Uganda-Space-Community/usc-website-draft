-- USC Database Schema
-- Run this in cPanel MySQL or phpMyAdmin

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('member','admin','moderator') DEFAULT 'member',
  bio TEXT,
  interests TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('event','program','project','organization','profile','question','news','article','opportunity') NOT NULL,
  user_id INT,
  payload JSON NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reviewed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faq_votes (
  user_id INT NOT NULL,
  answer_key VARCHAR(50) NOT NULL,
  value TINYINT NOT NULL,
  PRIMARY KEY (user_id, answer_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
