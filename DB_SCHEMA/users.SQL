CREATE TABLE users (
    ID SERIAL PRIMARY KEY,                -- 自動遞增的使用者 ID
    USER_NAME VARCHAR(50) UNIQUE NOT NULL, -- 使用者名稱 (不可重複)
    EMAIL VARCHAR(100) UNIQUE NOT NULL,   -- 電子郵件 (不可重複)
    PASSWORD_HASH TEXT NOT NULL,          -- 密碼 (使用哈希存儲)
    TEAM VARCHAR(25) NOT NULL,            --所屬隊伍
	CREATE_DATE TIMESTAMP DEFAULT NOW()    -- 註冊時間
);