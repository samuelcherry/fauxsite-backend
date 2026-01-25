//backend server that will take in HTTPS from Frontend and communicate locally with psql database
//
//

const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  family: 4,                        // force IPv4
});

async function testConnection() {
	try{
		const res = await pool.query('SELECT NOW()');
		console.log('Connection successful', res.rows[0].now);
	}catch(err){
		console.error("Error connecting to PostgreSQL", err);
	}
}

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
	}catch(err){
		console.error("Error getting users", err);
	}
}

async function main() {
	await testConnection();

	await pool.end();
}

main();
