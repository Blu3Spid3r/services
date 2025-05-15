const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/regimen-fiscal
router.get('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [UsoCFDI] Token sub:', sub)

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

    // Ejecutar el stored procedure (ejemplo: dbo.UsoCFDIConsultaProc)
    const usosCFDI = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .execute('dbo.UsoCFDIConsultaProc')

    res.json(usosCFDI.recordset)
  } catch (err) {
    console.error('❌ Error en Cliente:', err)
    res.status(500).json({ error: 'Error interno al consultar usos cfdi' })
  }
})

module.exports = router
