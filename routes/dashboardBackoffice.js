const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/dashboard
router.get('/', async (req, res) => {
  console.log('🔐 Headers recibidos:', req.headers)
  const sub = req.auth?.sub
  console.log('🟡 Token decodificado recibido (sub):', sub)  // 👈 Verifica que Auth0 esté decodificando

  if (!sub) {
    console.warn('🔴 No se recibió sub desde el token')
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }

  try {
    const pool = await poolPromise

    // Buscar el UserToken en base al 'sub' de Auth0
    const result = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query(`SELECT UserToken FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico`)

    if (result.recordset.length === 0) {
      console.warn('🟠 Usuario no encontrado en base de datos para:', sub)
      return res.status(404).json({ error: 'Usuario no encontrado en base de datos' })
    }

    const userToken = result.recordset[0].UserToken
    console.log('🟢 UserToken obtenido:', userToken)

    // Ejecutar SP con el UserToken
    const indicadores = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .execute('dbo.IndicadoresBackofficeConsultaProc')

    res.json(indicadores.recordset[0] || {})
  } catch (err) {
    console.error('❌ Error en la consulta de indicadores:', err)
    res.status(500).json({ error: 'Error al consultar indicadores del socio' })
  }
})

module.exports = router
