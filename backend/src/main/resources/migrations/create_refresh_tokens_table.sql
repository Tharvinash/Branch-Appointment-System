-- Migration: Create refresh tokens table
-- Description: Stores refresh tokens for JWT authentication
-- Created: 2024

CREATE TABLE IF NOT EXISTS BAS_Refresh_Tokens (
    Token_Id BIGINT PRIMARY KEY AUTO_INCREMENT,
    Token VARCHAR(500) NOT NULL UNIQUE,
    User_Id BIGINT NOT NULL,
    Expires_At DATETIME NOT NULL,
    Created_At DATETIME NOT NULL,
    FOREIGN KEY (User_Id) REFERENCES BAS_Users(User_Id) ON DELETE CASCADE,
    INDEX idx_token (Token),
    INDEX idx_user_id (User_Id),
    INDEX idx_expires_at (Expires_At)
);

