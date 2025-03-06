// model/userModel.js
const pool = require('./db'); // 引入資料庫連線

// 查詢所有使用者
const getAllUsers = () => {
    return pool.query('SELECT * FROM users');
};

// 查詢特定使用者
const getUserByUserName = async (name) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE USER_NAME = $1', [name]);
        return result;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Database query failed"); // 拋出錯誤讓上層處理
    }
};

// 新增使用者
const addUser = (user_name, email, password_hash, team) => {
    return pool.query(
        'INSERT INTO users (USER_NAME, EMAIL, PASSWORD_HASH, TEAM) VALUES ($1, $2, $3, $4)',
        [user_name, email, password_hash, team]
    );
};

// 取得不包含 "MB" 的隊伍名稱
const getTeams = async () => {
    try {
        const query = "SELECT user_name FROM users WHERE user_name NOT LIKE '%MB'";
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error fetching teams:", error);
        throw error;
    }
};


// 匯出函式
module.exports = {
    getAllUsers,
    getUserByUserName,
    addUser,
    getTeams
};
