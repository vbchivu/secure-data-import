-- db_init/init.sql

-- Create the database (only needed if not defined in MYSQL_DATABASE)
CREATE DATABASE IF NOT EXISTS application_db;

-- Use the database
USE application_db;

-- Create tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    permissions TEXT
);

CREATE TABLE ssh_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    private_key TEXT NOT NULL,
    public_key TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    db_host VARCHAR(255) NOT NULL,
    db_port INT NOT NULL,
    db_username VARCHAR(255) NOT NULL,
    db_password TEXT NOT NULL,
    db_name VARCHAR(255) NOT NULL,
    ssh_host VARCHAR(255) NOT NULL,
    ssh_port INT NOT NULL DEFAULT 22,
    ssh_username VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

