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
            const sql1 = `select count(*) from t_student tsd 
                            left join t_class tcs on tsd.cid = tcs.id
                            left join t_student_dormitory tsdd on tsd.id = tsdd.sid 
                            left join t_dormitory tdm on tsdd.did = tdm.id 
                            left join t_school tsc on tsd.sid = tsc.id 
                            where tsd.sid = $1 and (tsd.name like $2 or tsd.gender like $2 or tsd.iphone like $2 or tsd.address like $2 or tsd.father like $2 or tsd.mother like $2 or tsd.father_iphone like $2 or tsd.mother_iphone like $2 or tdm.building like $2 or tdm.name like $2 or tcs.class_id like $2 or tcs.class_name like $2 or tsc.school_name like $2)`;
            const countResponse = await db.query(sql1, [user.sid, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select tsd.id, tsd.name, tsd.gender, tsd.iphone, tsd.address, tsd.father, tsd.father_iphone, tsd.mother, tsd.mother_iphone, tcs.id cid, tcs.class_id, tcs.class_name, tsdd.did, tsdd.number, tdm.building, tdm.name dormitory_name, tsc.id sid, tsc.school_name from t_student tsd 
                            left join t_class tcs on tsd.cid = tcs.id
                            left join t_student_dormitory tsdd on tsd.id = tsdd.sid 
                            left join t_dormitory tdm on tsdd.did = tdm.id 
                            left join t_school tsc on tsd.sid = tsc.id 
                            where tsd.sid = $1 and (tsd.name like $2 or tsd.gender like $2 or tsd.iphone like $2 or tsd.address like $2 or tsd.father like $2 or tsd.mother like $2 or tsd.father_iphone like $2 or tsd.mother_iphone like $2 or tdm.building like $2 or tdm.name like $2 or tcs.class_id like $2 or tcs.class_name like $2 or tsc.school_name like $2)
                            order by id desc limit $3 offset $4`;
            const response = await db.query(sql2, [user.sid, "%" + requestParams.search + "%", pageCount, pageIndex]);
            result = response.rows;
        } else {
            const sql1 = `select count(*) from t_student tsd 
                            left join t_class tcs on tsd.cid = tcs.id
                            left join t_student_dormitory tsdd on tsd.id = tsdd.sid 
                            left join t_dormitory tdm on tsdd.did = tdm.id 
                            left join t_school tsc on tsd.sid = tsc.id 
                            where tsd.sid = $1`;
            const countResponse = await db.query(sql1, [user.sid])

            count = countResponse.rows[0].count
            const sql2 = `select tsd.id, tsd.name, tsd.gender, tsd.iphone, tsd.address, tsd.father, tsd.father_iphone, tsd.mother, tsd.mother_iphone, tcs.id cid, tcs.class_id, tcs.class_name, tsdd.did, tsdd.number, tdm.building, tdm.name dormitory_name, tsc.id sid, tsc.school_name from t_student tsd 
                            left join t_class tcs on tsd.cid = tcs.id
                            left join t_student_dormitory tsdd on tsd.id = tsdd.sid 
                            left join t_dormitory tdm on tsdd.did = tdm.id 
                            left join t_school tsc on tsd.sid = tsc.id 
                            where tsd.sid = $1 order by id desc limit $2 offset $3`;
            const response = await db.query(sql2, [user.sid, pageCount, pageIndex]);
            result = response.rows;
        }
        for (const student of result) {
            // 查询主课科目
            const sql5 = `select tsb.id, tsb.name from t_class_teacher_subject tcts left join t_subject tsb on tcts.sid = tsb.id where tcts.cid = $1 and tcts.master = '1'`;
            const subjects = await db.query(sql5, [student.cid])
            student.subjects = subjects.rows
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

exports.pageByCid = async (req, res) => {
    try {
        const cid = req.params.id;
        const requestParams = req.query;
        let pageIndex = (requestParams.pageNum - 1) * requestParams.pageSize
        let pageCount = requestParams.pageSize
        const user = await jwt.decode(req)
        let count;
        let result;
        const sql1 = `select count(*) from t_student tsd where tsd.cid = $1`;
        const countResponse = await db.query(sql1, [cid])
        count = countResponse.rows[0].count
        const sql2 = `select tsd.id, tsd.name, tsd.gender, tsd.iphone, tsd.address, tsd.father, tsd.father_iphone, tsd.mother, tsd.mother_iphone, tsdd.did, tsdd.number, tdm.building, tdm.name dormitory_name from t_student tsd 
                        left join t_student_dormitory tsdd on tsd.id = tsdd.sid 
                        left join t_dormitory tdm on tsdd.did = tdm.id 
                        where tsd.cid = $1 order by id desc limit $2 offset $3`;
        const response = await db.query(sql2, [cid, pageCount, pageIndex]);
        result = response.rows;
        
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
        const sql2 = `select tsd.id, tsd.name, tsd.gender, tsd.iphone, tsd.address, tsd.father, tsd.father_iphone, tsd.mother, tsd.mother_iphone from t_student tsd where tsd.sid = $1 order by id desc`;
        const response = await db.query(sql2, [user.sid]);
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

exports.listByDormitory = async (req, res) => {
    try {
        const gender = req.params.gender
        const user = await jwt.decode(req)
        let result;
        const sql2 = `select tsd.id, tsd.name, tsd.gender, tsd.iphone, tsd.address, tsd.father, tsd.father_iphone, tsd.mother, tsd.mother_iphone from t_student tsd left join t_student_dormitory tsdm on tsd.id = tsdm.sid where tsd.sid = $1 and tsd.gender = $2 and tsdm.did is null order by id desc`;
        const response = await db.query(sql2, [user.sid, gender]);
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
        const student = req.body
        const user = await jwt.decode(req)
        const sql1 = "insert into t_student (name, iphone, gender, address, father, mother, father_iphone, mother_iphone, cid, sid) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
        const response = await db.query(sql1, [student.name, student.iphone, student.gender, student.address, student.father, student.mother, student.father_iphone, student.mother_iphone, student.cid, user.sid]);
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
        const student = req.body
        const user = await jwt.decode(req)
        const sql1 = "update t_student set name = $1, iphone = $2, gender = $3, address = $4, father = $5, mother = $6, father_iphone = $7, mother_iphone = $8, cid = $9, sid = $10 where id = $11";
        await db.query(sql1, [student.name, student.iphone, student.gender, student.address, student.father, student.mother, student.father_iphone, student.mother_iphone, student.cid, student.sid, user.id]);
        
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
        const sql1 = "delete from t_student where id =$1";
        await db.query(sql1, [id]);
        const sql2 = "delete from t_student_details where sid =$1";
        await db.query(sql2, [id]);
        const sql3 = "delete from t_student_dormitory where sid =$1";
        await db.query(sql3, [id]);
        res.json({
            status: 200,
            message: "删除成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }                 
};