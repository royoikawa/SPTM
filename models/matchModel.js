const pool = require('./db'); // 引入資料庫連線

// 生成 match_id: 日期 (YYYYMMDD) + 隨機英文字母 (A-Z) + 局數
function generateMatchId(date, setNumber) {
    const randomLetter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const randomLetter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    return `${date.replace(/-/g, '')}${randomLetter1}${randomLetter2}${setNumber}`;
}

// 插入比賽資料
async function insertMatch(matchDate, opponent, setNumber, teamUserName) {
    const matchId = generateMatchId(matchDate, setNumber); // 產生 match_id
    const query = `
        INSERT INTO matches (match_id, match_date, opponent, set_number, team_user_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    try {
        const { rows } = await pool.query(query, [matchId, matchDate, opponent, setNumber, teamUserName]);
        return rows[0]; // 回傳插入的資料
    } catch (error) {
        console.error("Error inserting match:", error);
        throw error;
    }
}


async function insertStats(tableName, playerId, matchId, success, effective, ineffective, errorCount) {
    const query = `
        INSERT INTO ${tableName} (player_id, match_id, success, effective, ineffective, error)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    try {
        const { rows } = await pool.query(query, [playerId, matchId, success, effective, ineffective, errorCount]);
        return rows[0]; // 回傳插入的數據
    } catch (error) {
        console.error(`Error inserting into ${tableName}:`, error);
        throw error;
    }
}

// 各類數據的插入函式

async function insertAttackStats(playerId, matchId, success, effective, ineffective, errorCount) {
    return insertStats("attack_stats", playerId, matchId, success, effective, ineffective, errorCount);
}
async function insertServeStats(playerId, matchId, success, effective, ineffective, errorCount) {
    return insertStats("serve_stats", playerId, matchId, success, effective, ineffective, errorCount);
}

async function insertReceiveStats(playerId, matchId, success, effective, ineffective, errorCount) {
    return insertStats("receive_stats", playerId, matchId, success, effective, ineffective, errorCount);
}

async function insertSetStats(playerId, matchId, success, effective, ineffective, errorCount) {
    return insertStats("set_stats", playerId, matchId, success, effective, ineffective, errorCount);
}

async function insertBlockStats(playerId, matchId, success, effective, ineffective, errorCount) {
    return insertStats("block_stats", playerId, matchId, success, effective, ineffective, errorCount);
}

async function insertDefenseStats(playerId, matchId, success, effective, ineffective, errorCount) {
    return insertStats("defense_stats", playerId, matchId, success, effective, ineffective, errorCount);
}

async function getMatchStats(matchId) {
    const query = `
    SELECT 
    m.match_id, 
    m.match_date, 
    m.opponent, 
    m.set_number, 
    p.player_id, 
    p.player_name,
    COALESCE(a.success, 0) AS attack_success,
    COALESCE(a.effective, 0) AS attack_effective,
    COALESCE(a.ineffective, 0) AS attack_ineffective,
    COALESCE(a.error, 0) AS attack_error,
    COALESCE(d.success, 0) AS defense_success,
    COALESCE(d.effective, 0) AS defense_effective,
    COALESCE(d.ineffective, 0) AS defense_ineffective,
    COALESCE(d.error, 0) AS defense_error,
    COALESCE(r.success, 0) AS receive_success,
    COALESCE(r.effective, 0) AS receive_effective,
    COALESCE(r.ineffective, 0) AS receive_ineffective,
    COALESCE(r.error, 0) AS receive_error,
    COALESCE(s.success, 0) AS serve_success,
    COALESCE(s.effective, 0) AS serve_effective,
    COALESCE(s.ineffective, 0) AS serve_ineffective,
    COALESCE(s.error, 0) AS serve_error,
    COALESCE(set_s.success, 0) AS set_success,
    COALESCE(set_s.effective, 0) AS set_effective,
    COALESCE(set_s.ineffective, 0) AS set_ineffective,
    COALESCE(set_s.error, 0) AS set_error,
    COALESCE(b.success, 0) AS block_success,
    COALESCE(b.effective, 0) AS block_effective,
    COALESCE(b.ineffective, 0) AS block_ineffective,
    COALESCE(b.error, 0) AS block_error
FROM matches m
JOIN players p ON p.player_id IN (
    SELECT player_id FROM attack_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM defense_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM receive_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM serve_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM set_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM block_stats WHERE match_id = m.match_id
)
LEFT JOIN attack_stats a ON m.match_id = a.match_id AND p.player_id = a.player_id
LEFT JOIN defense_stats d ON m.match_id = d.match_id AND p.player_id = d.player_id
LEFT JOIN receive_stats r ON m.match_id = r.match_id AND p.player_id = r.player_id
LEFT JOIN serve_stats s ON m.match_id = s.match_id AND p.player_id = s.player_id
LEFT JOIN set_stats set_s ON m.match_id = set_s.match_id AND p.player_id = set_s.player_id
LEFT JOIN block_stats b ON m.match_id = b.match_id AND p.player_id = b.player_id
WHERE m.match_id = $1;
    `;

    try {
        const { rows } = await pool.query(query, [matchId]);
        return rows; // 回傳比賽數據陣列
    } catch (error) {
        console.error("Error fetching match stats:", error);
        throw error;
    }
}

async function getMatchesByTeam(teamUserName) {
    const query = `SELECT * FROM matches WHERE team_user_name = $1 ORDER BY match_date DESC;`;

    try {
        const { rows } = await pool.query(query, [teamUserName]);
        return rows; // 回傳查詢結果
    } catch (error) {
        console.error("Error fetching matches for team:", error);
        throw error;
    }
}

//計算球員一共打過幾局比賽
async function getMatchCount(player_id) {
    const query = `
    SELECT 
    count(m.match_id)
FROM matches m
JOIN players p ON p.player_id IN (
    SELECT player_id FROM attack_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM defense_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM receive_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM serve_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM set_stats WHERE match_id = m.match_id
    UNION
    SELECT player_id FROM block_stats WHERE match_id = m.match_id
)
LEFT JOIN attack_stats a ON m.match_id = a.match_id AND p.player_id = a.player_id
LEFT JOIN defense_stats d ON m.match_id = d.match_id AND p.player_id = d.player_id
LEFT JOIN receive_stats r ON m.match_id = r.match_id AND p.player_id = r.player_id
LEFT JOIN serve_stats s ON m.match_id = s.match_id AND p.player_id = s.player_id
LEFT JOIN set_stats set_s ON m.match_id = set_s.match_id AND p.player_id = set_s.player_id
LEFT JOIN block_stats b ON m.match_id = b.match_id AND p.player_id = b.player_id
WHERE p.player_id = $1;
    `;

    try {
        const { rows } = await pool.query(query, [player_id]);
        return rows; // 回傳場次數量
    } catch (error) {
        console.error("Error getting match count:", error);
        throw error;
    }
}


module.exports = {
    insertMatch,
    insertAttackStats,
    insertServeStats,
    insertReceiveStats,
    insertSetStats,
    insertBlockStats,
    insertDefenseStats,
    getMatchStats,
    getMatchesByTeam,
    getMatchCount
};
