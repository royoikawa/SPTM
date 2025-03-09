const express = require('express');
const router = express.Router();
const pointModel = require('../models/pointModel');

// 獲取球員統計數據的函式
const fetchPlayerStats = async () => {
    try {
        const [
            attackStats,
            defenseStats,
            receiveStats,
            setStats,
            blockStats,
            serveStats
        ] = await Promise.all([
            pointModel.getAttackStats(),
            pointModel.getDefenseStats(),
            pointModel.getReceiveStats(),
            pointModel.getSetStats(),
            pointModel.getBlockStats(),
            pointModel.getServeStats()
        ]);

        const playerStatsMap = new Map();

        const mergeStats = (stats, key) => {
            stats.forEach(({ player_id, efficiency }) => {
                if (!playerStatsMap.has(player_id)) {
                    playerStatsMap.set(player_id, { player_id });
                }
                playerStatsMap.get(player_id)[key] = efficiency;
            });
        };

        mergeStats(attackStats, 'attack_point');
        mergeStats(defenseStats, 'defense_point');
        mergeStats(receiveStats, 'receive_point');
        mergeStats(setStats, 'set_point');
        mergeStats(blockStats, 'block_point');
        mergeStats(serveStats, 'serve_point');

        return Array.from(playerStatsMap.values()).map(player => ({
            player_id: player.player_id,
            attack_point: player.attack_point || 0,
            defense_point: player.defense_point || 0,
            receive_point: player.receive_point || 0,
            set_point: player.set_point || 0,
            block_point: player.block_point || 0,
            serve_point: player.serve_point || 0
        }));
    } catch (error) {
        console.error('Error fetching player stats:', error);
        throw error;
    }
};

// 取得球員統計數據 API
router.get('/player_stats', async (req, res) => {
    try {
        const playerStats = await fetchPlayerStats();
        res.json(playerStats);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 插入球員統計數據 API
router.get('/insert_points', async (req, res) => {
    try {
        const playerStats = await fetchPlayerStats();
        
        // 使用迴圈逐一插入每個球員的統計資料
        for (const stat of playerStats) {
            const existingStats = await pointModel.getActivePlayerStats(stat.player_id);

            if (existingStats.length > 0) {
                const existing = existingStats[0]; // 取得現有資料（假設只會有一筆符合 status = 1 的紀錄）
                
                // 比較現有資料與新的 stat 是否完全相同
                const isSame = (
                    parseFloat(existing.attack_point) === parseFloat(stat.attack_point) &&
                    parseFloat(existing.defense_point) === parseFloat(stat.defense_point) &&
                    parseFloat(existing.receive_point) === parseFloat(stat.receive_point) &&
                    parseFloat(existing.set_point) === parseFloat(stat.set_point) &&
                    parseFloat(existing.block_point) === parseFloat(stat.block_point) &&
                    parseFloat(existing.serve_point) === parseFloat(stat.serve_point)
                );

                if (isSame) {
                    console.log(`Skipping insert for player ${stat.player_id}, stats are identical.`);
                    continue; // 若數據相同，跳過插入
                }
            }
            await pointModel.updatePlayerStatus(stat.player_id);
            await pointModel.insertPlayerStats(stat);  // 每次傳遞一個 playerStat
        }

        res.json({ message: 'Points inserted successfully' });
    } catch (error) {
        console.error('Error inserting player points:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/team-stats', async (req, res) => {
    try {
        const teamUserName = req.session.user.user_name; // 假設隊伍名稱存在 session 中
        if (!teamUserName) {
            return res.status(400).json({ error: 'Team username is required' });
        }

        let teamStats = await pointModel.getTeamActivePlayerStats(teamUserName);

        // 依據 total_point 由大到小排序
        teamStats.sort((a, b) => parseFloat(b.total_point) - parseFloat(a.total_point));

        res.render('point', { teamStats }); // 直接渲染 point.ejs
    } catch (error) {
        console.error('Error fetching team stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
