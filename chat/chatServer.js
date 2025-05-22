// servicios/chat/chatServer.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const usuarios = new Map(); // Mapear userId a socketId

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('join', ({ userId }) => {
    usuarios.set(userId, socket.id);
    socket.join(userId); // sala privada
  });

  socket.on('mensaje', ({ from, to, texto, grupoId }) => {
    if (grupoId) {
      io.to(grupoId).emit('mensaje', { from, texto, grupoId });
    } else {
      io.to(to).emit('mensaje', { from, texto });
    }
    // Aquí puedes guardar en SQL Server
  });

  socket.on('joinGrupo', ({ grupoId }) => {
    socket.join(grupoId);
  });

  socket.on('disconnect', () => {
    usuarios.forEach((value, key) => {
      if (value === socket.id) usuarios.delete(key);
    });
  });
});

server.listen(3001, () => console.log('Servidor de chat corriendo en puerto 3001'));
