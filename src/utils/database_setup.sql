CREATE DATABASE fashion_db;
CREATE USER 'fashion_user'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON fashion_db.* TO 'fashion_user'@'localhost';

USE fashion_db;

CREATE TABLE clothing_items (
    id VARCHAR(255) PRIMARY KEY,
    gender VARCHAR(50),
    masterCategory VARCHAR(255),
    subCategory VARCHAR(255),
    articleType VARCHAR(255),
    baseColour VARCHAR(255),
    season VARCHAR(50),
    year INT,
    `usage` VARCHAR(255),
    productDisplayName VARCHAR(255)
);
