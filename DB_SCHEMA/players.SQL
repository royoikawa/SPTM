CREATE TABLE players (
    PLAYER_ID SERIAL PRIMARY KEY,  -- 自動遞增的主鍵
    player_name VARCHAR(100) NOT NULL,  -- 球員名字
    role VARCHAR(50) NOT NULL,  -- 球員位置
    number INT NOT NULL,  -- 背號
    team_user_name VARCHAR(100) NOT NULL  -- 隊伍名稱
);