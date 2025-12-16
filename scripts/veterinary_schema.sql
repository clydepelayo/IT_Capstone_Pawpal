-- VetCare Database Schema
-- MySQL Database for Veterinary Management System

CREATE DATABASE IF NOT EXISTS vetcare;
USE vetcare;

-- Users table (for both clients and admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') DEFAULT 'client',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Pets table
CREATE TABLE pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(30) NOT NULL,
    breed VARCHAR(50),
    age_years INT,
    age_months INT,
    weight DECIMAL(5,2),
    color VARCHAR(30),
    gender ENUM('male', 'female'),
    microchip_id VARCHAR(50) UNIQUE,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('medical', 'grooming', 'boarding', 'emergency') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('food', 'toys', 'hygiene', 'health', 'accessories') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    sku VARCHAR(50) UNIQUE,
    brand VARCHAR(50),
    weight_kg DECIMAL(5,2),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    service_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    veterinarian_notes TEXT,
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method ENUM('cash', 'card', 'gcash', 'bank_transfer') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP NULL,
    delivered_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Medical records table
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    appointment_id INT,
    record_type ENUM('checkup', 'vaccination', 'surgery', 'treatment', 'emergency') NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    next_visit_date DATE,
    veterinarian_name VARCHAR(100),
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Transactions table (for financial tracking)
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('appointment', 'product_purchase', 'service') NOT NULL,
    reference_id INT, -- Can reference appointment_id or order_id
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'gcash', 'bank_transfer') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inventory movements table
CREATE TABLE inventory_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_type ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
    reference_id INT, -- Can reference order_id or other relevant ID
    notes TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT, -- admin user who made the movement
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES
('Admin', 'User', 'admin@vetcare.ph', '+63912345678', '$2b$10$example_hash_here', 'admin');

-- Insert sample services
INSERT INTO services (name, description, category, price, duration_minutes) VALUES
('General Checkup', 'Comprehensive health examination for pets', 'medical', 800.00, 30),
('Vaccination', 'Essential vaccinations for pet health', 'medical', 1200.00, 20),
('Pet Grooming', 'Complete grooming service including bath and nail trim', 'grooming', 1500.00, 90),
('Dental Cleaning', 'Professional dental cleaning and oral health check', 'medical', 2500.00, 60),
('Pet Boarding (per day)', 'Safe and comfortable boarding facility', 'boarding', 800.00, 1440),
('Emergency Consultation', '24/7 emergency veterinary care', 'emergency', 2000.00, 45),
('Spay/Neuter Surgery', 'Surgical sterilization procedure', 'medical', 5000.00, 120),
('Microchip Implantation', 'Pet identification microchip insertion', 'medical', 1000.00, 15);

-- Insert sample products
INSERT INTO products (name, description, category, price, stock_quantity, low_stock_threshold, sku, brand) VALUES
('Premium Dog Food 15kg', 'High-quality nutrition for adult dogs', 'food', 1500.00, 50, 10, 'PDF001', 'PetNutrition'),
('Cat Litter 10kg', 'Odor-control clumping cat litter', 'hygiene', 800.00, 30, 10, 'CL001', 'CleanPaws'),
('Dog Toy Bone', 'Durable chew toy for dogs', 'toys', 350.00, 25, 5, 'DTB001', 'PlayTime'),
('Pet Vitamins', 'Essential vitamins for pet health', 'health', 1200.00, 40, 15, 'PV001', 'HealthyPets'),
('Cat Scratching Post', 'Tall scratching post with sisal rope', 'toys', 2500.00, 15, 5, 'CSP001', 'CatComfort'),
('Pet Shampoo 500ml', 'Gentle shampoo for sensitive skin', 'hygiene', 450.00, 35, 10, 'PS001', 'CleanCoat'),
('Dog Leash', 'Adjustable nylon dog leash', 'accessories', 600.00, 20, 5, 'DL001', 'WalkSafe'),
('Cat Food Wet 400g', 'Premium wet food for cats', 'food', 180.00, 60, 20, 'CFW001', 'FelineChoice');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_user_pet ON appointments(user_id, pet_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
