// routes/user.js
var express = require('express');
const bcrypt = require('bcrypt');
var router = express.Router();
const userModel = require('../models/userModel'); // 引入 userModel

// 渲染登入頁面
router.get('/', (req, res) => {
  res.render('users'); // 會渲染 `views/users.ejs`
});

// 登入 API
router.post('/getUser', async function (req, res, next) {
  try {
    const { user_name, password } = req.body;
    if (!user_name || !password) {
      return res.status(400).json({ error: 'user_name and password are required' });
    }

    console.log("Received login request for user:", user_name);

    // 查詢使用者
    const result = await userModel.getUserByUserName(user_name);
    if (result.rows.length === 0) {
      console.log("User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(401).json({ error: 'Incorrect password' });
    }
    var user_slice_name = user.user_name;
    // 登入成功，儲存使用者資訊到 session
    // 判斷登入者權限
    if (user_slice_name.substring(user_slice_name.length - 2) === "MB") {
      req.session.user = {
        user_name: user.user_name.slice(0, -2), //把MB去掉存session，後面才能正常抓隊伍相關資料
        team: user.team,
        email: user.email,
        isManager: "N"
      };
    } else {
      req.session.user = {
        user_name: user.user_name,
        team: user.team,
        email: user.email,
        isManager: "Y"
      };
    }



    console.log("Login successful, session stored:", req.session.user);
    res.json({ message: 'Login successful', user: req.session.user });

  } catch (err) {
    console.error("Error in /getUser:", err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 登出 API
router.get('/logout', function (req, res) {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log("Logout successful");
    res.render('index');
  });
});

module.exports = router;
