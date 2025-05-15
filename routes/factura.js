
const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/cliente/:id
router.get('/:id', async (req, res) => {
  const sub = req.auth?.sub
  const { id } = req.params

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

    const cliente = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .input('IdFactura', sql.Int, id)
      .execute('dbo.FacturaConsultaProc')

    res.json(cliente.recordset)
  } catch (err) {
    console.error('❌ Error al consultar factura:', err)
    res.status(500).json({ error: 'Error interno al consultar factura' })
  }
})

module.exports = router
