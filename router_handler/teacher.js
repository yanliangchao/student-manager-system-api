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
            const sql1 = `select count(*) from (select distinct ttc.* from t_teacher ttc 
                                left join t_school tsc on ttc.sid = tsc.id 
                                where ttc.sid = $1 and (ttc.name like $2 or ttc.level like $2 or tsc.school_name like $2))`;
            const countResponse = await db.query(sql1, [user.sid, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select distinct ttc.id, ttc.name, ttc.iphone, ttc.level, tsc.id sid, tsc.school_name from t_teacher ttc 
                            left join t_school tsc on ttc.sid = tsc.id 
                            where ttc.sid = $1 and (ttc.name like $2 or ttc.level like $2 or tsc.school_name like $2)
                            order by id desc limit $3 offset $4`;
            const response = await db.query(sql2, [user.sid, "%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = `select count(*) from t_teacher ttc 
                            left join t_school tsc on ttc.sid = tsc.id 
                            where ttc.sid = $1`;
            const countResponse = await db.query(sql1, [user.sid])

            count = countResponse.rows[0].count
            const sql2 = `select ttc.id, ttc.name, ttc.iphone, ttc.level, tsc.id sid, tsc.school_name from t_teacher ttc 
                            left join t_school tsc on ttc.sid = tsc.id
                            where ttc.sid = $1 order by id desc limit $2 offset $3`;
            const response = await db.query(sql2, [user.sid, pageCount, pageIndex]);
            result = response.rows;
        }
        //console.log(result)
        // 查询result的 JOIN 值，
        for (const row of result) {
            // 查询是班主任的班级，
            const sql3 = `select * from t_class where tid = $1`
            const class_teacher = await db.query(sql3, [row.id])
            row.class_teacher = class_teacher.rows

            // 查询教的班级的班级，
            // const sql4 = `select tcs.* from t_class tcs left join t_class_teacher tctc on tcs.id = tctc.cid  where tctc.tid = $1`
            // const clazz = await db.query(sql4, [row.id])
            // row.class = clazz.rows

            // 查询教的科目
            const sql5 = `select tcs.id cid, tcs.class_id, tcs.class_name, tsj.id sid, tsj.name subject from t_class_teacher_subject tcts 
                            left join t_class tcs on tcs.id = tcts.cid 
                            left join t_subject tsj on tsj.id = tcts.sid 
                            where tcts.tid = $1`
            const subject = await db.query(sql5, [row.id])
            row.class = subject.rows
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
        const sql2 = `select ttc.id, ttc.name teacher_name, ttc.level from t_teacher ttc where ttc.sid = $1 order by id desc`;
        const response = await db.query(sql2, [user.sid]);
        result = response.rows;
        //console.log(result)
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
        const teacher = req.body
        //const subjects = teacher.subjects;
        const user = await jwt.decode(req)
        const sql1 = "insert into t_teacher (name, iphone, level, sid) values ($1, $2, $3, $4) RETURNING id";
        const response = await db.query(sql1, [teacher.name, teacher.iphone, teacher.level, user.sid]);
        const tid = response.rows[0].id
        // for(const sid of subjects) {
        //     const sql2 = "insert into t_teacher_subject (tid, sid) values ($1, $2)"
        //     await db.query(sql2, [tid, sid]);
        // }
        res.json({
            status: 200,
            message: "新增成功",
            data: tid
        });
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.mod = async (req, res) => {
    try {
        const teacher = req.body
        const sql1 = "update t_teacher set name = $1, iphone = $2, level = $3 where id = $4";
        await db.query(sql1, [teacher.name, teacher.iphone, teacher.level, teacher.id]);

        // 修改中间表  --> 删除再新增
        // const sql2 = `delete from t_teacher_subject where tid = $1`
        // await db.query(sql2, [teacher.id]);

        // const subjects = teacher.subjects;
        // for (const sid of subjects) {
        //     const sql2 = "insert into t_teacher_subject (tid, sid) values ($1, $2)"
        //     await db.query(sql2, [teacher.id, sid]);
        // }
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
        const sql1 = "delete from t_teacher where id =$1";
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