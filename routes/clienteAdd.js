const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')

// GET /services/cliente
router.post('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Agregar Cliente] Token sub:', sub)

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }
  const {
    Nombre,
    RFC,
    CorreoElectronico,
    CodigoPostal,
    RegimenFiscal,
    UsoCFDI,
    IdPais,
    Estado,
    Municipio,
    Ciudad,
    Colonia,
    Calle,
    numInterior,
    numExterior
  } = req.body

console.log(req.body);

  try {
    const pool = await poolPromise

    // Obtener el UserToken basado en el correo electrónico (sub)
    const resultUser = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query(`SELECT IdUsuario FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico`)

    if (resultUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const idUsuario = resultUser.recordset[0].IdUsuario

    // Ejecutar el stored procedure (ejemplo: dbo.ClienteConsultaProc)
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('RFC', sql.VarChar(13), RFC)
      .input('CorreoElectronico', sql.NVarChar(100), CorreoElectronico)
      .input('CodigoPostal', sql.VarChar(20), CodigoPostal)
      .input('RegimenFiscal', sql.NVarChar(10), RegimenFiscal)
      .input('UsoCFDI', sql.NVarChar(10), UsoCFDI)
      .input('IdPais', sql.Int, IdPais)
      .input('Estado', sql.VarChar(5), Estado)
      .input('Municipio', sql.VarChar(100), Municipio)
      .input('Ciudad', sql.VarChar(100), Ciudad)
      .input('Colonia', sql.VarChar(100), Colonia)
      .input('Calle', sql.VarChar(100), Calle)
      .input('NumInterior', sql.VarChar(20), numInterior)
      .input('NumExterior', sql.VarChar(20), numExterior)
      .input('Creador', sql.Int, idUsuario)
      .output('IdCliente', sql.Int)
      .output('ErrorMsg', sql.VarChar(50))
      .execute('dbo.ClienteAgregarProc')

    const { IdCliente, ErrorMsg } = result.output

    if (ErrorMsg) {
      return res.status(400).json({ error: ErrorMsg })
    }


    res.status(201).json({ id: IdCliente, message: 'Cliente agregado exitosamente' })

    } catch (err) {
    console.error('❌ Error al agregar cliente:', err)
    res.status(500).json({ error: 'Error interno al guardar el cliente' })
  }
})

module.exports = router
