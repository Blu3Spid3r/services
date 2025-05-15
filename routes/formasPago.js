const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/formas-pago
router.get('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Formas Pago] Token sub:', sub)

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }

  try {
    const pool = await poolPromise

    // Obtener el UserToken basado en el correo electrónico (sub)
    const result = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query(`SELECT UserToken FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico`)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const userToken = result.recordset[0].UserToken

    // Ejecutar el stored procedure (ejemplo: dbo.FormaPagoConsultaProc)
    const formasPago = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .execute('dbo.FormaPagoConsultaProc')

    res.json(formasPago.recordset)
  } catch (err) {
    console.error('❌ Error en Formas Pago:', err)
    res.status(500).json({ error: 'Error interno al consultar formas pago' })
  }
})

module.exports = router
