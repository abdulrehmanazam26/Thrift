-- Thrift Karo custom ecommerce database (MySQL 8+).
CREATE DATABASE IF NOT EXISTS thrift_karo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE thrift_karo;

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) PRIMARY KEY, parent_id CHAR(36) NULL, category_name VARCHAR(100) NOT NULL, slug VARCHAR(120) NOT NULL UNIQUE,
  image_path VARCHAR(500) NULL, status ENUM('active','inactive') NOT NULL DEFAULT 'active', sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_categories_parent_status (parent_id, status, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY, product_name VARCHAR(200) NOT NULL, slug VARCHAR(220) NOT NULL UNIQUE, sku VARCHAR(80) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL DEFAULT 'Unbranded', short_description VARCHAR(500) NOT NULL DEFAULT '', full_description TEXT NOT NULL,
  condition_grade ENUM('New','Like New','Excellent','Very Good','Good','Fair','Vintage','Premium') NOT NULL DEFAULT 'Good', condition_notes VARCHAR(500) NOT NULL DEFAULT '',
  category_id CHAR(36) NULL, gender ENUM('Men','Women','Unisex') NOT NULL DEFAULT 'Unisex', size_label VARCHAR(50) NOT NULL DEFAULT 'One size',
  color VARCHAR(100) NOT NULL DEFAULT 'Not specified', material VARCHAR(100) NULL, price INT UNSIGNED NOT NULL, sale_price INT UNSIGNED NULL,
  stock TINYINT UNSIGNED NOT NULL DEFAULT 1, status ENUM('active','inactive','sold','deleted') NOT NULL DEFAULT 'active', featured BOOLEAN NOT NULL DEFAULT FALSE,
  style_tags JSON NOT NULL, defect_notes JSON NOT NULL, collection_tags JSON NOT NULL, era VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, deleted_at DATETIME NULL,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT chk_products_stock CHECK (stock <= 1), CONSTRAINT chk_products_prices CHECK (sale_price IS NULL OR sale_price <= price),
  INDEX idx_products_catalog (status, gender, category_id, created_at), INDEX idx_products_condition (condition_grade), INDEX idx_products_featured (featured, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
  id CHAR(36) PRIMARY KEY, product_id CHAR(36) NOT NULL, image_path VARCHAR(500) NOT NULL, alt_text VARCHAR(255) NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE, sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_images_order (product_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) PRIMARY KEY, first_name VARCHAR(100) NULL, last_name VARCHAR(100) NULL, email VARCHAR(254) NULL UNIQUE, phone VARCHAR(30) NULL UNIQUE,
  password_hash VARCHAR(255) NULL, status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_addresses (
  id CHAR(36) PRIMARY KEY, customer_id CHAR(36) NOT NULL, full_name VARCHAR(200) NOT NULL, phone VARCHAR(30) NOT NULL,
  address_line_1 VARCHAR(255) NOT NULL, address_line_2 VARCHAR(255) NULL, city VARCHAR(100) NOT NULL, province VARCHAR(100) NULL,
  postal_code VARCHAR(30) NULL, country VARCHAR(100) NOT NULL DEFAULT 'Pakistan', address_type ENUM('home','work','other') NOT NULL DEFAULT 'home',
  is_default BOOLEAN NOT NULL DEFAULT FALSE, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE, INDEX idx_addresses_customer (customer_id, is_default)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY, order_number VARCHAR(32) NOT NULL UNIQUE, idempotency_key CHAR(36) NOT NULL UNIQUE, customer_id CHAR(36) NULL,
  customer_name VARCHAR(200) NOT NULL, customer_email VARCHAR(254) NULL, customer_phone VARCHAR(30) NOT NULL, shipping_address VARCHAR(500) NOT NULL,
  area VARCHAR(100) NOT NULL, city VARCHAR(100) NOT NULL DEFAULT 'Karachi', province VARCHAR(100) NULL, postal_code VARCHAR(30) NULL,
  subtotal INT UNSIGNED NOT NULL, discount_amount INT UNSIGNED NOT NULL DEFAULT 0, shipping_amount INT UNSIGNED NOT NULL DEFAULT 250, total_amount INT UNSIGNED NOT NULL,
  payment_method ENUM('cod') NOT NULL DEFAULT 'cod', payment_status ENUM('unpaid','paid','refunded','failed') NOT NULL DEFAULT 'unpaid',
  order_status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  customer_notes VARCHAR(500) NULL, admin_notes VARCHAR(1000) NULL, access_token_hash CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT chk_orders_total CHECK (total_amount = subtotal - discount_amount + shipping_amount),
  INDEX idx_orders_status_created (order_status, created_at), INDEX idx_orders_customer (customer_id, created_at), INDEX idx_orders_phone (customer_phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) PRIMARY KEY, order_id CHAR(36) NOT NULL, product_id CHAR(36) NULL, product_name VARCHAR(200) NOT NULL, product_image VARCHAR(500) NULL,
  price INT UNSIGNED NOT NULL, quantity TINYINT UNSIGNED NOT NULL DEFAULT 1, subtotal INT UNSIGNED NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT chk_order_items_quantity CHECK (quantity = 1), INDEX idx_order_items_order (order_id), INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id CHAR(36) NOT NULL, old_status VARCHAR(30) NULL, new_status VARCHAR(30) NOT NULL,
  note VARCHAR(1000) NULL, changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, INDEX idx_order_history_order (order_id, changed_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(254) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','manager') NOT NULL DEFAULT 'manager', status ENUM('active','inactive') NOT NULL DEFAULT 'active', last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY, setting_value TEXT NOT NULL, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banners (
  id CHAR(36) PRIMARY KEY, title VARCHAR(200) NOT NULL, subtitle VARCHAR(500) NULL, image_path VARCHAR(500) NOT NULL,
  button_text VARCHAR(80) NULL, button_url VARCHAR(500) NULL, position ENUM('homepage_hero','homepage_feature') NOT NULL DEFAULT 'homepage_hero',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active', sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banners_position (position, status, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash CHAR(64) PRIMARY KEY, attempts TINYINT UNSIGNED NOT NULL DEFAULT 0, blocked_until DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS checkout_attempts (
  ip_hash CHAR(64) PRIMARY KEY, attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO categories (id, parent_id, category_name, slug, sort_order) VALUES
  ('10000000-0000-4000-8000-000000000001', NULL, 'Men', 'men', 1), ('10000000-0000-4000-8000-000000000002', NULL, 'Women', 'women', 2), ('10000000-0000-4000-8000-000000000003', NULL, 'Vintage', 'vintage', 3),
  ('10000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001', 'Jackets', 'men-jackets', 1), ('10000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001', 'Trousers', 'men-trousers', 2), ('10000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001', 'Tops', 'men-tops', 3),
  ('10000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000002', 'Jackets', 'women-jackets', 1), ('10000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000002', 'Dresses', 'women-dresses', 2), ('10000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002', 'Tops', 'women-tops', 3),
  ('10000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000003', 'Vintage Jackets', 'vintage-jackets', 1), ('10000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000003', 'Vintage Shirts', 'vintage-shirts', 2)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name), updated_at = CURRENT_TIMESTAMP;

INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('shipping_city', 'Karachi'), ('shipping_fee', '250'), ('checkout_enabled', 'false'), ('announcement_text', 'Good clothes. Second chances.'), ('homepage_heading', 'Find your next story.')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP;
