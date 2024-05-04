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
        if (requestParams.search) {
            const sql1 = "select count(*) from t_school tsc left join t_user_school tusc on tsc.id = tusc.sid where tusc.uid = $1 and tsc.school_name like $2";
            const countResponse = await db.query(sql1, [user.id, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = "select * from t_school tsc left join t_user_school tusc on tsc.id = tusc.sid where tusc.uid = $1 and tsc.school_name like $2 order by tsc.id desc limit $3 offset $4";
            const response = await db.query(sql2, [user.id, "%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = "select count(*) from t_school tsc left join t_user_school tusc on tsc.id = tusc.sid where tusc.uid = $1";
            const countResponse = await db.query(sql1, [user.id])
            count = countResponse.rows[0].count
            const sql2 = "select * from t_school tsc left join t_user_school tusc on tsc.id = tusc.sid where tusc.uid = $1 order by tsc.id desc limit $2 offset $3";
            const response = await db.query(sql2, [user.id, pageCount, pageIndex]);
            result = response.rows;
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

exports.list = async (req, res) => {
    try {
        const user = await jwt.decode(req)
        let result;
        const sql2 = "select * from t_school tsc left join t_user_school tusc on tsc.id = tusc.sid where tusc.uid = $1 order by tsc.id desc";
        const response = await db.query(sql2, [user.id]);
        result = response.rows;
        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.add = async (req, res) => {
    try {
        const school = req.body
        console.log(school)
        const user = await jwt.decode(req)
        const sql1 = "insert into t_school (school_name) values ($1) RETURNING id";
        const response = await db.query(sql1, [school.school_name]);
        const sid = response.rows[0].id
        const sql2 = "insert into t_user_school (uid, sid) values ($1, $2)";
        if(user.id != 1) {
            await db.query(sql2, [1, sid]);
        } 
        await db.query(sql2, [user.id, sid]);
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
    try {
        const school = req.body
        console.log(school)
        const sql = "update t_school set school_name = $1 where id = $2";
        const response = await db.query(sql, [school.school_name, school.id]);
        console.log(response)

        res.json({
            status: 200,
            message: "修改成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.del = async (req, res) => {
    try {
        const id = req.params.id
        const sql = "delete from t_school where id =$1";
        await db.query(sql, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};