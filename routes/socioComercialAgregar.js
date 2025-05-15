
// routes/socioComercialAgregar.js
const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')
const { registrarUsuarioAuth0 } = require('../utils/auth0')  // ✅ importación correcta

// POST /services/socio-comercial_agregar
router.post('/', async (req, res) => {
  const sub = req.auth?.sub
  console.log('🔐 [Agregar Socio Comercial] Token sub:', sub)

  if (!sub) {
    return res.status(401).json({ error: 'Token inválido o ausente' })
  }

  const {
    nombre,
    rfc,
    correo,
    idPais,
    idEstado,
    municipio,
    ciudad,
    colonia,
    calle,
    numInterior,
    numExterior
  } = req.body

  try {
    const pool = await poolPromise

    // Obtener el Id del usuario que está haciendo la creación
    const resultUser = await pool.request()
      .input('CorreoElectronico', sql.VarChar, sub)
      .query(`SELECT IdUsuario FROM dbo.Usuario WHERE CorreoElectronico = @CorreoElectronico`)

    if (resultUser.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const idUsuario = resultUser.recordset[0].IdUsuario

    // Ejecutar el procedimiento almacenado para agregar el socio comercial
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), nombre)
      .input('RFC', sql.VarChar(13), rfc)
      .input('CorreoElectronico', sql.NVarChar(100), correo)
      .input('IdPais', sql.Int, idPais)
      .input('IdEstado', sql.Int, idEstado)
      .input('Municipio', sql.VarChar(100), municipio)
      .input('Ciudad', sql.VarChar(100), ciudad)
      .input('Colonia', sql.VarChar(100), colonia)
      .input('Calle', sql.VarChar(100), calle)
      .input('NumInterior', sql.VarChar(10), numInterior)
      .input('NumExterior', sql.VarChar(10), numExterior)
      .input('Creador', sql.Int, idUsuario)
      .output('IdSocioComercial', sql.Int)
      .output('ErrorMsg', sql.VarChar(50))
      .execute('dbo.SocioComercialAgregarProc')

    const { IdSocioComercial, ErrorMsg } = result.output

    if (ErrorMsg) {
      return res.status(400).json({ error: ErrorMsg })
    }

    // Registro en Auth0
    try {
      const nuevoUsuario = await registrarUsuarioAuth0({ email: correo })
      console.log('🧑‍💻 Usuario creado en Auth0:', nuevoUsuario.user_id)
    } catch (authErr) {
      console.error('⚠️ Socio guardado, pero fallo al crear usuario en Auth0:', authErr.message)
      return res.status(201).json({
        id: IdSocioComercial,
        warning: 'Socio guardado, pero hubo un error al registrar el usuario en Auth0',
      })
    }

    res.status(201).json({ id: IdSocioComercial, message: 'Socio Comercial agregado exitosamente' })

  } catch (err) {
    console.error('❌ Error al agregar socio comercial:', err)
    res.status(500).json({ error: 'Error interno al guardar el socio comercial' })
  }
})

module.exports = router
