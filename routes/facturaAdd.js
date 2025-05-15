const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer() // puedes configurarlo más adelante si quieres guardar archivos
const { sql, poolPromise } = require('../config/db')

// GET /services/factura_agregar
router.post('/', upload.none(), async (req, res) => {
//router.post('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Agregar Factura] Token sub:', sub)

  console.log(req.body);
  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }
  const {
	  IdCliente
	, IdProducto
	, Precio
	, Litros		//Cantidad
	, IdMetodoPago
	, IdFormaPago
//	, IdFacturaEstatus
	, IdFacturaTipo
//	, IdTipoReferencia
	, Operador
	, Sellos
	, Almacen
	, IdFacturaCancelada
	, DireccionEntrega
	, Observaciones
	, BillOfLanding
	, ArchivoNombreBOL
	, ArchivoContenidoBOL
	, ArchivoTamanoBOL
	, ArchivoMimeTypeBOL
	// , ArchivoNombreAcuse
	// , ArchivoContenidoAcuse
	// , ArchivoTamanoAcuse
	// , ArchivoMimeTypeAcuse
	// , ArchivoNombrePDF
	// , ArchivoContenidoPDF
	// , ArchivoTamanoPDF
	// , ArchivoMimeTypePDF
	// , ArchivoNombreXML
	// , ArchivoContenidoXML
	// , ArchivoTamanoXML
	// , ArchivoMimeTypeXML
	// , FechaEmision
	// , Activo
	// , Creacion
	// , Creador
	// , Modificacion
	// , Modificador
  } = req.body

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

    // Ejecutar el stored procedure (ejemplo: dbo.ClienteConsultaProc)
    const result = await pool.request()
      .input('UserToken', sql.UniqueIdentifier, userToken)
	  .input('IdCliente', sql.Int, IdCliente) 
	  .input('IdProducto', sql.Int, IdProducto)
	  .input('Precio', sql.Decimal, Precio)
	  .input('Cantidad', sql.Decimal, Litros)
	  .input('IdMetodoPago', sql.Int, IdMetodoPago)
	  .input('IdFormaPago', sql.Int, IdFormaPago)
	  .input('IdFacturaTipo', sql.Int, IdFacturaTipo)
//	  .input('IdTipoReferencia', sql.Int, IdTipoReferencia)
	  .input('Operador', sql.NVarChar(400), Operador)
	  .input('Sellos', sql.NVarChar(400), Sellos)
	  .input('Almacen', sql.NVarChar(400), Almacen)
	  .input('IdFacturaCancelada', sql.Int, IdFacturaCancelada)
	  .input('DireccionEntrega', sql.NVarChar(1000), DireccionEntrega)
	  .input('Observaciones', sql.NVarChar(1000), Observaciones)
      .input('BillOfLanding', sql.NVarChar(1000), BillOfLanding)
	  .input('ArchivoNombreBOL', sql.VarChar(255), ArchivoNombreBOL)
	  .input('ArchivoContenidoBOL', sql.VarBinary(sql.MAX), ArchivoContenidoBOL)
	  .input('ArchivoTamanoBOL', sql.Int, ArchivoTamanoBOL)
	  .input('ArchivoMimeTypeBOL', sql.VarChar(200), ArchivoMimeTypeBOL)
      .output('IdFactura', sql.Int)
      .output('ErrorMsg', sql.VarChar(50))
      .execute('dbo.FacturaAgregarProc')

    const { IdFactura, ErrorMsg } = result.output

    if (ErrorMsg) {
      return res.status(400).json({ error: ErrorMsg })
    }


    res.status(201).json({ id: IdFactura, message: 'Prefactura agregada exitosamente' })

    } catch (err) {
    console.error('❌ Error al agregar prefactura:', err)
    res.status(500).json({ error: 'Error interno al agregar la prefactura' })
  }
})

module.exports = router
