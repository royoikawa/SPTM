// model/userModel.js
const pool = require('./db'); // 引入資料庫連線

// 查詢特定隊伍所有球員
const getPlayerByTeamUserName = async (team) => {
    try {
        const result = await pool.query
        (`SELECT * FROM players 
        WHERE TEAM_USER_NAME = $1 
        order by PLAYER_ID desc`, 
        [team]);
        return result;
    } catch (error) {
        console.error("Error fetching players:", error);
        throw new Error("Database query failed"); // 拋出錯誤讓上層處理
    }
};

// 新增隊員
const addPlayer = async (player_name, role, number, team_user_name) => {
    try {
        const result = await pool.query(
            `INSERT INTO players (player_name, role, number, team_user_name)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [player_name, role, number, team_user_name]
        );
        return result.rows[0]; // 回傳新增加的球員資料
    } catch (error) {
        console.error("Error adding player:", error);
        throw new Error("Failed to add player");
    }
};

const getPlayersByIds = async (ids) => {
    try {
        // 檢查是否有提供 ID
        if (!ids || ids.length === 0) {
            throw new Error("IDs array is empty or undefined");
        }

        // 動態產生 SQL 參數 (避免 SQL Injection)
        const placeholders = ids.map((_, index) => `$${index + 1}`).join(",");

        const query = `SELECT * FROM players WHERE player_id IN (${placeholders})`;
        const result = await pool.query(query, ids);

        return result.rows; // 只回傳資料
    } catch (error) {
        console.error("Error fetching players by IDs:", error);
        throw new Error("Database query failed");
    }
};


// 匯出函式
module.exports = {
    getPlayerByTeamUserName,
    addPlayer,
    getPlayersByIds
};