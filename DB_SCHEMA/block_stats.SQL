CREATE TABLE block_stats (
    id SERIAL PRIMARY KEY,
    player_id INT NOT NULL,
    match_id VARCHAR(20) NOT NULL,
    success INT DEFAULT 0,
    effective INT DEFAULT 0,
    ineffective INT DEFAULT 0,
    error INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);