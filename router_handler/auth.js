const db = require("../db/index");
const jwt = require("../jwt/index");

// 登录
exports.login = async (req, res) => {
    const user = req.body;
    const sql = "select * from t_user where username = $1";
    try {
      const response = await db.query(sql, [user.username]);
      //console.log(response.rows)
      const results = response.rows
      if (results.length !== 1) return res.status(400).json("用户不存在");
      if (results[0].password != user.password) return res.status(400).json("用户名或密码错误，请重新输入");
  
      const user_info = {
        id: results[0].id,
        username: results[0].username,
        password: results[0].password,
        role: results[0].role
      };
      const tokenStr = jwt.sign(user_info);
      res.json({
        status: 200,
        message: "登录成功",
        token: "Bearer " + tokenStr,
      });
    } catch(err) {
      res.status(400).json(err);
    }
    
  };