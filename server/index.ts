import express from "express";
import { request, response } from "express";
import { Pool } from "pg";
import cors from "cors";

const app = express();

require("dotenv").config();
app.use(cors({ origin: "*" }));

const pool = new Pool({
  connectionString: process.env.DB_DIRECTCONNECT,
  ssl: { rejectUnauthorized: false },
});

app.listen(process.env.PORT, () => {
  console.log("Server running");
});

app.get("/users", async (req: typeof request, res: typeof response) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch users" });
  }
});

app.post("/register", async (req: typeof request, res: typeof response) => {
  const { username, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users(username, email) VALUES($1,$2) RETURNING id",
      [username, email],
    );
    console.log(`User created with ID ${result.rows[0].id}`);
  } catch (err) {
    console.error("Error creating user", err);
  }
});

async function createUser(username: string, email: string) {}

async function getUsers() {
  try {
    const result = await pool.query("SELECT * FROM users");
    console.log("All users: ", result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error getting users", err);
  }
}
