const db = require("../db/index");
const jwt = require("../jwt/index");
const XLSX = require('xlsx');
 
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
                            where tsd.sid = $1 and (tsd.name like $2 or tsd.iphone like $2 or tsd.address like $2 or tsd.father like $2 or tsd.mother like $2 or tsd.father_iphone like $2 or tsd.mother_iphone like $2 or tdm.building like $2 or tdm.name like $2 or tcs.class_id like $2 or tcs.class_name like $2 or tsc.school_name like $2)`;
            const countResponse = await db.query(sql1, [user.sid, "%" + requestParams.search + "%"])
            count = countResponse.rows[0].count
            const sql2 = `select tsd.id, tsd.name, tsd.gender, tsd.iphone, tsd.address, tsd.father, tsd.father_iphone, tsd.mother, tsd.mother_iphone, tcs.id cid, tcs.class_id, tcs.class_name, tsdd.did, tsdd.number, tdm.building, tdm.name dormitory_name, tsc.id sid, tsc.school_name from t_student tsd 
                            left join t_class tcs on tsd.cid = tcs.id
                            left join t_student_dormitory tsdd on tsd.id = tsdd.sid 
                            left join t_dormitory tdm on tsdd.did = tdm.id 
                            left join t_school tsc on tsd.sid = tsc.id 
                            where tsd.sid = $1 and (tsd.name like $2 or tsd.iphone like $2 or tsd.address like $2 or tsd.father like $2 or tsd.mother like $2 or tsd.father_iphone like $2 or tsd.mother_iphone like $2 or tdm.building like $2 or tdm.name like $2 or tcs.class_id like $2 or tcs.class_name like $2 or tsc.school_name like $2)
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

exports.addAll = async (req, res) => {
    try {
        const students = req.body;
        if(JSON.stringify(students) === '{}') {
            res.json({
                status: 200,
                message: "新增成功",
            });
        } else {
            const user = await jwt.decode(req)
            for(const student of students) {
                // 查询班主任，没有则新建
                let teacher = student.班主任;
                const sql1 = `select id from t_teacher where name = $1`
                const teaResponse = await db.query(sql1, [teacher])
                let tid
                if(teaResponse.rows.length == 0) {
                    let iphone = student.班主任电话;
                    const sql1 = "insert into t_teacher (name, iphone, level, sid) values ($1, $2, $3, $4) RETURNING id";
                    const teaResponse1 = await db.query(sql1, [teacher, iphone, null, user.sid]);
                    tid = teaResponse1.rows[0].id
                }  else {
                    tid = teaResponse.rows[0].id
                }
                // 查询班级，没有则新建
                let class_id = student.班级;
                const sql3 = `select id from t_class where class_id = $1 or class_name = $1`
                const clazzResponse = await db.query(sql3, [class_id])
                let cid
                if(clazzResponse.rows.length == 0) {
                    const sql4 = "insert into t_class (class_id, class_name, tid, sid) values ($1, $2, $3, $4) RETURNING id";
                    const clazzResponse1 = await db.query(sql4, [class_id, class_id, tid, user.sid]);
                    cid = clazzResponse1.rows[0].id
                    // 班级学科绑定
                    let subjects = student.班级分科
                    for (const subject of subjects.split("")) {
                        const sql11 = `select id from t_subject where name like $1`
                        const subResponse = await db.query(sql11, [ "%" + subject + "%"]);
                        if(subResponse.rows.length != 0) {
                            let sub_id = subResponse.rows[0].id
                            const sql12 = `insert into t_class_teacher_subject (cid, sid, master) values ($1, $2, $3)`
                            await db.query(sql12, [cid, sub_id, 1]);
                        }
                    }
                } else {
                    cid = clazzResponse.rows[0].id
                }
                // 查询学生，防止重名，学生班级一起查询
                let name = student.姓名;
                let gender
                if(student.性别 === '男') {
                    gender = 0
                } else {
                    gender = 1
                }
                
                const sql5 = `select id from t_student where name = $1 and cid = $2`
                const stuResponse = await db.query(sql5, [name, cid])
                let sid
                if(stuResponse.rows.length == 0) {
                    let iphone = student.电话
                    let address = student.地址
                    let father = student.父亲
                    let mother = student.母亲
                    let father_iphone = student.父亲电话
                    let mother_iphone = student.母亲电话
                    const sql6 = "insert into t_student (name, iphone, gender, address, father, mother, father_iphone, mother_iphone, cid, sid) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
                    const stuResponse1 = await db.query(sql6, [name, iphone, gender, address, father, mother, father_iphone, mother_iphone, cid, user.sid]);
                    sid = stuResponse1.rows[0].id
                } else {
                    sid = stuResponse.rows[0].id
                }
                // 查询宿舍
                let building = student.楼栋
                let storey = student.楼层
                let dorname = student.房号
                const sql7 = `select id from t_dormitory where building = $1 and storey = $2 and name = $3`
                const dorResponse = await db.query(sql7, [building, storey, dorname]) 
                let did
                if(dorResponse.rows.length == 0) {
                    const sql8 = "insert into t_dormitory (building, storey, gender, number, name, tid, sid) values ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
                    const dorResponse1 = await db.query(sql8, [building, storey, gender, 6, dorname, null, user.sid]);
                    did = dorResponse1.rows[0].id
                } else {
                    did = dorResponse.rows[0].id
                }
                // 学生宿舍绑定
                const sql9 = `select * from t_student_dormitory where sid = $1 and did = $2`
                const sdResponse = await db.query(sql9, [sid, did]) 
                if(sdResponse.rows.length == 0) {
                    let number = student.床号
                    const sql10 = `insert into t_student_dormitory (sid, did, number, times, owner) values ($1, $2, $3, $4, '0')`;
                    await db.query(sql10, [sid, did, number, new Date()]);
                }
            }
        
            res.json({
                status: 200,
                message: "新增成功",
                data: req.body
            });
        }
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