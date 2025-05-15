// test-db.js
const sql = require('mssql')
require('dotenv').config()

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

async function testConnection() {
  try {
    console.log('🔌 Intentando conectar a SQL Server...')
    const pool = await sql.connect(config)
    const result = await pool.request().query('SELECT GETDATE() AS FechaActual')
    console.log('✅ Conexión exitosa. Fecha actual del servidor SQL:', result.recordset[0].FechaActual)
    await pool.close()
  } catch (err) {
    console.error('❌ Error al conectar a SQL Server:', err)
  }
}

testConnection()
