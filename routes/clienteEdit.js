
const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// PUT /services/cliente/:id
router.put('/:id', async (req, res) => {
  const sub = req.auth?.sub
  const { id } = req.params

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }

  const {
    nombre, rfc, correo, cp, regimen,
    usoCfdi, estado, municipio, ciudad,
    colonia, calle, numExterior, numInterior,
    emailsAdicionales
  } = req.body

  try {
    const pool = await poolPromise

    const resultUser = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query('SELECT IdUsuario FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico')

    if (resultUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const idUsuario = resultUser.recordset[0].IdUsuario

    const result = await pool.request()
      .input('IdCliente', sql.Int, id)
      .input('Nombre', sql.NVarChar(100), nombre)
      .input('RFC', sql.VarChar(13), rfc)
      .input('Correo', sql.NVarChar(100), correo)
      .input('CodigoPostal', sql.VarChar(10), cp)
      .input('RegimenFiscal', sql.VarChar(10), regimen)
      .input('UsoCFDI', sql.VarChar(10), usoCfdi)
      .input('Estado', sql.VarChar(100), estado)
      .input('Municipio', sql.VarChar(100), municipio)
      .input('Ciudad', sql.VarChar(100), ciudad)
      .input('Colonia', sql.VarChar(100), colonia)
      .input('Calle', sql.VarChar(100), calle)
      .input('NumeroExterior', sql.VarChar(10), numExterior)
      .input('NumeroInterior', sql.VarChar(10), numInterior)
      .input('Modificador', sql.Int, idUsuario)
      .output('ErrorMsg', sql.VarChar(100))
      .execute('dbo.ClienteEditarProc')

    const { ErrorMsg } = result.output

    if (ErrorMsg) {
      return res.status(400).json({ error: ErrorMsg })
    }

    res.status(200).json({ message: 'Cliente actualizado exitosamente' })

  } catch (err) {
    console.error('❌ Error al actualizar cliente:', err)
    res.status(500).json({ error: 'Error interno al actualizar cliente' })
  }
})

module.exports = router
