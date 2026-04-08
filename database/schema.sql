CREATE DATABASE IF NOT EXISTS ecommerce_cart_db;
USE ecommerce_cart_db;

CREATE TABLE IF NOT EXISTS product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price FLOAT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    stock INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cartitem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    CONSTRAINT fk_cartitem_product
        FOREIGN KEY (product_id) REFERENCES product(id)
        ON DELETE CASCADE
);