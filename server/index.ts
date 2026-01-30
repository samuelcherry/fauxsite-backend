//backend server that will take in HTTPS from Frontend and communicate locally with psql database
//
//
const express = require('express');
const {request: Req, response: Res} = require('express');
const app = express();
const {Pool} = require('pg');
const cors = require('cors');


require('dotenv').config();
app.use(cors({ origin: '*' }))

const pool = new Pool({
  connectionString: process.env.DB_DIRECTCONNECT,
  ssl: { rejectUnauthorized: false },
});

app.listen(process.env.PORT, () => {
  console.log("Server running");
});

app.get('/users', (req: typeof Req, res: typeof Res) => {
	res.status(200).json(getUsers());
});

async function createUser(username: string, email:string){
	try{
		const result = await pool.query(
			'INSERT INTO users(username, email) VALUES($1,$2) RETURNING id',
			[username, email]
		);
		console.log(`User created with ID ${result.rows[0].id}`);
	}catch(err){
		console.error("Error creating user", err);
	}
}

async function getUsers() {
	try{
		const result = await pool.query('SELECT * FROM users');
		console.log("All users: ", result.rows);
		return result;
	}catch(err){
		console.error("Error getting users", err);
	}
}
