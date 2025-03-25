CREATE DATABASE fashion_db;
CREATE USER 'fashion_user'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON fashion_db.* TO 'fashion_user'@'localhost';

USE fashion_db;

-- For old dataset:
-- CREATE TABLE clothing_items (
--     id VARCHAR(255) PRIMARY KEY,
--     gender VARCHAR(50),
--     masterCategory VARCHAR(255),
--     subCategory VARCHAR(255),
--     articleType VARCHAR(255),
--     baseColour VARCHAR(255),
--     season VARCHAR(50),
--     year INT,
--     `usage` VARCHAR(255),
--     productDisplayName VARCHAR(255)
-- );

CREATE TABLE h_and_m_clothing_items (
    article_id VARCHAR(20),
    product_code VARCHAR(20),
    prod_name VARCHAR(255),
    product_type_no INT,
    product_type_name VARCHAR(255),
    product_group_name VARCHAR(255),
    graphical_appearance_no INT,
    graphical_appearance_name VARCHAR(255),
    colour_group_code VARCHAR(20),
    colour_group_name VARCHAR(255),
    perceived_colour_value_id INT,
    perceived_colour_value_name VARCHAR(255),
    perceived_colour_master_id INT,
    perceived_colour_master_name VARCHAR(255),
    department_no INT,
    department_name VARCHAR(255),
    index_code VARCHAR(10),
    index_name VARCHAR(255),
    index_group_no INT,
    index_group_name VARCHAR(255),
    section_no INT,
    section_name VARCHAR(255),
    garment_group_no INT,
    garment_group_name VARCHAR(255),
    detail_desc TEXT
);

CREATE TABLE h_and_m_transactions (
    t_dat DATE,
    customer_id VARCHAR(255),
    article_id VARCHAR(20),
    price DECIMAL(10, 6),
    sales_channel_id INT
);
