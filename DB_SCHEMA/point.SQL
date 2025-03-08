CREATE TABLE point (
    point_seq_num SERIAL PRIMARY KEY,  -- 流水號，自動遞增
    player_id INT NOT NULL,  -- 球員 ID
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 創建時間，預設當前時間
    attack_point FLOAT DEFAULT 0,  -- 進攻得分
    defense_point FLOAT DEFAULT 0,  -- 防守得分
    receive_point FLOAT DEFAULT 0,  -- 接球得分
    set_point FLOAT DEFAULT 0,  -- 舉球得分
    block_point FLOAT DEFAULT 0,  -- 攔網得分
    serve_point FLOAT DEFAULT 0,  -- 發球得分
    total_point FLOAT GENERATED ALWAYS AS 
        (attack_point + defense_point + receive_point + set_point + block_point + serve_point) STORED,  
        -- 總得分 (計算欄位)
    status INT  -- 狀態 (1: 啟用, 0: 停用)
);