CREATE TABLE matches (
    match_no SERIAL PRIMARY KEY, 
    match_id VARCHAR(20) NOT NULL UNIQUE, 
    match_date DATE NOT NULL, 
    opponent VARCHAR(100) NOT NULL, 
    set_number INT NOT NULL,
    team_user_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
