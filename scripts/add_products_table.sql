-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('food', 'toys', 'hygiene', 'health', 'accessories') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    sku VARCHAR(100) UNIQUE,
    brand VARCHAR(255),
    weight_kg DECIMAL(8, 2),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, category, price, stock_quantity, low_stock_threshold, sku, brand, weight_kg) VALUES
('Premium Dog Food', 'High-quality nutrition for adult dogs', 'food', 1500.00, 50, 10, 'PDF001', 'PetNutrition', 5.0),
('Cat Litter', 'Clumping clay litter for cats', 'hygiene', 800.00, 30, 10, 'CL001', 'CleanPaws', 10.0),
('Dog Toy Bone', 'Durable chew toy for dogs', 'toys', 350.00, 25, 5, 'DTB001', 'PlayTime', 0.5),
('Pet Vitamins', 'Daily vitamins for pets', 'health', 1200.00, 40, 15, 'PV001', 'HealthyPet', 0.2),
('Cat Scratching Post', 'Tall scratching post for cats', 'toys', 2500.00, 15, 5, 'CSP001', 'CatFun', 8.0),
('Pet Shampoo', 'Gentle shampoo for all pets', 'hygiene', 450.00, 35, 10, 'PS001', 'CleanCoat', 0.5),
('Dog Leash', 'Adjustable leash for dogs', 'accessories', 750.00, 20, 5, 'DL001', 'WalkSafe', 0.3),
('Cat Food Wet', 'Premium wet food for cats', 'food', 120.00, 100, 20, 'CFW001', 'FelineFeast', 0.4);
