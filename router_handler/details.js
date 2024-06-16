const db = require("../db/index");
const jwt = require("../jwt/index");

exports.page = async (req, res) => {
    try {
        const id = req.params.id
        const requestParams = req.query;
        let pageIndex = (requestParams.pageNum - 1) * requestParams.pageSize
        let pageCount = requestParams.pageSize
        const user = await jwt.decode(req)
        let count;
        let result;
        if (Number(id)) {
            if (requestParams.search) {
                const sql1 = `select count(*) from t_teacher_details ttcd
                                left join t_teacher ttc on ttcd.tid = ttc.id
                                left join t_school tsc on ttc.sid = tsc.id
                                where tusc.uid = $1 and (ttcd.describes like $2 or ttc.name like $2 or ttc.level like $2 or tsc.school_name like $2)`;
                const countResponse = await db.query(sql1, [user.sid, "%" + requestParams.search + "%"])
                count = countResponse.rows[0].count
                const sql2 = `select ttcd.id, ttcd.times, ttcd.describes, ttc.id tid, ttc.name, ttc.level, tsc.id tsc_id, tsc.school_name from t_teacher_details ttcd
                                left join t_teacher ttc on ttcd.tid = ttc.id
                                left join t_school tsc on ttc.sid = tsc.id
                                where tsc.id = $1 and (ttcd.describes like $2 or ttc.name like $2 or ttc.level like $2 or tsc.school_name like $2) order by ttcd.times desc limit $3 offset $4`;
                const response = await db.query(sql2, [user.sid, "%" + requestParams.search + "%", pageCount, pageIndex]);
                result = response.rows;
            } else {
                const sql1 = `select count(*) from t_teacher_details ttcd
                                left join t_teacher ttc on ttcd.tid = ttc.id
                                left join t_school tsc on ttc.sid = tsc.id
                                where tsc.id = $1`;
                const countResponse = await db.query(sql1, [user.sid])
                count = countResponse.rows[0].count
                const sql2 = `select ttcd.id, ttcd.times, ttcd.describes, ttc.id tid, ttc.name, ttc.level, tsc.id tsc_id, tsc.school_name from t_teacher_details ttcd
                                left join t_teacher ttc on ttcd.tid = ttc.id
                                left join t_school tsc on ttc.sid = tsc.id
                                where tsc.id = $1 order by ttcd.times desc limit $2 offset $3`;
                const response = await db.query(sql2, [user.sid, pageCount, pageIndex]);
                result = response.rows;
            }
        } else {
            if (requestParams.search) {
                const sql1 = `select count(*) from t_student_details tsdd
                                left join t_student tsd on tsdd.sid = tsd.id
                                left join t_class tcs on tsd.cid = tcs.id
                                left join t_student_dormitory tsdm on tsd.id = tsdm.sid 
                                left join t_dormitory tdm on tsdm.did = tdm.id  
                                left join t_school tsc on tsd.sid = tsc.id
                                left join t_user tu on tsdd.uid = tu.id
                                where tsc.id = $1 and (tsdd.describes like $2 or tsd.name like $2 or tu.username like $2 or tcs.class_id like $2 or tcs.class_name like $2 or tdm.building like $2 or tdm.name like $2 or tsc.school_name like $2)`;
                const countResponse = await db.query(sql1, [user.sid, "%" + requestParams.search + "%"])
                count = countResponse.rows[0].count
                const sql2 = `select tsdd.id, tsdd.times, tsdd.number scope, tsdd.describes, tu.username, tsd.id sid, tsd.name, tsd.gender, tcs.id cid, tcs.class_id, tcs.class_name, tsdm.did, tsdm.number, tdm.building, tdm.storey, tdm.gender dormitory_gender, tdm.name dormitory_name, tsc.id tsc_id, tsc.school_name from t_student_details tsdd
                                left join t_student tsd on tsdd.sid = tsd.id
                                left join t_class tcs on tsd.cid = tcs.id
                                left join t_student_dormitory tsdm on tsd.id = tsdm.sid 
                                left join t_dormitory tdm on tsdm.did = tdm.id  
                                left join t_school tsc on tsd.sid = tsc.id
                                left join t_user tu on tsdd.uid = tu.id
                                where tsc.id = $1 and (tsdd.describes like $2 or tsd.name like $2 or tu.username like $2 or tcs.class_id like $2 or tcs.class_name like $2 or tdm.building like $2 or tdm.name like $2 or tsc.school_name like $2) order by tsdd.times desc limit $3 offset $4`;
                const response = await db.query(sql2, [user.sid, "%" + requestParams.search + "%", pageCount, pageIndex]);
                result = response.rows;
            } else {
                const sql1 = `select count(*) from t_student_details tsdd
                                left join t_student tsd on tsdd.sid = tsd.id
                                left join t_school tsc on tsd.sid = tsc.id
                                where tsc.id = $1`;
                const countResponse = await db.query(sql1, [user.sid])
                count = countResponse.rows[0].count
                const sql2 = `select tsdd.id, tsdd.times, tsdd.number scope, tsdd.describes, tu.username, tsd.id sid, tsd.name, tsd.gender, tcs.id cid, tcs.class_id, tcs.class_name, tsdm.did, tsdm.number, tdm.building, tdm.storey, tdm.gender dormitory_gender, tdm.name dormitory_name, tsc.id tsc_id, tsc.school_name from t_student_details tsdd
                                left join t_student tsd on tsdd.sid = tsd.id
                                left join t_class tcs on tsd.cid = tcs.id
                                left join t_student_dormitory tsdm on tsd.id = tsdm.sid 
                                left join t_dormitory tdm on tsdm.did = tdm.id 
                                left join t_school tsc on tsd.sid = tsc.id
                                left join t_user tu on tsdd.uid = tu.id
                                where tsc.id = $1 order by tsdd.times desc limit $2 offset $3`;
                const response = await db.query(sql2, [user.sid, pageCount, pageIndex]);
                result = response.rows;
            }
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
        const id = req.params.id
        const sid = req.params.sid
        let result;
        if(Number(id)) {
            const sql2 = "select * from t_teacher_details ttd where ttd.tid = $1 order by ttd.times desc";
            const response = await db.query(sql2, [sid]);
            result = response.rows;
        } else {
            const sql2 = "select * from t_student_details tsd where tsd.sid = $1 order by tsd.times desc";
            const response = await db.query(sql2, [sid]);
            result = response.rows;
        }

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
        const user = await jwt.decode(req)
        if(details.sid && !details.tid) {
            const sql1 = "insert into t_student_details (times, describes, sid, uid) values ($1, $2, $3, $4) RETURNING id";
            const response = await db.query(sql1, [details.times, details.describes, details.sid, user.id]);
            const sid = response.rows[0].id
            res.json({
                status: 200,
                message: "新增成功",
                data: sid
            });
        } else if(details.tid && !details.sid) {
            const sql1 = "insert into t_teacher_details (times, describes, tid) values ($1, $2, $3) RETURNING id";
            const response = await db.query(sql1, [details.times, details.describes, details.tid]);
            const tid = response.rows[0].id
            res.json({
                status: 200,
                message: "新增成功",
                data: tid
            });
        } else {
            res.status(400).json("参数错误");
        }
        
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.addLeave= async (req, res) => {
    try {
        const details = req.body
        const user = await jwt.decode(req)
        let dates = getDatesArray(details.times[0], details.times[1]);
        for(const date of dates) {
            const sql1 = "insert into t_student_details (times, describes, sid, uid) values ($1, $2, $3, $4) RETURNING id";
            await db.query(sql1, [new Date(date), '请假', details.sid, user.id]);
        }
        res.json({
            status: 200,
            message: "新增成功",
        });
    } catch (err) {
        res.status(400).json(err);
    }
}


function getDatesArray(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);
    dateArray.push(currentDate.toISOString().split('T')[0]);
    while (currentDate <= new Date(endDate)) {
        // 将当前日期增加一天
        currentDate.setDate(currentDate.getDate() + 1);
        // 将当前日期的字符串表示添加到数组中
        dateArray.push(currentDate.toISOString().split('T')[0]);
      
    }
   
    return dateArray;
}

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