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
        for (const clazz of result) {
            // 查询clazz中学生的数量
            const sql3 = `select count(*) from t_student tsd where tsd.cid = $1`;
            const stuCount = await db.query(sql3, [clazz.id])
            clazz.sidCount = stuCount.rows[0].count

            // 查询clazz科目
            const sql4 = `select count(*) from t_class_teacher_subject tcts where tcts.cid = $1`;
            const teaCount = await db.query(sql4, [clazz.id])
            clazz.tidCount = teaCount.rows[0].count

            // 查询主课科目
            const sql5 = `select tsb.id, tsb.name from t_class_teacher_subject tcts left join t_subject tsb on tcts.sid = tsb.id where tcts.cid = $1 and tcts.master = '1'`;
            const subjects = await db.query(sql5, [clazz.id])
            clazz.subjects = subjects.rows
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
        const sql2 = `select tcs.id, tcs.class_id, tcs.class_name, ttc.id tid, ttc.name, tsc.id sid, tsc.school_name from t_class tcs 
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

exports.getSubTecById =async (req, res) => {
    try {
        const id = req.params.id
        let result;
        const sql2 = `select ttc.id tid, ttc.name, ttc.level, ttc.iphone, tsj.id sid, tsj.name subject from t_class_teacher_subject tcts 
                        left join t_teacher ttc on ttc.id = tcts.tid
                        left join t_subject tsj on tsj.id = tcts.sid
                        where tcts.cid = $1`;
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
        const clazz = req.body
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

exports.addSubTec = async (req, res) => {
    try {
        const row = req.body
        //const user = await jwt.decode(req)
        const sql1 = "insert into t_class_teacher_subject (cid, tid, sid) values ($1, $2, $3)";
        await db.query(sql1, [row.cid, row.tid, row.sid]);
        // const sql2 = "insert into t_user_class (uid, sid) values ($1, $2)";
        // if(user.id != 1) {
        //     await db.query(sql2, [1, sid]);
        // } 
        //await db.query(sql2, [user.id, sid]);
        res.json({
            status: 200,
            message: "新增成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.mod = async (req, res) => {
    try {
        const clazz = req.body
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
        const sql1 = "delete from t_class where id =$1";
        await db.query(sql1, [id]);
        const sql2 = "delete from t_class_teacher_subject where tid =$1";
        await db.query(sql2, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.delSubTec = async (req, res) => {
    try {
        const row = req.body
        const sql2 = "delete from t_class_teacher_subject where cid = $1 and tid =$2 and sid = $3";
        await db.query(sql2, [row.cid, row.tid, row.sid]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
};