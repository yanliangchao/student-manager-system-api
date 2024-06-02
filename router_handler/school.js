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
            const sql1 = "select count(*) from t_school tsc where tsc.school_name like $1";
            const countResponse = await db.query(sql1, ["%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = "select * from t_school tsc where tsc.school_name like $1 order by tsc.id desc limit $2 offset $3";
            const response = await db.query(sql2, ["%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = "select count(*) from t_school tsc";
            const countResponse = await db.query(sql1)
            count = countResponse.rows[0].count
            const sql2 = "select tsc.* from t_school tsc limit $1 offset $2";
            const response = await db.query(sql2, [pageCount, pageIndex]);
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
        let result;
        const sql2 = "select * from t_school tsc order by tsc.id desc";
        const response = await db.query(sql2);
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
        const user = await jwt.decode(req)
        const sql1 = "insert into t_school (school_name) values ($1) RETURNING id";
        const response = await db.query(sql1, [school.school_name]);
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