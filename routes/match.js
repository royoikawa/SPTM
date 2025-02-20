var express = require('express');
var router = express.Router();
const playersModel = require('../models/playersModel');
const matchModel = require("../models/matchModel");

router.post('/start', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/users'); // 如果沒有登入，跳轉到登入頁
        }

        const playerIds = req.body.players;
        if (!playerIds || playerIds.length === 0) {
            return res.status(400).json({ message: "請選擇至少一名球員！" });
        }

        // 取得球員資料
        const players = await playersModel.getPlayersByIds(playerIds);
        console.log("選擇的球員資料:", players);

        // 存入 session（避免 URL 帶參數）
        req.session.matchPlayers = players; // 🔥 存入 session

        // 直接重導到 `GET /match`
        res.redirect('/match'); 

    } catch (err) {
        console.error("Error enter match:", err);
        res.status(500).send("Server Error");
    }
});

// 🔥 新增 GET `/match`，用來渲染比賽畫面
router.get('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/users');
        }

        const players = req.session.matchPlayers || []; // 🔥 讀取 session

        res.render('match', { players });

    } catch (err) {
        console.error("Error loading match page:", err);
        res.status(500).send("Server Error");
    }
});

router.post("/save", async (req, res) => {
    try {
        const { date, opponent, set, stats } = req.body;
        const teamUserName = req.session.user.user_name; // 取得 session 中的 user_name

        // 1. 先插入比賽資訊，取得 match_id
        const match = await matchModel.insertMatch(date, opponent, set, teamUserName);
        const matchId = match.match_id; // 獲取新創建的 match_id

        // 2. 遍歷 stats 陣列，依照 skill 類型存入不同的 stats 表
        for (const playerData of stats) {
            const { playerId, stats: playerStats } = playerData;

            await matchModel.insertAttackStats(playerId, matchId, 
                playerStats.attack.success, 
                playerStats.attack.effective, 
                playerStats.attack.ineffective, 
                playerStats.attack.error
            );

            await matchModel.insertReceiveStats(playerId, matchId, 
                playerStats.receive.success, 
                playerStats.receive.effective, 
                playerStats.receive.ineffective, 
                playerStats.receive.error
            );

            await matchModel.insertServeStats(playerId, matchId, 
                playerStats.serve.success, 
                playerStats.serve.effective, 
                playerStats.serve.ineffective, 
                playerStats.serve.error
            );

            await matchModel.insertDefenseStats(playerId, matchId, 
                playerStats.defense.success, 
                playerStats.defense.effective, 
                playerStats.defense.ineffective, 
                playerStats.defense.error
            );

            await matchModel.insertBlockStats(playerId, matchId, 
                playerStats.block.success, 
                playerStats.block.effective, 
                playerStats.block.ineffective, 
                playerStats.block.error
            );

            await matchModel.insertSetStats(playerId, matchId, 
                playerStats.set.success, 
                playerStats.set.effective, 
                playerStats.set.ineffective, 
                playerStats.set.error
            );
        }

        res.status(200).json({ message: "比賽數據儲存成功", matchId });

    } catch (error) {
        console.error("Error saving match data:", error);
        res.status(500).json({ message: "儲存比賽數據時發生錯誤", error });
    }
});

module.exports = router;