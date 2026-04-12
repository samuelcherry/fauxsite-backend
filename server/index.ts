import express from "express";
import { request, response } from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({ origin: "*" }));

const pool = new Pool({
  connectionString: process.env.DB_POOLCONNECT,
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
  try {
    const registeredUser = await registerUser(username, email, password);
    res.status(201).json(registeredUser);
  } catch (err) {
    res.status(500).json({ error: "failed to register user", err });
  }
});

app.post("/login", async (req: typeof request, res: typeof response) => {
  const { email, password } = req.body;
  try {
    const loggedInUser = await loginUser(email, password);
    res.status(200).json(loggedInUser);
  } catch (err) {
    res.status(500).json({ error: "failed to login user", err });
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

async function registerUser(username: string, email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users(username, email, password)
      VALUES($1,$2,$3)
      RETURNING username`,
      [username, email, hashedPassword],
    );

    return { id: result.rows[0].id };
  } catch (err: any) {
    console.error("failed to register user", err);
  }
}

async function loginUser(email: string, password: string) {
  try {
    const result = await pool.query(`Select * FROM users WHERE email = $1`, [
      email,
    ]);
    const user = result.rows[0];
    if (!user) {
      throw new Error("User not found");
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    return { username: result.rows[0].username };
  } catch (err) {
    throw new Error("failed to login user");
  }
}
