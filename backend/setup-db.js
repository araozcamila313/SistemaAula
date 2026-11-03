require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

const databaseName = process.env.DB_NAME;

function connectionOptions(database) {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

async function setupDatabase() {
  if (!databaseName) {
    throw new Error('DB_NAME no está configurado');
  }

  const adminPool = new Pool(connectionOptions(process.env.DB_ADMIN_DATABASE || 'postgres'));
  try {
    const result = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );
    if (result.rowCount === 0) {
      const quotedName = `"${databaseName.replace(/"/g, '""')}"`;
      await adminPool.query(`CREATE DATABASE ${quotedName}`);
      console.log(`Base de datos "${databaseName}" creada.`);
    }
  } finally {
    await adminPool.end();
  }

  const pool = new Pool(connectionOptions(databaseName));
  try {
    const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Esquema y datos iniciales configurados.');
  } finally {
    await pool.end();
  }
}

setupDatabase().catch((error) => {
  console.error(`No se pudo configurar la base de datos: ${error.message}`);
  process.exitCode = 1;
});
