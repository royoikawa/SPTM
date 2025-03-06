var express = require('express');
var router = express.Router();
const pointModel = require('../models/pointModel');

// 取得所有球員的統計數據
router.get('/player_stats', async (req, res) => {
    try {
        // 並行獲取所有類別的數據
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

        // 建立球員數據的映射
        const playerStatsMap = new Map();

        const mergeStats = (stats, key) => {
            stats.forEach(({ player_id, efficiency }) => {
                if (!playerStatsMap.has(player_id)) {
                    playerStatsMap.set(player_id, { player_id });
                }
                playerStatsMap.get(player_id)[key] = efficiency;
            });
        };

        // 合併各類型數據
        mergeStats(attackStats, 'attack_point');
        mergeStats(defenseStats, 'defense_point');
        mergeStats(receiveStats, 'receive_point');
        mergeStats(setStats, 'set_point');
        mergeStats(blockStats, 'block_point');
        mergeStats(serveStats, 'serve_point');

        // 轉換成所需的 JSON 格式
        const playerStats = Array.from(playerStatsMap.values()).map(player => ({
            player_id: player.player_id,
            attack_point: player.attack_point || 0,
            defense_point: player.defense_point || 0,
            receive_point: player.receive_point || 0,
            set_point: player.set_point || 0,
            block_point: player.block_point || 0,
            serve_point: player.serve_point || 0
        }));

        res.json(playerStats);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;