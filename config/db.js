const sql = require('mssql')
require('dotenv').config()

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    appName: 'WCS',
    encrypt:true,
    trustServerCertificate: false,
  },
}

console.log('🧪 Configuración de conexión:', config)

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('📦 Conectado a SQL Server')
    return pool
  })
  .catch(err => console.error('Error al conectar a SQL Server', err))

module.exports = {
  sql,
  poolPromise
}
