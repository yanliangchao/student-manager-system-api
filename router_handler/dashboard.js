const db = require("../db/index");
const jwt = require("../jwt/index");

exports.count = async (req, res) => {
    try{
        const result = [];
        const user = await jwt.decode(req)
        // 查询班级数量
        const sql1 = `select count(*) from t_class tcs where tcs.sid = $1`
        const  classResponse = await db.query(sql1, [user.sid])
        let classCount = {
			num1: classResponse.rows[0].count,
			num3: '班级总数量',
			num4: 'fa fa-meetup',
			color1: '#FF6462',
			color2: '--next-color-primary-lighter',
			color3: '--el-color-primary',
		}
        result.push(classCount)
        // 查询教师数量
        const sql2 = `select count(*) from t_teacher ttc where ttc.sid = $1`
        const teacherResponse = await db.query(sql2, [user.sid])
        let teacherCount = {
			num1: teacherResponse.rows[0].count,
			num2: '+42.32',
			num3: '教师总数量',
			num4: 'iconfont icon-ditu',
			color1: '#6690F9',
			color2: '--next-color-success-lighter',
			color3: '--el-color-success',
		}
        result.push(teacherCount)
        // 查询寝室数量
        const sql3 = `select count(*) from t_dormitory tdm where tdm.sid = $1`
        const dormitoryReponse = await db.query(sql3, [user.sid])
        let dormitoryCount = {
			num1: dormitoryReponse.rows[0].count,
			num2: '+17.32',
			num3: '寝室总数量',
			num4: 'iconfont icon-zaosheng',
			color1: '#6690F9',
			color2: '--next-color-warning-lighter',
			color3: '--el-color-warning',
		}
        result.push(dormitoryCount)
        // 查询学生数量
        const sql4 = `select count(*) from t_student tsd where tsd.sid = $1`
        const studentResponse = await db.query(sql4, [user.sid])
        let studentCount = {
			num1: studentResponse.rows[0].count,
			num2: '-10.01',
			num3: '学生总数量',
			num4: 'fa fa-github-alt',
			color1: '#FF6462',
			color2: '--next-color-danger-lighter',
			color3: '--el-color-danger',
		}
        result.push(studentCount)

        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.schoolCount = async (req, res) => {
    try{
        const user = await jwt.decode(req)
        // 获取用户学校信息
        const sql1 = `select tsc.id, tsc.school_name from t_school tsc where tusc.uid = $1`
        const response = await db.query(sql1, [user.sid]);
        const result = response.rows;
        for (const school of result) {
            const sql2 = `select count(*) from t_student_details tsdd 
                            left join t_student tsd on tsdd.sid = tsd.id 
                            where tsd.sid = $1`
            const studentResponse = await db.query(sql2, [school.id]);
            const studentCount = studentResponse.rows[0].count;
            const sql3 = `select count(*) from t_teacher_details ttcd 
                            left join t_teacher ttc on ttcd.tid = ttc.id 
                            where ttc.sid = $1`
            const teacherResponse = await db.query(sql3, [school.id]);
            const teacherCount = teacherResponse.rows[0].count;
            school.count = Number(studentCount) + Number(teacherCount)
        }
        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    } 
}

exports.teacherCount = async (req, res) => {
    try{
        const id = req.params.id
        //const user = await jwt.decode(req)
        // 获取老师学校信息
        const sql1 = `select ttc.id, ttc.name from t_teacher ttc 
                        where ttc.sid = $1`
        const response = await db.query(sql1, [id]);
        const result = response.rows;
        for (const teacher of result) {
            const sql2 = `select count(*) from t_teacher_details ttcd 
                            left join t_teacher tsd on ttcd.tid = tsd.id 
                            where tsd.id = $1`
            const countResponse = await db.query(sql2, [teacher.id]);
            teacher.count = countResponse.rows[0].count;
        }
        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    } 
}

exports.dormitoryCount = async (req, res) => {
    try{
        const id = req.params.id
        //const user = await jwt.decode(req)
        // 获取用户寝室信息
        const sql1 = `select tdm.id, tdm.building, tdm.name from t_dormitory tdm
                        where tdm.sid = $1`
        const response = await db.query(sql1, [id]);
        const xAxis = [];
        const yAxis = [];
        for (const dormitory of response.rows) {
            xAxis.push(dormitory.building + "-" + dormitory.name);
            // 获取寝室全部人员的违纪信息
            const sql2 = `select count(*) from t_student_details tsdd 
                            left join t_student tsd on tsdd.sid = tsd.id 
                            left join t_student_dormitory tsdm on tsdm.sid = tsd.id
                            left join t_dormitory tdm on tsdm.did = tdm.id
                            where tdm.id = $1`
            const details = await db.query(sql2, [dormitory.id]);
            yAxis.push({
                value: details.rows[0].count,
                stationName: "s" + xAxis.length
            })
        }
        const result = {
            xAxis: xAxis,
            yAxis: yAxis
        }
        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.classCount = async (req, res) => {
    try{
        const id = req.params.id
        // 获取用户班级信息
        const sql1 = `select tcs.id, tcs.class_id, tcs.class_name from t_class tcs 
                        where tcs.sid = $1`
        const response = await db.query(sql1, [id]);
        const xAxis = [];
        const yAxis = [];
        for (const clazz of response.rows) {
            xAxis.push(clazz.class_name);
            // 获取寝室全部人员的违纪信息
            const sql2 = `select count(*) from t_student_details tsdd 
                            left join t_student tsd on tsdd.sid = tsd.id 
                            left join t_class tcs on tsd.cid = tcs.id
                            where tcs.id = $1`
            const details = await db.query(sql2, [clazz.id]);
            yAxis.push({
                value: details.rows[0].count,
                stationName: "s" + xAxis.length
            })
        }
        const result = {
            xAxis: xAxis,
            yAxis: yAxis
        }
        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}