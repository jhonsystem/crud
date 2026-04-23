const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL no está definido. Configura la conexión a PostgreSQL antes de desplegar.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS personal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    cargo VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    telefono VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`;

async function initializeDatabase() {
  await pool.query(createTableQuery);
  console.log("Base de datos PostgreSQL lista.");
}

app.use(cors({ origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/api/personal", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellido, cargo, email, telefono, created_at, updated_at
       FROM personal
       ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "No se pudo listar el personal.", detail: error.message });
  }
});

app.get("/api/personal/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellido, cargo, email, telefono, created_at, updated_at
       FROM personal
       WHERE id = $1`,
      [req.params.id]
    );
    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ message: "Registro no encontrado." });
    }

    res.json(row);
  } catch (error) {
    res.status(500).json({ message: "No se pudo obtener el registro.", detail: error.message });
  }
});

app.post("/api/personal", async (req, res) => {
  const { nombre, apellido, cargo, email, telefono } = req.body;

  if (!nombre || !apellido || !cargo || !email) {
    return res.status(400).json({ message: "nombre, apellido, cargo y email son obligatorios." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO personal (nombre, apellido, cargo, email, telefono)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, cargo, email, telefono, created_at, updated_at`,
      [nombre, apellido, cargo, email, telefono || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "El email ya existe." });
    }
    res.status(500).json({ message: "No se pudo crear el registro.", detail: error.message });
  }
});

app.put("/api/personal/:id", async (req, res) => {
  const { nombre, apellido, cargo, email, telefono } = req.body;

  if (!nombre || !apellido || !cargo || !email) {
    return res.status(400).json({ message: "nombre, apellido, cargo y email son obligatorios." });
  }

  try {
    const result = await pool.query(
      `UPDATE personal
       SET nombre = $1, apellido = $2, cargo = $3, email = $4, telefono = $5, updated_at = NOW()
       WHERE id = $6`,
      [nombre, apellido, cargo, email, telefono || null, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Registro no encontrado." });
    }

    const updatedResult = await pool.query(
      `SELECT id, nombre, apellido, cargo, email, telefono, created_at, updated_at
       FROM personal
       WHERE id = $1`,
      [req.params.id]
    );

    res.json(updatedResult.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "El email ya existe." });
    }
    res.status(500).json({ message: "No se pudo actualizar el registro.", detail: error.message });
  }
});

app.delete("/api/personal/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM personal WHERE id = $1", [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Registro no encontrado." });
    }

    res.json({ message: "Registro eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo eliminar el registro.", detail: error.message });
  }
});

app.get("/api/info", (req, res) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = typeof forwardedFor === "string"
    ? forwardedFor.split(",")[0].trim()
    : req.socket.remoteAddress;

  res.json({
    message: "Hola Mundo avanzado",
    serverTime: new Date().toISOString(),
    clientIp,
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No fue posible inicializar la base de datos:", error.message);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
