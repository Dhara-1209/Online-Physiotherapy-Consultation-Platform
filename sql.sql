CREATE DATABASE IF NOT EXISTS knee;
USE knee;

CREATE TABLE log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL
);
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    stiffness ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    pain_frequency ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    activity_limit ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    rising_pain ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    kneeling_pain ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    squatting_pain ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    household_activities ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    jumping_pain ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    running_pain ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    sport_pain ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    qol ENUM('None', 'Mild', 'Moderate', 'Severe', 'Extreme'),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE feedback
ADD COLUMN stiffness_score FLOAT NULL,
ADD COLUMN pain_score FLOAT NULL,
ADD COLUMN qol_score FLOAT NULL,
ADD COLUMN average_score FLOAT NULL;