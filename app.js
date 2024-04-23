
const postgres = require('postgres');

require('dotenv').config();



let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;



const sql = postgres({

    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require',

});



async function getPgVersion() {
    const result = await sql`select version()`;
    console.log(result[0].version);
    return result[0].version
}



const express = require('express')
const app = express();

// 端口
const port = 8080

app.use(express.json())


app.get('/', async (req, res) => {
    let version = await getPgVersion()
    console.log(version)
    res.send(version)
})


app.listen(port, () => {
    console.log(`Node服务已启动，端口为：${port}`)
})