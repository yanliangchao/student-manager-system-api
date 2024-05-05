const jwt = require('jsonwebtoken');
const config = require("../config");
const db = require("../db/index");

// 生成token
const sign = (data={}) => {
	return jwt.sign(data, config.jwtSecretKey, {
		expiresIn: 12*60*60,
	});
};

// 验证token
const verify = (req, res, next) => {
	let authorization = req.headers.authorization || req.body.token || req.query.token || '';
	let token = '';
	if (authorization.includes('Bearer')) {
		token = authorization.replace('Bearer ', '');
	} else {
		token = authorization;
	}

  	jwt.verify(token, config.jwtSecretKey, (error, data) => {
		if (error) {
			res.status(401).json({ error: 1, data: 'token验证失败' });
		} else {
			req._id = data._id;
			next();
		}
	});
};

// 验证token
const decode = async (req) => {
	let authorization = req.headers.authorization || req.body.token || req.query.token || '';
	let token = '';
	if (authorization.includes('Bearer')) {
		token = authorization.replace('Bearer ', '');
	} else {
		token = authorization;
	}
	const username = jwt.decode(token, config.jwtSecretKey).username;
	const sql = "select * from t_user where username = $1";
    try {
      const response = await db.query(sql, [username]);
	  const results = response.rows
      if (results.length !== 1) return null;
	  return results[0]
	} catch(err) {
	   return err;
	}
	
};

module.exports = {
	sign,
	verify,
	decode,
};
