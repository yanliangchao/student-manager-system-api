const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require("./jwt/index");

const app = express()
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())

const authRouter = require('./router/auth')
const userRouter = require('./router/user')
const schoolRouter = require('./router/school')
const subjectRouter = require('./router/subject')
const teacherRouter = require('./router/teacher')
const classRouter = require('./router/class')
const dormitoryRouter = require('./router/dormitory')
const studentRouter = require('./router/student')
const detailsRouter = require('./router/details')

app.use('/api/auth', authRouter)
app.use('/api/user', jwt.verify, userRouter)
app.use('/api/school', jwt.verify, schoolRouter)
app.use('/api/subject', jwt.verify, subjectRouter)
app.use('/api/teacher', jwt.verify, teacherRouter)
app.use('/api/class', jwt.verify, classRouter)
app.use('/api/dormitory', jwt.verify, dormitoryRouter)
app.use('/api/student', jwt.verify, studentRouter)
app.use('/api/details', jwt.verify, detailsRouter)



app.listen(3021, () => {
    console.log('api server running at http://127.0.0.1:3021')
})
