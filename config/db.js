const sql = require('mssql');
const tunnel = require('tunnel-ssh');
require('dotenv').config();

const url = new URL(process.env.QUOTAGUARDSTATIC_URL);
const [user, pass] = url.username ? [url.username, url.password] : url.auth.split(':');

const tunnelConfig = {
  username: user,
  password: pass,
  host: url.hostname,
  port: parseInt(url.port),
  dstHost: process.env.DB_SERVER,
  dstPort: 1433,
  localHost: '127.0.0.1',
  localPort: 14330
};

const poolPromise = new Promise((resolve) => {
  tunnel(tunnelConfig, async (err) => {
    if (err) {
      console.error('❌ Error creando túnel con Quotaguard:', err);
      return resolve(null);
    }

    console.log('🔁 Túnel Quotaguard creado correctamente');

    try {
      const pool = await sql.connect({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: '127.0.0.1',
        port: 14330,
        database: process.env.DB_DATABASE,
        options: {
          appName: 'WCS',
          encrypt: true,
          trustServerCertificate: true
        }
      });
      console.log('✅ Conectado a SQL Server a través del túnel');
      resolve(pool);
    } catch (e) {
      console.error('❌ Error conectando a SQL Server:', e);
      resolve(null);
    }
  });
});

module.exports = {
  sql,
  poolPromise
};
