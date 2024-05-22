const db = require("../db/index");
const jwt = require("../jwt/index");

exports.page = async (req, res) => {
  try {
    const requestParams = req.query;
    let pageIndex = (requestParams.pageNum - 1) * requestParams.pageSize
    let pageCount = requestParams.pageSize
    const user = await jwt.decode(req)
    let count;
    let result;
    if(user.role === 'manager') {
      if (requestParams.search) {
        let sql1 = `select count(*) from t_user tu where tu.sid = $1 and tu.role = 'user' and tu.username like $2`;
        const countResponse = await db.query(sql1, [user.sid, "%" + requestParams.search + "%"])
        count = countResponse.rows[0].count
        let sql2 = `select tu.id, tu.username, tu.role, tsc.id sid, tsc.school_name from t_user tu left join t_school tsc on tu.sid = tsc.id where tu.sid = $1 and tu.role = 'user' and tu.username like $2 order by tu.id desc limit $3 offset $4`;
        const response = await db.query(sql2, [user.sid, "%" + requestParams.search + "%", pageCount, pageIndex]);
        result = response.rows;
      } else {
        let sql1 = `select count(*) from t_user tu where tu.sid = $1 and tu.role = 'user'`;
        const countResponse = await db.query(sql1, [user.sid])
        count = countResponse.rows[0].count
        let sql2 = `select tu.id, tu.username, tu.role, tsc.id sid, tsc.school_name from t_user tu left join t_school tsc on tu.sid = tsc.id where tu.sid = $1 and tu.role = 'user' order by tu.id desc limit $2 offset $3`;
        const response = await db.query(sql2, [user.sid, pageCount, pageIndex]);
        result = response.rows;
      }
    } else {
      if (requestParams.search) {
        let sql1 = `select count(*) from t_user tu where tu.id != 1 and tu.username like $1`;
        const countResponse = await db.query(sql1, ["%" + requestParams.search + "%"])
        count = countResponse.rows[0].count
        let sql2 = `select tu.id, tu.username, tu.role, tsc.id sid, tsc.school_name from t_user tu left join t_school tsc on tu.sid = tsc.id where tu.id != 1 and tu.username like $1 order by tu.id desc limit $2 offset $3`;
        const response = await db.query(sql2, ["%" + requestParams.search + "%", pageCount, pageIndex]);
        result = response.rows;
  
      } else {
        let sql1 = `select count(*) from t_user tu where tu.id != 1`;
        const countResponse = await db.query(sql1)
        count = countResponse.rows[0].count
        let sql2 = `select tu.id, tu.username, tu.role, tsc.id sid, tsc.school_name from t_user tu left join t_school tsc on tu.sid = tsc.id where tu.id != 1 order by tu.id desc limit $1 offset $2`;
        const response = await db.query(sql2, [pageCount, pageIndex]);
        result = response.rows;
      }
    }
    

    for (const user of result) {
      let sql3 = `select tus.did from t_user_dormitory tus where tus.uid = $1`;
      const response = await db.query(sql3, [user.id]);
      user.dids = response.rows;
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
  
};

exports.findByUsername = async (req, res) => {
  try{
    const username = req.params.username
    const sql = "select * from t_user where username = $1";
    const response = await db.query(sql, [username]);
    const user = response.rows[0]
    res.json({
      status: 200,
      message: "查询成功",
      data: user
  });
  } catch (err) {
    res.status(400).json(err);
}
}

exports.add = async (req, res) => {
  try{
    const user = req.body;
    const sql1 = "insert into t_user (username, password, sid, role) values ($1, $2, $3, $4) RETURNING id";
    const response = await db.query(sql1, [user.username, user.password, user.sid, user.role]);
    const uid = response.rows[0].id

    // 如果是主管，则学校全部宿舍权限都加入
    if(user.role === 'manager') {
      const sql2 = "select id from t_dormitory tdm where tdm.sid = $1";
      const response = await db.query(sql2, [user.sid]);
      const dids = response.rows

      // 删除中间表再加上中间表
      const sql1 = `delete from t_user_dormitory tus where tus.uid = $1`
      await db.query(sql1, [uid]);

      for (const did of dids) {
        const sql3 = `insert into t_user_dormitory (uid, did) values ($1, $2)`
        await db.query(sql3, [uid, did.id]);
      }

    }

    res.json({
        status: 200,
        message: "新增成功",
        data: uid
    });
  } catch (err) {
      res.status(400).json(err);
  }
};

exports.mod = async (req, res) => {
  try{
    const user = req.body;
    if(user.password) {
      const sql1 = "update t_user set username = $1, password = $2, sid = $3, role = $4 where id = $5";
      await db.query(sql1, [user.username, user.password, user.sid, user.role, user.id]);
    } else {
      const sql1 = "update t_user set username = $1, sid = $2, role = $3 where id = $4";
      await db.query(sql1, [user.username, user.sid, user.role, user.id]);
    }
    // 如果是主管，则学校全部宿舍权限都加入
    if(user.role === 'manager') {
      const sql2 = "select id from t_dormitory tdm where tdm.sid = $1";
      const response = await db.query(sql2, [user.sid]);
      const dids = response.rows

      // 删除中间表再加上中间表
      const sql1 = `delete from t_user_dormitory tus where tus.uid = $1`
      await db.query(sql1, [user.id]);

      for (const did of dids) {
        const sql3 = `insert into t_user_dormitory (uid, did) values ($1, $2)`
        await db.query(sql3, [user.id, did.id]);
      }

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
    const userDormitory = req.body;
    // 删除中间表再加上中间表
    const sql1 = `delete from t_user_dormitory tus where tus.uid = $1`
    await db.query(sql1, [userDormitory.uid]);
    
    for (const did of userDormitory.dids) {
      const sql2 = `insert into t_user_dormitory (uid, did) values ($1, $2)`
      await db.query(sql2, [userDormitory.uid, did]);
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
      const sql2 = "delete from t_user_dormitory where uid =$1";
      await db.query(sql2, [id]);
      res.json({
          status: 200,
          message: "删除成功",
      });
  } catch (err) {
      res.status(400).json(err);
  }
};
