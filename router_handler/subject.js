const db = require("../db/index");
const jwt = require("../jwt/index");

exports.page = async (req, res) => {
    try {
        const requestParams = req.query;
        let pageIndex = requestParams.pageIndex
        let pageCount = (requestParams.pageIndex - 1) * requestParams.pageCount
        const user = await jwt.decode(req)
        let count;
        let result;
        if (requestParams.searchName) {
            const sql1 = "select count(*) from t_subject where name like $1";
            const countResponse = await db.query(sql1, ["%" + requestParams.searchName + "%"])
            count = countResponse.rows[0].count
            const sql2 = "select * from t_subject where name like $1 order by id desc limit $2 offset $3";
            const response = await db.query(sql2, ["%" + requestParams.searchName + "%", pageIndex, pageCount]);
            result = response.rows;
        } else {
            const sql1 = "select count(*) from t_subject";
            const countResponse = await db.query(sql1)
            count = countResponse.rows[0].count
            const sql2 = "select * from t_subject order by id desc limit $1 offset $2";
            const response = await db.query(sql2, [pageIndex, pageCount]);
            result = response.rows;
        }
        res.json({
            status: 200,
            message: "登录成功",
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
        const sql2 = "select * from t_subject order by id desc";
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
        const subject = req.body
        console.log(subject)
        const user = await jwt.decode(req)
        const sql1 = "insert into t_subject (name) values ($1) RETURNING id";
        const response = await db.query(sql1, [subject.name]);
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
        const subject = req.body
        console.log(subject)
        const sql = "update t_subject set name = $1 where id = $2";
        const response = await db.query(sql, [subject.name, subject.id]);
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
        const sql = "delete from t_subject where id =$1";
        await db.query(sql, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};