const sql = require('mssql');
const tunnel = require('tunnel');
const url = require('url');

// Obtener URL de QuotaguardStatic del entorno
const quotaguardUrl = process.env.QUOTAGUARDSTATIC_URL;
const parsedUrl = url.parse(quotaguardUrl);

// Crear el túnel proxy
const agent = tunnel.httpsOverHttp({
  proxy: {
    host: parsedUrl.hostname,
    port: parseInt(parsedUrl.port),
    proxyAuth: `${parsedUrl.auth}`, // usuario:contraseña
  },
});

// Configuración de conexión SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
  agent, // Aquí se aplica el proxy HTTP a la conexión
};

// Función para obtener conexión
const getConnection = async () => {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    throw err;
  }
};

module.exports = { sql, getConnection };
