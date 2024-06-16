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

exports.getLeave = async (req, res) => {
    try{
        const user = await jwt.decode(req)
        const sql1 = `select tcs.class_name class_name, tsu.name, tdm.building, tdm.storey, tdm.name tdm_name, tus.name username from t_student_details tsd 
                        left join t_student tsu on tsd.sid = tsu.id
                        left join t_student_dormitory tsm on tsm.sid = tsu.id
                        left join t_dormitory tdm on tdm.id = tsm.did
                        left join t_class tcs on tcs.id = tsu.cid
                        left join t_user tus on tus.id = tsd.uid
                        where tsu.sid = $1 and tsd.describes = '请假' and date_trunc('day', tsd.times) = date_trunc('day', now());`
        const details = await db.query(sql1, [user.sid]);
        const result = details.rows;
        res.json({
            status: 200,
            message: "查询成功",
            data: result,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.getPinfenCount = async (req, res) => {
    try{
        const user = await jwt.decode(req)
        const sql1 = `select tus.id, tus.username from t_user tus where tus.sid = $1 and tus.role = 'user'`
        const response = await db.query(sql1, [user.sid])
        const users = response.rows;
        
        for (const u of users) {
            // 获取宿舍数量
            const sql2 = `select count(*) from t_user_dormitory tud where tud.uid = $1`
            const response1 = await db.query(sql2, [u.id])
            const tdmCount = response1.rows[0].count;
            u.tdmCount = tdmCount;

            // 获取学生数量
            const sql3 = `select count(*) from t_student_dormitory tsd left join t_user_dormitory tud on tsd.did = tud.did where tud.uid = $1`
            const response2 = await db.query(sql3, [u.id])
            const tsuCount = response2.rows[0].count;
            u.tsuCount = tsuCount;

            // 平均宿舍分
            if(tdmCount != 0) {
                let today = new Date();
                let startDay = new Date()
                startDay.setDate(today.getDate() - today.getDay());
                const sql4 = `select tsd.did, sum(tsu.number) total from t_student_dormitory tsd 
                                left join (select tsd.sid, sum(number) number from t_student_details tsd 
                                    where date_trunc('day', tsd.times) >= $1 and 
                                    date_trunc('day', tsd.times) <= $2
                                    group by tsd.sid) tsu on tsd.sid = tsu.sid 
                                left join t_user_dormitory tud on tud.did = tsd.did
                                where tud.uid = $3 and tsu.number is not null group by tsd.did;`
                const response3 = await db.query(sql4, [formatDate(startDay), formatDate(today), u.id])
                const tdmTotal = response3.rows;
                let total = tdmCount * tsuCount * 100;
                for(const num of tdmTotal) {
                    total = total-num.total;
                }
                const avg = total/tdmCount/tsuCount;
                u.avg = avg.toFixed(2);
            } else {
                u.avg = 0;
            }

            // 获取今日总用时
            const sql5 = `select tsd.times from t_student_details tsd where tsd.uid = $1 and  date_trunc('day', tsd.times) = date_trunc('day', now()) order by times desc limit 1`
            const response5 = await db.query(sql5, [u.id])
            const lastTime = response5.rows[0];
            const time5 = formatDate(new Date()) + " 2:30:00"
            const time11 = formatDate(new Date()) + " 11:30:00"
            const time16 = formatDate(new Date()) + " 16:30:00"

            let totalTime
            if(!lastTime || lastTime.times < new Date(time5)) {
                totalTime = '上午未评分！'
            } else if (lastTime.times > new Date(time5) && new Date() < new Date(time11)) {
                // 获取上午评分用时
                const sql6 = `select tsd.times from t_student_details tsd where tsd.uid = $1 and date_trunc('second', tsd.times) >= $2 and date_trunc('second', tsd.times) <= $3 order by times asc limit 1`
                const response6 = await db.query(sql6, [u.id, time5, time11])
                const startTime = response6.rows[0];
                totalTime = ((lastTime.times.getTime() - startTime.times.getTime())/1000/60/60).toFixed(2)
            } else if (lastTime.times < new Date(time11) && new Date() > new Date(time11)) {
                totalTime = '下午未评分！'
            } else {
                //获取下午评分用时
                const sql7 = `select tsd.times from t_student_details tsd where tsd.uid = $1 and date_trunc('second', tsd.times) >= $2 and date_trunc('second', tsd.times) <= $3 order by times asc limit 1`
                const response7 = await db.query(sql7, [u.id, time11, time16])
                const startTime = response7.rows[0];

                totalTime = ((lastTime.times.getTime() - startTime.times.getTime())/1000/60/60).toFixed(2)
            }
            u.totalTime = totalTime;            
        }

        res.json({
            status: 200,
            message: "查询成功",
            data: users,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.getDiscipline = async (req, res) => {
    try{
        const user = await jwt.decode(req)
        const sql1 = `select tsd.name, tsdd.times, tsdd.describes, tsdd.number from t_student_details tsdd 
                        left join t_student tsd on tsdd.sid = tsd.id 
                        where tsdd.number is not null and date_trunc('day', tsdd.times) = date_trunc('day', now()) and tsd.sid = $1 
                        order by tsdd.number desc `
        const response = await db.query(sql1, [user.sid])
        const discipline = response.rows;
        res.json({
            status: 200,
            message: "查询成功",
            data: discipline,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.getDianmingCount = async (req, res) => {
    try{
        const user = await jwt.decode(req)
        const sql1 = `select tus.id, tus.username from t_user tus where tus.sid = $1 and tus.role = 'user'`
        const response = await db.query(sql1, [user.sid])
        const users = response.rows;
        
        for (const u of users) {
            // 获取宿舍数量
            const sql2 = `select count(*) from t_user_dormitory tud where tud.uid = $1`
            const response1 = await db.query(sql2, [u.id])
            const tdmCount = response1.rows[0].count;
            u.tdmCount = tdmCount;

            // 获取学生数量
            const sql3 = `select count(*) from t_student_dormitory tsd left join t_user_dormitory tud on tsd.did = tud.did where tud.uid = $1`
            const response2 = await db.query(sql3, [u.id])
            const tsuCount = response2.rows[0].count;
            u.tsuCount = tsuCount;

            const time5 = formatDate(new Date()) + " 2:30:00"
            const time11 = formatDate(new Date()) + " 11:30:00"
            const time16 = formatDate(new Date()) + " 16:30:00"

            
            if(new Date() < new Date(time11)) {
                // 上午点名
                // 缺寝
                const sql4 = `select count(*) from t_student_details tsd where tsd.describes = '缺寝' and tsd.uid = $1 and date_trunc('second', tsd.times) >= $2 and date_trunc('second', tsd.times) <= $3`
                const response3 = await db.query(sql4, [u.id, time5, time11])
                const lack = response3.rows[0].count;
                // 请假
                const sql5 = `select count(*) from t_student_details tsd where tsd.describes = '请假' and tsd.uid = $1 and date_trunc('second', tsd.times) >= $2 and date_trunc('second', tsd.times) <= $3`
                const response4 = await db.query(sql5, [u.id, time5, time11])
                const leave = response4.rows[0].count;
                u.lack = lack;
                u.leave = leave;
            } else {
                // 下午点名
                // 缺寝
                const sql4 = `select count(*) from t_student_details tsd where tsd.describes = '缺寝' and tsd.uid = $1 and date_trunc('second', tsd.times) >= $2 and date_trunc('second', tsd.times) <= $3`
                const response3 = await db.query(sql4, [u.id, time11, time16])
                const lack = response3.rows[0].count;
                // 请假
                const sql5 = `select count(*) from t_student_details tsd where tsd.describes = '请假' and tsd.uid = $1 and date_trunc('second', tsd.times) >= $2 and date_trunc('second', tsd.times) <= $3`
                const response4 = await db.query(sql5, [u.id, time11, time16])
                const leave = response4.rows[0].count;
                u.lack = lack;
                u.leave = leave;
            }

        }

        res.json({
            status: 200,
            message: "查询成功",
            data: users,
        });
    } catch (err) {
        res.status(400).json(err);
    }
}

//格式化时间
const formatDate = (date) => {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2); // 月份从0开始，所以要加1
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getUTCHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var seconds = ("0" + date.getSeconds()).slice(-2);
    return year + "-" + month + "-" + day;

}