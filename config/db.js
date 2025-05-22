const tunnel = require('tunnel-ssh');
const sql = require('mssql');

const tunnelConfig = {
  username: 'lt1b4fssa5p9jz',
  password: 'p1auhylsk32nij9iexnsfso8bo',
  host: 'us-east-static-01.quotaguard.com',
  port: 9293,
  dstHost: 'alesgar.database.windows.net',
  dstPort: 1433,
  localHost: '189.153.89.213',
  localPort: 14330,
  keepAlive: true
};

const dbConfig = {
  user: 'alesgar',
  password: '1ndU5tr135',
  server: '189.153.89.213',
  port: 14330,
  database: 'WCS',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

module.exports = new Promise((resolve, reject) => {
  tunnel(tunnelConfig, (err, server) => {
    if (err) {
      console.error('❌ Error al establecer el túnel:', err);
      return reject(err);
    }

    sql.connect(dbConfig)
        .then(pool => {
          console.log('✅ Conexión establecida a Azure SQL a través de QuotaguardStatic');
          resolve(pool);
        })
        .catch(sqlErr => {
          console.error('❌ Error al conectar con SQL Server:', sqlErr);
          reject(sqlErr);
        });
  });
});
