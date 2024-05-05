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
                            left join t_teacher ttc on tdm.tid = ttc.id
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tdm.building like $2 or tdm.name like $2 or ttc.name like $2)`;
            const countResponse = await db.query(sql1, [user.id, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select tdm.id, tdm.building, tdm.name, ttc.id tid, ttc.name ttc_name, ttc.iphone, tsc.id sid, tsc.school_name from t_dormitory tdm
                            left join t_teacher ttc on tdm.tid = ttc.id
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 and (tdm.building like $2 or tdm.name like $2 or ttc.name like $2)
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
            const sql2 = `select tdm.id, tdm.building, tdm.name, ttc.id tid, ttc.name ttc_name, ttc.iphone, tsc.id sid, tsc.school_name from t_dormitory tdm
                            left join t_teacher ttc on tdm.tid = ttc.id
                            left join t_school tsc on tdm.sid = tsc.id 
                            left join t_user_school tusc on tsc.id = tusc.sid 
                            where tusc.uid = $1 
                            order by id desc limit $2 offset $3`;
            const response = await db.query(sql2, [user.id, pageCount, pageIndex]);
            result = response.rows;
        }
        for (const dormitory of result) {
            // 查询clazz中学生的数量
            const sql3 = `select count(*) from t_student_dormitory tsd where tsd.did = $1`;
            const stuCount = await db.query(sql3, [dormitory.id])
            dormitory.sidCount = stuCount.rows[0].count
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

exports.getStuByid = async (req, res) => {
    try {
        const id = req.params.id
        let result;
        const sql2 = `select stu.id, stu.name, stu.address, stu.iphone, stu.father, stu.father_iphone, stu.mother, stu.mother_iphone, 
                        tsd.number, tsd.times, tsd.owner, tcs.id cid, tcs.class_id, tcs.class_name from t_student_dormitory tsd 
                        left join t_student stu on tsd.sid = stu.id
                        left join t_class tcs on stu.cid = tcs.id
                        where tsd.did = $1`;
        const response = await db.query(sql2, [id]);
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
        const sql1 = "insert into t_dormitory (building, name, tid, sid) values ($1, $2, $3, $4) RETURNING id";
        const response = await db.query(sql1, [dormitory.building, dormitory.name, dormitory.tid, dormitory.sid]);
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


exports.addStu = async (req, res) => {
    try {
        const row = req.body
        const sql1 = `insert into t_student_dormitory (sid, did, number, times, owner) values ($1, $2, $3, $4, '0')`;
        await db.query(sql1, [row.sid, row.did, row.number, row.times]);
        res.json({
            status: 200,
            message: "新增成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.mod = async (req, res) => {
    try {
        const dormitory = req.body
        const sql = "update t_dormitory set building = $1, name = $2, tid = $3, sid = $4 where id = $5";
        await db.query(sql, [dormitory.building, dormitory.name, dormitory.tid, dormitory.sid, dormitory.id]);
        res.json({
            status: 200,
            message: "修改成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.modStu = async (req, res) => {
    try {
        const row = req.body
        const sql = "update t_student_dormitory set owner = $1 where sid = $2";
        await db.query(sql, [row.owner, row.id]);
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
        const sql1 = "delete from t_dormitory where id = $1";
        await db.query(sql1, [id]);
        const sql2 = "delete from t_student_dormitory where did = $1";
        await db.query(sql2, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.delStu = async (req, res) => {
    try {
        const id = req.params.id
        const sql = "delete from t_student_dormitory where sid = $1";
        await db.query(sql, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};