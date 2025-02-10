const bcrypt = require('bcrypt');

async function generatePasswordHash(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

generatePasswordHash('wskonoha').then(hash => {
  console.log(hash); // 輸出哈希密碼，複製到 SQL 查詢中
});
