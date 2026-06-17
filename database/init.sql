-- Valley 360 Smart Parking Platform
-- Database Initialization Script
-- Run this script after the application creates the tables (first run)

-- ===========================================
-- ROLES TABLE - Required for user registration
-- ===========================================
-- The application uses role IDs:
-- 1 = ROLE_ADMIN (Platform Administrator)
-- 2 = ROLE_OWNER (Parking Space Owner)
-- 3 = ROLE_CUSTOMER (Customer/Driver)

INSERT INTO roles (id, role_name) VALUES (1, 'ROLE_ADMIN') 
ON DUPLICATE KEY UPDATE role_name = 'ROLE_ADMIN';

INSERT INTO roles (id, role_name) VALUES (2, 'ROLE_OWNER') 
ON DUPLICATE KEY UPDATE role_name = 'ROLE_OWNER';

INSERT INTO roles (id, role_name) VALUES (3, 'ROLE_CUSTOMER') 
ON DUPLICATE KEY UPDATE role_name = 'ROLE_CUSTOMER';

-- ===========================================
-- VERIFY ROLES ARE INSERTED
-- ===========================================
SELECT * FROM roles;

-- ===========================================
-- OPTIONAL: Create a default admin user
-- Password: Admin@123 (BCrypt encoded)
-- ===========================================
-- Uncomment below if you want a pre-created admin:
-- 
-- INSERT INTO users (id, email, password, first_name, last_name, contact, gender, address, role_id)
-- VALUES (1, 'admin@valley360.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
--         'System', 'Admin', '9999999999', 'Other', 'Valley 360 HQ', 1)
-- ON DUPLICATE KEY UPDATE email = 'admin@valley360.com';
-- 
-- INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)
-- ON DUPLICATE KEY UPDATE role_id = 1;
