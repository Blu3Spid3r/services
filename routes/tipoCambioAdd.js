const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/tipo-cambio_agregar
router.post('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Agregar Tipo de Cambio] Token sub:', sub)

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }
  const {
    TipoCambio
  } = req.body

console.log(req.body);

  try {
    const pool = await poolPromise

    // Obtener el UserToken basado en el correo electrónico (sub)
    const resultUser = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query(`SELECT UserToken FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico`)

    if (resultUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const userToken = resultUser.recordset[0].UserToken

    // Ejecutar el stored procedure (ejemplo: dbo.TipoCambioAgregarProc)
    const result = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .input('Valor', sql.Decimal(18,6), TipoCambio)
      .output('IdTipoCambio', sql.Int)
      .output('ErrorMsg', sql.VarChar(50))
      .execute('dbo.TipoCambioAgregarProc')

    const { IdTipoCambio, ErrorMsg } = result.output

    if (ErrorMsg) {
      return res.status(400).json({ error: ErrorMsg })
    }


    res.status(201).json({ id: IdTipoCambio, message: 'Tipo de Cambio agregado exitosamente' })

    } catch (err) {
    console.error('❌ Error al agregar tipo de cambio:', err)
    res.status(500).json({ error: 'Error interno al guardar el tipo de cambio' })
  }
})

module.exports = router
