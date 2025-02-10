// routes/user.js
var express = require('express');
const bcrypt = require('bcrypt');
var router = express.Router();
const userModel = require('../models/userModel'); // 引入 userModel

// 渲染登入頁面
router.get('/', (req, res) => {
  res.render('users'); // 會渲染 `views/users.ejs`
});

router.post('/getUser', async function (req, res, next) {
  try {
    const { user_name, password } = req.body; // 從請求的 body 中取得 user_name 和 password
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
    const storedPasswordHash = user.password_hash;
    const isMatch = await bcrypt.compare(password, storedPasswordHash);
    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(401).json({ error: 'Incorrect password' });
    }
    res.json({ message: 'Login successful', user_name });
  } catch (err) {
    console.error("Error in /getUser:", err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


module.exports = router;
