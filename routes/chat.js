// routes/chat.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Obtener mensajes de un grupo usando SP ChatMensajeConsultaProc
router.get('/grupo/:grupoId', async (req, res) => {
  const { grupoId } = req.params;
  try {
    const result = await sql.request()
      .input('GrupoId', sql.UniqueIdentifier, grupoId)
      .execute('dbo.ChatMensajeConsultaProc');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error obteniendo mensajes del grupo:', err);
    res.status(500).json({ error: 'Error al consultar mensajes' });
  }
});

// Enviar mensaje usando SP ChatMensajeAgregarProc
router.post('/enviar', async (req, res) => {
  const { grupoId, from, texto } = req.body;
  try {
    await sql.request()
      .input('GrupoId', sql.UniqueIdentifier, grupoId)
      .input('RemitenteId', sql.UniqueIdentifier, from)
      .input('Texto', sql.NVarChar(sql.MAX), texto)
      .execute('dbo.ChatMensajeAgregarProc');
    res.status(200).json({ status: 'Mensaje guardado' });
  } catch (err) {
    console.error('Error guardando mensaje:', err);
    res.status(500).json({ error: 'No se pudo guardar el mensaje' });
  }
});

// Obtener lista de grupos del usuario usando SP ChatGrupoConsultaProc
router.get('/grupos/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await sql.request()
      .input('UsuarioId', sql.UniqueIdentifier, userId)
      .execute('dbo.ChatGrupoUsuarioConsultaProc');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error obteniendo grupos:', err);
    res.status(500).json({ error: 'Error al consultar grupos' });
  }
});

module.exports = router;
