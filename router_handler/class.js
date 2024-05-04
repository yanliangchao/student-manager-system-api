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
            const sql1 = `select count(*) from t_class tcs 
                            left join t_teacher ttc on tcs.tid = ttc.id 
                            left join t_school tsc on tcs.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tcs.class_id like $2 or tcs.class_name like $2 or ttc.name like $2 or tsc.school_name like $2)`;
            const countResponse = await db.query(sql1, [user.id, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select tcs.id, tcs.class_id, tcs.class_name, ttc.id tid, ttc.name, tsc.id sid, tsc.school_name from t_class tcs 
                            left join t_teacher ttc on tcs.tid = ttc.id 
                            left join t_school tsc on tcs.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1  and (tcs.class_id like $2 or tcs.class_name like $2 or ttc.name like $2 or tsc.school_name like $2)
                            order by tsc.id desc limit $3 offset $4`;
            const response = await db.query(sql2, [user.id, "%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = `select count(*) from t_class tcs 
                            left join t_teacher ttc on tcs.tid = ttc.id 
                            left join t_school tsc on tcs.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1`;
            const countResponse = await db.query(sql1, [user.id])
            count = countResponse.rows[0].count
            const sql2 = `select tcs.id, tcs.class_id, tcs.class_name, ttc.id tid, ttc.name, tsc.id sid, tsc.school_name from t_class tcs 
                            left join t_teacher ttc on tcs.tid = ttc.id 
                            left join t_school tsc on tcs.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 order by tsc.id desc limit $2 offset $3`;
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
        const sql2 = `select tcs.id, tcs.class_id, tcs.class_name, ttc.id, ttc.name, tsc.id, tsc.school_name from t_class tcs 
                        left join t_teacher ttc on tcs.tid = ttc.id 
                        left join t_school tsc on tcs.sid = tsc.id 
                        left join t_user_school tusc on tsc.id = tusc.sid 
                        where tusc.uid = $1 order by tsc.id desc`;
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
        const clazz = req.body
        console.log(clazz)
        //const user = await jwt.decode(req)
        const sql1 = "insert into t_class (class_id, class_name, tid, sid) values ($1, $2, $3, $4) RETURNING id";
        const response = await db.query(sql1, [clazz.class_id, clazz.class_name, clazz.tid, clazz.sid]);
        const cid = response.rows[0].id
        // const sql2 = "insert into t_user_class (uid, sid) values ($1, $2)";
        // if(user.id != 1) {
        //     await db.query(sql2, [1, sid]);
        // } 
        //await db.query(sql2, [user.id, sid]);
        res.json({
            status: 200,
            message: "新增成功",
            data: cid
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.mod = async (req, res) => {
    try {
        const clazz = req.body
        console.log(clazz)
        const sql = "update t_class set class_id = $1, class_name = $2, tid = $3, sid = $4 where id = $5";
        const response = await db.query(sql, [clazz.class_id, clazz.class_name, clazz.tid, clazz.sid, clazz.id]);
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
        const sql = "delete from t_class where id =$1";
        await db.query(sql, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};