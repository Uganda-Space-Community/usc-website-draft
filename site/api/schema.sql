-- USC Database Schema
-- Run this in cPanel MySQL or phpMyAdmin

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('member','curator','admin') DEFAULT 'member',
  bio TEXT,
  interests TEXT,
  affiliations JSON,
  connections JSON,
  location VARCHAR(255),
  avatar_url VARCHAR(500),
  website VARCHAR(500),
  twitter VARCHAR(255),
  linkedin VARCHAR(255),
  status ENUM('active','suspended') DEFAULT 'active',
  last_login TIMESTAMP NULL,
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
  review_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_submissions_type_status ON submissions(type, status);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);

CREATE TABLE IF NOT EXISTS faq_votes (
  user_id INT NOT NULL,
  answer_key VARCHAR(50) NOT NULL,
  value TINYINT NOT NULL,
  PRIMARY KEY (user_id, answer_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(255),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action_type ON audit_log(action_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
