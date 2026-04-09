import express from "express";
import { request, response } from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

dotenv.config();
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
  const { username, email, password } = req.body;
  console.log("test 1", username, email, password);
  try {
    const result = await pool.query(
      `INSERT INTO users(username, email, password)
      VALUES($1,$2,$3)
      RETURNING id`,
      [username, email, password],
    );
    console.log("test 2: ", result.rows[0]);
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating user", err);
    res.status(500).json({ error: "failed to create user" });
  }
});

async function getUsers() {
  try {
    const result = await pool.query("SELECT * FROM users");
    console.log("All users: ", result.rows);
    return result.rows;
  } catch (err) {
    console.error("Error getting users", err);
  }
}
