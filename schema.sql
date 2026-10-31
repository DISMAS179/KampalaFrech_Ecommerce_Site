-- ====================================================================
-- Kampala Fresh Grocery Database Schema (MySQL 8.0+)
-- Database: kampala_fresh_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS kampala_fresh_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kampala_fresh_db;

-- 1. Categories Table
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admin_users;

CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  category_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  price_ugx INT NOT NULL,
  unit VARCHAR(50) NOT NULL, -- e.g. 'kg', 'bunch', 'litre', 'tray', 'cluster', 'piece'
  stock_status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
  stock_quantity INT DEFAULT 50,
  is_featured BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(500) NOT NULL,
  origin VARCHAR(100) DEFAULT 'Uganda Farms',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_stock (stock_status),
  INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Orders Table
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE, -- e.g. KF-2026-1042
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  delivery_area VARCHAR(100) NOT NULL, -- e.g. 'Nakasero', 'Kololo', 'Ntinda'
  delivery_address TEXT NOT NULL,
  delivery_slot ENUM('morning', 'afternoon', 'evening') NOT NULL,
  substitution_pref VARCHAR(100) DEFAULT 'call_first', -- 'call_first', 'replace_similar', 'skip_item'
  substitution_note TEXT,
  subtotal_ugx INT NOT NULL,
  delivery_fee_ugx INT NOT NULL DEFAULT 3000,
  total_ugx INT NOT NULL,
  payment_method ENUM('mtn_momo', 'airtel_money', 'cash_on_delivery') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  order_status ENUM('Received', 'Packing', 'Out for delivery', 'Delivered', 'Cancelled') DEFAULT 'Received',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_order_status (order_status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Order Items Table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  price_ugx INT NOT NULL,
  quantity INT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  line_total_ugx INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Mobile Money & Cash Payments Table
CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  payment_method ENUM('mtn_momo', 'airtel_money', 'cash_on_delivery') NOT NULL,
  phone_number VARCHAR(30),
  amount_ugx INT NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  telecom_ref VARCHAR(100), -- USSD/MoMo transaction reference
  failure_reason VARCHAR(255),
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_telecom_ref (telecom_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Admin Users Table (Hashed password)
CREATE TABLE admin_users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED SAMPLE DATA: Categories
-- ====================================================================
INSERT INTO categories (id, name, slug, description, display_order) VALUES
('cat_veg', 'Vegetables', 'vegetables', 'Fresh leafy greens, garden vegetables and fresh herbs', 1),
('cat_fruit', 'Fruit', 'fruit', 'Sun-ripened tropical Ugandan fruits, sweet bananas and melons', 2),
('cat_staples', 'Staples', 'staples', 'Matooke, fresh posho flour, Ugandan super rice and tubers', 3),
('cat_dairy', 'Dairy & Eggs', 'dairy', 'Farm fresh pasteurized milk, local farm eggs and ghee', 4),
('cat_meat', 'Meat & Fish', 'meat-and-fish', 'Fresh Lake Victoria tilapia, local poultry and prime cuts', 5);

-- ====================================================================
-- SEED SAMPLE DATA: 20 Realistic Kampala Fresh Products with UGX Prices
-- ====================================================================
INSERT INTO products (id, category_id, name, slug, description, price_ugx, unit, stock_status, stock_quantity, is_featured, image_url, origin) VALUES
-- Staples
('prod_01', 'cat_staples', 'Fresh Matooke (Whole Cluster)', 'fresh-matooke-cluster', 'Freshly harvested highland green bananas from Mbarara. Tender, golden when steamed.', 8500, 'cluster', 'in_stock', 45, TRUE, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80', 'Mbarara & Masaka Farms'),
('prod_02', 'cat_staples', 'Kabale Irish Potatoes', 'kabale-irish-potatoes', 'Grade A firm red-skin Irish potatoes from the cool hills of Kabale. Perfect for boiling and chips.', 4500, 'kg', 'in_stock', 60, TRUE, 'Kabale Highlands'),
('prod_03', 'cat_staples', 'Ugandan Super Rice (Pure Pearl)', 'ugandan-super-rice', 'Aromatic, long-grain fragrant rice from the wetland plains of Butaleja. Clean stone-free quality.', 5500, 'kg', 'in_stock', 50, TRUE, 'Butaleja Mills'),
('prod_04', 'cat_staples', 'Fine Posho (Maize Flour No. 1)', 'fine-posho-maize-flour', 'Ultra-sifted white maize meal for smooth mingling. High energy household staple.', 3500, 'kg', 'in_stock', 80, FALSE, 'Jinja Grain Silos'),
('prod_05', 'cat_staples', 'Yellow Sweet Potatoes', 'yellow-sweet-potatoes', 'Naturally sweet, nutrient-dense tubers. Freshly dug from Mpigi gardens.', 3500, 'kg', 'in_stock', 30, FALSE, 'Mpigi District'),

-- Vegetables
('prod_06', 'cat_veg', 'Fresh Sukuma Wiki (Collard Greens)', 'fresh-sukuma-wiki', 'Crisp, nutrient-rich dark green leaves. Bundled fresh daily at morning harvest.', 2000, 'bunch', 'in_stock', 70, TRUE, 'Wakiso Farmers Coop'),
('prod_07', 'cat_veg', 'Traditional Nakati', 'traditional-nakati', 'Beloved local bitter-sweet nightshade greens. Steams wonderfully with groundnut sauce.', 1500, 'bunch', 'in_stock', 55, TRUE, 'Gayaza Gardeners'),
('prod_08', 'cat_veg', 'Red Salad Tomatoes', 'red-salad-tomatoes', 'Plump, vine-ripened red tomatoes from greenhouse growers in Mukono. Firm and flavorful.', 4000, 'kg', 'in_stock', 65, TRUE, 'Mukono Greenhouses'),
('prod_09', 'cat_veg', 'Red Dry Onions', 'red-dry-onions', 'Pungent, well-cured medium red onions. Essential seasoning for stews and roasts.', 4500, 'kg', 'in_stock', 50, FALSE, 'Kapchorwa & Kasese'),
('prod_10', 'cat_veg', 'Fresh Green Bell Peppers', 'fresh-green-bell-peppers', 'Aromatic, crunchy green capsicums. Hand-sorted for premium size and skin shine.', 3000, 'kg', 'in_stock', 40, FALSE, 'Luwero Triangle Farms'),
('prod_11', 'cat_veg', 'Sweet Orange Carrots', 'sweet-orange-carrots', 'Crisp, washed sweet carrots, harvested in fertile volcanic soil.', 3500, 'kg', 'in_stock', 45, FALSE, 'Kigezi Highlands'),
('prod_12', 'cat_veg', 'Fresh Dodo (Amaranth Greens)', 'fresh-dodo-amaranth', 'Tender young leaves of local red-stem amaranth. Rich in iron and vitamin C.', 1500, 'bunch', 'in_stock', 40, FALSE, 'Entebbe Road Gardens'),

-- Fruit
('prod_13', 'cat_fruit', 'Bogoya Sweet Bananas', 'bogoya-sweet-bananas', 'Naturally ripened, sweet dessert bananas with golden peel and creamy texture.', 4000, 'cluster', 'in_stock', 50, TRUE, 'Kayunga Plantations'),
('prod_14', 'cat_fruit', 'Sugar Baby Watermelon', 'sugar-baby-watermelon', 'Crisp, ultra-sweet red heart watermelon. Deeply refreshing for Kampala afternoons.', 7000, 'piece', 'in_stock', 25, TRUE, 'Lake Kyoga Basin'),
('prod_15', 'cat_fruit', 'Hass Avocado (Grade A)', 'hass-avocado', 'Rich, buttery pear avocados with dark pebbled skin. Perfect ripeness for salads.', 3500, 'kg', 'in_stock', 35, TRUE, 'Fort Portal Groves'),
('prod_16', 'cat_fruit', 'Masaka Purple Passion Fruit', 'masaka-purple-passion-fruit', 'Intensely fragrant purple passion fruits with rich, tangy juice pulp.', 6000, 'kg', 'in_stock', 30, FALSE, 'Masaka Smallholders'),

-- Dairy & Eggs
('prod_17', 'cat_dairy', 'Fresh Pasteurized Whole Milk', 'fresh-pasteurized-whole-milk', 'Pure, rich whole cow milk gently pasteurized. Delivered chilled in sealed bottle.', 3200, 'litre', 'in_stock', 60, TRUE, 'Mbarara Dairy Cooperative'),
('prod_18', 'cat_dairy', 'Farm Fresh White/Brown Eggs', 'farm-fresh-eggs-tray', 'Full tray of 30 clean, graded fresh poultry eggs. High yolk index and intact shells.', 14000, 'tray', 'in_stock', 35, TRUE, 'Semuto Poultry Farm'),

-- Meat & Fish
('prod_19', 'cat_meat', 'Fresh Whole Tilapia (Lake Victoria)', 'fresh-whole-tilapia', 'Caught daily by local fishermen in Ggaba. Cleaned, scaled and gutted on order.', 16000, 'kg', 'in_stock', 20, TRUE, 'Ggaba Landing Site, Lake Victoria'),
('prod_20', 'cat_meat', 'Prime Beef Stew Cuts', 'prime-beef-stew-cuts', 'Tender lean beef chuck, diced into neat cubes for Ugandan katogo or curry.', 16500, 'kg', 'in_stock', 30, TRUE, 'Soroti Cattle Ranchers');

-- ====================================================================
-- SEED SAMPLE DATA: Admin User
-- Password for demo: "kampala2026" (bcrypt hash: $2a$10$w85Uq3V... or verified in app backend)
-- ====================================================================
INSERT INTO admin_users (id, username, password_hash, full_name, role) VALUES
('adm_01', 'admin', 'kampala2026', 'Kampala Fresh Depot Manager', 'admin');

-- Sample Initial Orders for Admin metrics display
INSERT INTO orders (id, order_number, customer_name, customer_phone, delivery_area, delivery_address, delivery_slot, substitution_pref, subtotal_ugx, delivery_fee_ugx, total_ugx, payment_method, payment_status, order_status, notes, created_at) VALUES
('ord_101', 'KF-8821', 'Sarah Namubiru', '0772123456', 'Ntinda', 'Plot 18 Martyrs Way, near shell', 'morning', 'call_first', 26000, 3000, 29000, 'mtn_momo', 'completed', 'Packing', 'Please pick green matooke cluster', NOW() - INTERVAL 2 HOUR),
('ord_102', 'KF-8822', 'David Otim', '0701987654', 'Kololo', 'Acacia Avenue, Apartment 4B', 'afternoon', 'replace_similar', 34500, 3000, 37500, 'airtel_money', 'completed', 'Out for delivery', 'Gate code is 4412', NOW() - INTERVAL 1 HOUR),
('ord_103', 'KF-8823', 'Amina Nakate', '0782334455', 'Bugolobi', 'Bandali Rise, Plot 8', 'evening', 'call_first', 21500, 3000, 24500, 'cash_on_delivery', 'pending', 'Received', 'Office delivery on 2nd floor', NOW() - INTERVAL 30 MINUTE);

INSERT INTO order_items (order_id, product_id, product_name, price_ugx, quantity, unit, line_total_ugx) VALUES
('ord_101', 'prod_01', 'Fresh Matooke (Whole Cluster)', 8500, 2, 'cluster', 17000),
('ord_101', 'prod_06', 'Fresh Sukuma Wiki (Collard Greens)', 2000, 3, 'bunch', 6000),
('ord_101', 'prod_08', 'Red Salad Tomatoes', 4000, 1, 'kg', 4000),
('ord_102', 'prod_19', 'Fresh Whole Tilapia (Lake Victoria)', 16000, 1, 'kg', 16000),
('ord_102', 'prod_18', 'Farm Fresh White/Brown Eggs', 14000, 1, 'tray', 14000),
('ord_102', 'prod_11', 'Sweet Orange Carrots', 3500, 1, 'kg', 3500),
('ord_103', 'prod_17', 'Fresh Pasteurized Whole Milk', 3200, 3, 'litre', 9600),
('prod_02', 'prod_02', 'Kabale Irish Potatoes', 4500, 2, 'kg', 9000),
('ord_103', 'prod_13', 'Bogoya Sweet Bananas', 4000, 1, 'cluster', 4000);
