const pool = require('./db'); // 引入資料庫連線

// 查詢不同類別的統計數據
const getStatsByCategory = async (category) => {
    const query = `
        SELECT  
    stats.player_id,  
    SUM(stats.success) AS success_count,  
    SUM(stats.effective) AS effective_count,  
    SUM(stats.ineffective) AS ineffective_count,  
    SUM(stats.error) AS error_count,  
    SUM(stats.success) + SUM(stats.effective) + SUM(stats.ineffective) + SUM(stats.error) AS total_count,  
    COALESCE(  
        ROUND(  
            (SUM(stats.success) * 1 +  
             SUM(stats.effective) * 0.75 +  
             SUM(stats.ineffective) * 0.25 +  
             SUM(stats.error) * 0)  
            /  
            NULLIF(  
                (SUM(stats.success) + SUM(stats.effective) + SUM(stats.ineffective) + SUM(stats.error)),  
                0  
            ),  
            2  
        ),  
        0  
    ) AS efficiency,  
    -- 計算該球員參加過的比賽數量
    COALESCE(  
        (SELECT COUNT(DISTINCT m.match_id)  
         FROM matches m  
         WHERE EXISTS (  
             SELECT 1 FROM attack_stats WHERE player_id = stats.player_id AND match_id = m.match_id  
             UNION  
             SELECT 1 FROM defense_stats WHERE player_id = stats.player_id AND match_id = m.match_id  
             UNION  
             SELECT 1 FROM receive_stats WHERE player_id = stats.player_id AND match_id = m.match_id  
             UNION  
             SELECT 1 FROM serve_stats WHERE player_id = stats.player_id AND match_id = m.match_id  
             UNION  
             SELECT 1 FROM set_stats WHERE player_id = stats.player_id AND match_id = m.match_id  
             UNION  
             SELECT 1 FROM block_stats WHERE player_id = stats.player_id AND match_id = m.match_id  
         )  
        ),  
        0  
    ) AS match_count  
FROM ${category}_stats stats  
LEFT JOIN players prs ON prs.player_id = stats.player_id  
GROUP BY stats.player_id;

    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching ${category} stats:`, error);
        throw error;
    }
};

async function insertPlayerStats(stat) {
    const query = `
        INSERT INTO point (player_id, attack_point, defense_point, receive_point, set_point, block_point, serve_point, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
        ;
    `;

    const values = [
        stat.player_id,
        parseFloat(stat.attack_point),  // 將字串轉換為浮點數
        parseFloat(stat.defense_point), // 將字串轉換為浮點數
        parseFloat(stat.receive_point), // 將字串轉換為浮點數
        parseFloat(stat.set_point),     // 將字串轉換為浮點數
        parseFloat(stat.block_point),   // 將字串轉換為浮點數
        parseFloat(stat.serve_point)    // 將字串轉換為浮點數
    ];

    try {
        // 執行插入查詢
        await pool.query(query, values);
        console.log(`Player ${stat.player_id} stats inserted successfully`);
    } catch (err) {
        console.error(`Error inserting player ${stat.player_id} stats:`, err);
        throw err;  // 若有錯誤，繼續拋出
    }
}

async function updatePlayerStatus(playerId) {
    const query = `UPDATE point SET status = 0 WHERE player_id = $1`;
    try {
        const result = await pool.query(query, [playerId]);
        return result.rowCount; // 返回影響的行數
    } catch (error) {
        console.error(`Error updating player ${playerId} status:`, error);
        throw error;
    }
};

async function getActivePlayerStats(playerId) {
    const query = `SELECT * FROM point WHERE player_id = $1 AND status = 1`;
    try {
        const result = await pool.query(query, [playerId]);
        return result.rows; // 回傳查詢結果
    } catch (error) {
        console.error(`Error fetching stats for player ${playerId}:`, error);
        throw error;
    }
}

//用隊伍名稱去搜尋得分
async function getTeamActivePlayerStats(teamUserName) {
    const query = `
        SELECT * FROM point pt
        LEFT JOIN players pls ON pls.player_id = pt.player_id 
        WHERE pt.status = 1 AND pls.team_user_name = $1
    `;
    try {
        const result = await pool.query(query, [teamUserName]);
        return result.rows; // 回傳符合條件的資料
    } catch (error) {
        console.error(`Error fetching active player stats for team ${teamUserName}:`, error);
        throw error;
    }
}

//用球員id去搜尋得分
async function getPointsbyPlayerId(id) {
    const query = `
        SELECT * FROM point pt
        LEFT JOIN players pls ON pls.player_id = pt.player_id 
        WHERE pt.status = 1 AND pls.player_id=$1
    `;
    try {
        const result = await pool.query(query, [id]);
        return result.rows; // 回傳符合條件的資料
    } catch (error) {
        console.error(`Error fetching active player stats for player ${id}:`, error);
        throw error;
    }
}

module.exports = {
    getAttackStats: () => getStatsByCategory('attack'),
    getDefenseStats: () => getStatsByCategory('defense'),
    getReceiveStats: () => getStatsByCategory('receive'),
    getSetStats: () => getStatsByCategory('set'),
    getBlockStats: () => getStatsByCategory('block'),
    getServeStats: () => getStatsByCategory('serve'),
    insertPlayerStats,
    updatePlayerStatus,
    getActivePlayerStats,
    getTeamActivePlayerStats,
    getPointsbyPlayerId
};

