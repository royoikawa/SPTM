var express = require('express');
var router = express.Router();
const playersModel = require('../models/playersModel');
const matchModel = require("../models/matchModel");

// 渲染 matchHistory.ejs 頁面，並傳遞比賽歷史資料
router.get("/", async (req, res) => {
    try {
        const teamUserName = req.session.user.user_name; // 從 session 取得隊伍名稱
        if (!teamUserName) {
            return res.status(401).json({ message: "未授權，請先登入" });
        }

        const matches = await matchModel.getMatchesByTeam(teamUserName); // 獲取比賽歷史資料
        res.render("matchHistory", { matches }); // 將 matches 資料傳遞給 matchHistory.ejs
    } catch (error) {
        console.error("渲染頁面時發生錯誤:", error);
        res.status(500).send("發生錯誤");
    }
});

// 獲取比賽歷史資料，返回 JSON
router.get("/getMatches", async (req, res) => {
    try {
        const teamUserName = req.session.user.user_name; // 從 session 取得隊伍名稱
        if (!teamUserName) {
            return res.status(401).json({ message: "未授權，請先登入" });
        }

        const matches = await matchModel.getMatchesByTeam(teamUserName);
        res.status(200).json(matches); // 返回比賽歷史資料
    } catch (error) {
        console.error("查詢比賽歷史時發生錯誤:", error);
        res.status(500).json({ message: "查詢比賽歷史時發生錯誤", error });
    }
});

// 獲取比賽統計資料，返回 JSON
router.get("/getMatchStats/:matchId", async (req, res) => {
    try {
        const matchId = req.params.matchId; // 從 URL 參數獲取 matchId

        if (!matchId) {
            return res.status(400).json({ message: "缺少 matchId 參數" });
        }

        const matchStats = await matchModel.getMatchStats(matchId);

        res.status(200).json(matchStats);
    } catch (error) {
        console.error("Error fetching match stats:", error);
        res.status(500).json({ message: "獲取比賽統計資料時發生錯誤", error });
    }
});

module.exports = router;
