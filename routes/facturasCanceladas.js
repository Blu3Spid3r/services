const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/facturas
router.get('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Facturas Canceladas] Token sub:', sub)

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }

  try {
    const pool = await poolPromise

    // Obtener el UserToken basado en el correo electrónico (sub)
    const result = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query('SELECT UserToken FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico')

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const userToken = result.recordset[0].UserToken

    const facturas = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .execute('dbo.FacturaCanceladaConsultaProc')

    res.json(facturas.recordset)
  } catch (err) {
    console.error('❌ Error en Facturas Canceladas:', err)
    res.status(500).json({ error: 'Error interno al consultar facturas canceladas' })
  }
})

module.exports = router
