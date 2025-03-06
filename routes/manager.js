var express = require('express');
var router = express.Router();
const playersModel = require('../models/playersModel');

router.get('/', async function (req, res, next) {
  try {
    if (!req.session.user) {
      return res.redirect('/users'); // 如果沒有登入，跳轉到登入頁
    }

    const teamUserName = req.session.user.user_name; // 從 session 取得隊伍名稱
    const result = await playersModel.getPlayerByTeamUserName(teamUserName);

    res.render('manager', {
      title: '隊伍管理',
      players: result.rows, // 將資料庫撈出的球員資料傳遞到 EJS
      isManager: req.session.user.isManager
    });
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).send("Server Error");
  }
});

router.post('/addPlayer', async (req, res) => {
  try {
    const { player_name, role, number } = req.body;
    const team_user_name = req.session.user.user_name; // 從 session 取得隊伍名稱

    if (!player_name || !role || !number) {
      return res.status(400).json({ error: '缺少必要資訊' });
    }

    const newPlayer = await playersModel.addPlayer(player_name, role, number, team_user_name);
    res.status(201).json({ message: '球員新增成功', player: newPlayer });
  } catch (err) {
    console.error("Error in /addPlayer:", err);
    res.status(500).json({ error: '新增球員失敗' });
  }
});

router.get('/players/list', async (req, res) => {
  try {
    const team_user_name = req.session.user.user_name;
    const result = await playersModel.getPlayerByTeamUserName(team_user_name);
    res.json({
      players: result.rows
    }); // 這裡才取 `rows`
    

  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).json({ error: "無法獲取球員列表" });
  }
});


module.exports = router;
