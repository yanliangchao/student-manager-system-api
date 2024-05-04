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
            const sql1 = `select count(*) from t_dormitory tdm
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tdm.building like $2 or tdm.name like $2)`;
            const countResponse = await db.query(sql1, [user.id, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select tdm.id, tdm.building, tdm.name, tsd.id mid, tsd.name manager_name, tsc.id sid, tsc.school_name from t_dormitory tdm
                            left join t_student tsd on tsd.id = tdm.mid
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tdm.building like $2 or tdm.name like $2)
                            order by id desc limit $3 offset $4`;
            const response = await db.query(sql2, [user.id, "%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = `select count(*) from t_dormitory tdm
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1`;
            const countResponse = await db.query(sql1, [user.id])
            count = countResponse.rows[0].count
            const sql2 = `select tdm.id, tdm.building, tdm.name, tsd.id mid, tsd.name manager_name, tsc.id sid, tsc.school_name from t_dormitory tdm
                            left join t_student tsd on tsd.id = tdm.mid
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 
                            order by id desc limit $2 offset $3`;
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
        const sql2 = `select tdm.id, tdm.building, tdm.name, tsc.id sid, tsc.school_name from t_dormitory tdm
                        left join t_school tsc on tdm.sid = tsc.id 
                        left join t_user_school tusc on tsc.id = tusc.sid 
                        where tusc.uid = $1`;
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
        const dormitory = req.body
        console.log(dormitory)
        const sql1 = "insert into t_dormitory (building, name, mid, sid) values ($1, $2, $3, $4) RETURNING id";
        const response = await db.query(sql1, [dormitory.building, dormitory.name, dormitory.mid, dormitory.sid]);
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
        const dormitory = req.body
        console.log(dormitory)
        const sql = "update t_dormitory set building = $1, name = $2, mid = $3, sid = $4 where id = $5";
        await db.query(sql, [dormitory.building, dormitory.name, dormitory.mid, dormitory.sid, dormitory.id]);
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
        const sql = "delete from t_dormitory where id = $1";
        await db.query(sql, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};