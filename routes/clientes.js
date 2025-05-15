const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/clientes
router.get('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Clientes] Token sub:', sub)

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }

  try {
    const pool = await poolPromise

    const userResult = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query('SELECT UserToken FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico')

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const userToken = userResult.recordset[0].UserToken

    const clientes = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .execute('dbo.ClienteConsultaProc')

    res.json(clientes.recordset)
  } catch (err) {
    console.error('❌ Error al consultar clientes:', err)
    res.status(500).json({ error: 'Error interno al consultar clientes' })
  }
})

module.exports = router
