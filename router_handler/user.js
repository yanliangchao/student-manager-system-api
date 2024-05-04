const db = require("../db/index");
const jwt = require("../jwt/index");

exports.page = async (req, res) => {
  try {
    const requestParams = req.query;
    let pageIndex = (requestParams.pageNum - 1) * requestParams.pageSize
    let pageCount = requestParams.pageSize
    let count;
    let result;
    if (requestParams.search) {
      let sql1 = `select count(*) from t_user tu where tu.id != 1 and tu.username like $1`;
      const countResponse = await db.query(sql1, ["%" + requestParams.search + "%"])
      count = countResponse.rows[0].count
      let sql2 = `select tu.id, tu.username from t_user tu where tu.id != 1 and tu.username like $1 order by tu.id desc limit $2 offset $3`;
      const response = await db.query(sql2, ["%" + requestParams.search + "%", pageCount, pageIndex]);
      result = response.rows;

    } else {
      let sql1 = `select count(*) from t_user tu where tu.id != 1`;
      const countResponse = await db.query(sql1)
      count = countResponse.rows[0].count
      let sql2 = `select tu.id, tu.username from t_user tu where tu.id != 1 order by tu.id desc limit $1 offset $2`;
      const response = await db.query(sql2, [pageCount, pageIndex]);
      result = response.rows;
    }

    for (const user of result) {
      let sql3 = `select tus.sid from t_user_school tus where tus.uid = $1`;
      const response = await db.query(sql3, [user.id]);
      user.sids = response.rows;
    }

    res.json({
      status: 200,
      message: "查询成功",
      count: count,
      data: result,
    });
  } catch (err) {
    res.status(400).json(err);
  }


};

exports.list = (req, res) => {
  const requestParams = req.body;
  const sql = "select * from t_user limit 10 offset 10";
  db.query(sql, (err, results) => {
    if (err) return res.status(400).json(err);
    res.json({
      status: 200,
      results,
    });
  });
};

exports.add = async (req, res) => {
  try{
    const user = req.body;
    const sql1 = "insert into t_user (username, password, role) values ($1, $2, 'user') RETURNING id";
    const response = await db.query(sql1, [user.username, user.password]);
    const sid = response.rows[0].id
    res.json({
        status: 200,
        message: "新增成功",
        data: sid
    });
  } catch (err) {
      res.status(400).json(err);
  }
};

exports.mod = async (req, res) => {
  try{
    const user = req.body;
    console.log(user)
    if(user.password) {
      const sql1 = "update t_user set username = $1, password = $2 where id = $3";
      await db.query(sql1, [user.username, user.password, user.id]);
    } else {
      const sql1 = "update t_user set username = $1 where id = $2";
      await db.query(sql1, [user.username, user.id]);
    }
    res.json({
        status: 200,
        message: "修改成功"
    });
  } catch (err) {
      res.status(400).json(err);
  }
};

exports.modRole = async (req, res) => {
  try {
    const userSchool = req.body;
    // 删除中间表再加上中间表
    const sql1 = `delete from t_user_school tus where tus.uid = $1`
    await db.query(sql1, [userSchool.uid]);

    for (const sid of userSchool.sids) {
      const sql2 = `insert into t_user_school (uid, sid) values ($1, $2)`
      await db.query(sql2, [userSchool.uid, sid]);
    }
    res.json({
      status: 200,
      message: "修改成功",
    });
  } catch (err) {
    res.status(400).json(err);
  }

}

exports.del = async (req, res) => {
  try {
      const id = req.params.id
      const sql1 = "delete from t_user where id =$1";
      await db.query(sql1, [id]);
      const sql2 = "delete from t_user_school where uid =$1";
      await db.query(sql2, [id]);
      res.json({
          status: 200,
          message: "删除成功",
      });
  } catch (err) {
      res.status(400).json(err);
  }
};
