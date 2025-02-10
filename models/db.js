const { Pool } = require('pg');

// 設定 PostgreSQL 連線資訊
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sptmdb',
  password: 'wskonoha',
  port: 5432, // PostgreSQL 預設 port
});

// 匯出 pool 讓其他檔案使用
module.exports = pool;
