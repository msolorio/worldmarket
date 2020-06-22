DROP DATABASE IF EXISTS worldmarket_db;
CREATE DATABASE worldmarket_db;
USE worldmarket_db;

CREATE TABLE items (
	id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50),
    starting_bid DECIMAL(11, 2) DEFAULT 0,
    highest_bid DECIMAL(11, 2) DEFAULT 0,
    PRIMARY KEY (id)
);
