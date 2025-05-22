const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer() // puedes configurarlo más adelante si quieres guardar archivos
const { sql, poolPromise } = require('../config/db')

// GET /services/deposito_agregar
//router.post('/', upload.none(), async (req, res) => {
router.post('/', upload.single('Comprobante'), async (req, res) => {
  const ArchivoComprobante = req.file

  const ArchivoNombre = ArchivoComprobante?.originalname || null
  const ArchivoContenido = ArchivoComprobante?.buffer || null
  const ArchivoTamano = ArchivoComprobante?.size || null
  const ArchivoMimeType = ArchivoComprobante?.mimetype || null
  
    const sub = req.auth?.sub
  console.log('🔐 [Agregar Deposito] Token sub:', sub)

  console.log(req.body);
  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }
  const {
	  IdDeposito
	, IdDepositoTipo
  , DepositoTipo
	, Depositante
	, Monto
	, IdSocioComercial
	, ClaveRastreo
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

    // Ejecutar el stored procedure (ejemplo: dbo.DepositoConsultaProc)
    const result = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
      .input('IdDepositoTipo', sql.Int, DepositoTipo) 
	    .input('Depositante', sql.NVarChar(200), Depositante)
	    .input('ArchivoNombre', sql.VarChar(255), ArchivoNombre)
	    .input('ArchivoContenido', sql.VarBinary(sql.MAX), ArchivoContenido)
	    .input('ArchivoTamano', sql.Int, ArchivoTamano)
	    .input('ArchivoMimeType', sql.VarChar(200), ArchivoMimeType)
	    .input('Monto', sql.Decimal, Monto)
	    .input('ClaveRastreo', sql.VarChar(50), ClaveRastreo)
      .output('IdDeposito', sql.Int)
      .output('ErrorMsg', sql.VarChar(50))
      .execute('dbo.DepositoAgregarProc')

    const { IdDeposito, ErrorMsg } = result.output

    if (ErrorMsg) {
      return res.status(400).json({ error: ErrorMsg })
    }

    res.status(201).json({ id: IdDeposito, message: 'Deposito agregado exitosamente' })

    } catch (err) {
    console.error('❌ Error al agregar deposito:', err)
    res.status(500).json({ error: 'Error interno al agregar deposito' })
  }
})

module.exports = router
