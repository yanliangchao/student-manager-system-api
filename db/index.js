const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

dotenv.config();

// ==> Conexão com a Base de Dados:
const pool = new Pool({
  user: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  port: 5432,
  database: PGDATABASE,
  ssl: {
    rejectUnauthorized: false // 允许自签名SSL证书
  },
  timezone: 'Asia/Shanghai'
});

pool.on('connect', () => {
  console.log('Base de Dados conectado com sucesso!');
});

//pool.end();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
