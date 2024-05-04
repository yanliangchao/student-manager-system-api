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
            const sql1 = `select count(*) from t_student_details tsdd
                            left join t_student tsd on tsdd.sid = tsd.id
                            left join t_school tsc on tsd.sid = tsc.id
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tsdd.describes like $2 or tsd.name like $2 or tsc.school_name like $2)`;
            const countResponse = await db.query(sql1, [user.id, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select tsdd.id, tsdd.times, tsdd.describes, tsd.id sid, tsd.name, tsc.id tsc_id, tsc.school_name from t_student_details tsdd
                            left join t_student tsd on tsdd.sid = tsd.id
                            left join t_school tsc on tsd.sid = tsc.id
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tsdd.describes like $2 or tsd.name like $2 or tsc.school_name like $2) order by tsdd.times desc limit $3 offset $4`;
            const response = await db.query(sql2, [user.id, "%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = `select count(*) from t_student_details tsdd
                            left join t_student tsd on tsdd.sid = tsd.id
                            left join t_school tsc on tsd.sid = tsc.id
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1`;
            const countResponse = await db.query(sql1, [user.id])
            count = countResponse.rows[0].count
            const sql2 = `select tsdd.id, tsdd.times, tsdd.describes, tsd.id sid, tsd.name, tsc.id tsc_id, tsc.school_name from t_student_details tsdd
                            left join t_student tsd on tsdd.sid = tsd.id
                            left join t_school tsc on tsd.sid = tsc.id
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 order by tsdd.times desc limit $2 offset $3`;
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
        const sid = req.params.sid
        let result;
        const sql2 = "select * from t_student_details tsd where tsd.sid = $1 order by tsd.times desc";
        const response = await db.query(sql2, [sid]);
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
        const details = req.body
        console.log(details)
        const sql1 = "insert into t_student_details (times, describes, sid) values ($1, $2, $3) RETURNING id";
        const response = await db.query(sql1, [details.times, details.describes, details.sid]);
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
        const details = req.body
        console.log(details)
        const sql = "update t_student_details set times = $1, describes = $2, sid=$3 where id = $4";
        await db.query(sql, [details.times, details.describes, details.sid, details.id]);
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
        const sql = "delete from t_student_details where id =$1";
        await db.query(sql, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};