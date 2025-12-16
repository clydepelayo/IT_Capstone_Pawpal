-- Update admin password to "password"
-- First, let's hash the password "password" using bcrypt

UPDATE users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@vetcare.ph' AND role = 'admin';

-- If admin user doesn't exist, create one
INSERT IGNORE INTO users (first_name, last_name, email, phone, password_hash, role) 
VALUES ('Admin', 'User', 'admin@vetcare.ph', '+63912345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
