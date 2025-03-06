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
            ) AS efficiency
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

module.exports = {
    getAttackStats: () => getStatsByCategory('attack'),
    getDefenseStats: () => getStatsByCategory('defense'),
    getReceiveStats: () => getStatsByCategory('receive'),
    getSetStats: () => getStatsByCategory('set'),
    getBlockStats: () => getStatsByCategory('block'),
    getServeStats: () => getStatsByCategory('serve')
};
