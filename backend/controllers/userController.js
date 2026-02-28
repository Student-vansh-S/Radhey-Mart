const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { sendSuccess, sendError } = require("../utils/response");

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "name, email, and password are required", 400);
    }
    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", 400);
    }

    // Role logic (secure)
    let finalRole = "user";
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_REGISTER_SECRET) {
        return sendError(res, "Invalid admin secret", 403);
      }
      finalRole = "admin";
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      normalizedEmail,
    ]);
    if (exists.rows.length > 0) {
      return sendError(res, "Email already registered", 409);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // IMPORTANT: store role
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, password_hash, finalRole],
    );

    const user = result.rows[0];

    // IMPORTANT: include role in JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    sendSuccess(res, { user, token }, "Registered successfully", 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, "email and password are required", 400);
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);
    if (result.rows.length === 0) {
      return sendError(res, "Invalid credentials", 401);
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return sendError(res, "Invalid credentials", 401);

    // IMPORTANT: include role in JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password_hash, ...safeUser } = user;
    sendSuccess(res, { user: safeUser, token }, "Login successful");
  } catch (err) {
    next(err);
  }
};

// rest unchanged
const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id",
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.params.id],
    );
    if (result.rows.length === 0) return sendError(res, "User not found", 404);
    sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { id } = req.params;
    if (!name || !email) return sendError(res, "name and email are required", 400);

    let password_hash;
    if (password) {
      if (password.length < 6)
        return sendError(res, "Password must be at least 6 characters", 400);
      password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await pool.query(
      `UPDATE users
       SET name=$1, email=$2 ${password_hash ? ", password_hash=$4" : ""}
       WHERE id=$3
       RETURNING id, name, email, role, created_at`,
      password_hash
        ? [name.trim(), normalizedEmail, id, password_hash]
        : [name.trim(), normalizedEmail, id],
    );

    if (result.rows.length === 0) return sendError(res, "User not found", 404);
    sendSuccess(res, result.rows[0], "User updated");
  } catch (err) {
    next(err);
  }
};

const patchUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let idx = 1;

    if (req.body.name) {
      fields.push(`name=$${idx++}`);
      values.push(req.body.name.trim());
    }
    if (req.body.email) {
      fields.push(`email=$${idx++}`);
      values.push(req.body.email.toLowerCase().trim());
    }
    if (req.body.password) {
      if (req.body.password.length < 6)
        return sendError(res, "Password must be at least 6 characters", 400);
      const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
      fields.push(`password_hash=$${idx++}`);
      values.push(hash);
    }

    if (fields.length === 0) return sendError(res, "No fields to update", 400);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id=$${idx}
       RETURNING id, name, email, role, created_at`,
      values,
    );

    if (result.rows.length === 0) return sendError(res, "User not found", 404);
    sendSuccess(res, result.rows[0], "User patched");
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING id", [
      req.params.id,
    ]);
    if (result.rows.length === 0) return sendError(res, "User not found", 404);
    sendSuccess(res, null, "User deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser,
};