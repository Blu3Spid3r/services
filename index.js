const express = require('express')
const cors = require('cors')
const sql = require('mssql')
const { expressjwt: jwt } = require('express-jwt')
const jwksRsa = require('jwks-rsa')
require('dotenv').config()

const http = require('http');
const { Server } = require('socket.io');

const dashboardRoutes = require('./routes/dashboard') 
const dashboardBackofficeRoutes = require('./routes/dashboardBackoffice') 
const estadoCuentaRoutes = require('./routes/estadoCuenta')

/* Clientes */
const clientesRoutes = require('./routes/clientes')
const clienteRoutes = require('./routes/cliente')
const clienteAddRoutes = require('./routes/clienteAdd')
const clienteEditRoutes = require('./routes/clienteEdit')

/* Facturas */
const facturasRoutes = require('./routes/facturas')
const facturaRoutes = require('./routes/factura')
const facturaAddRoutes = require('./routes/facturaAdd')
const facturasPorVencerRoutes = require('./routes/facturasPorVencer')
const facturasCanceladasRoutes = require('./routes/facturasCanceladas')
const facturaTiposRoutes = require('./routes/facturaTipos')

/* Depósitos */ 
const depositosRoutes = require('./routes/depositos')
const depositoAddRoutes = require('./routes/depositoAdd')
const depositoTiposRoutes = require('./routes/depositoTipos')

/* Documentos*/ 
const documentosRoutes = require('./routes/documentos')


const acuerdoComercialRoutes = require('./routes/acuerdoComercial')

/* Catálogos */
const productosRoutes = require('./routes/productos')
const metodosPagoRoutes = require('./routes/metodosPago')
const formasPagoRoutes = require('./routes/formasPago')
const tiposCambioRoutes = require('./routes/tiposCambio')
const tipoCambioAddRoutes = require('./routes/tipoCambioAdd')
const skuTiposRoutes = require('./routes/skuTipos')
const regimenFiscalRoutes = require('./routes/regimenFiscal')
const estadoRoutes = require('./routes/estado')
const usoCFDIRoutes = require('./routes/usoCFDI')

/* Socio Comercial */
const sociosComercialesRoutes = require('./routes/sociosComerciales')
const socioComercialRoutes = require('./routes/socioComercial')
const socioComercialAddRoutes = require('./routes/socioComercialAdd')
const socioComercialEditRoutes = require('./routes/socioComercialEdit')


/* Chat*/ 
const chatRoutes = require('./routes/chat');

// Configuración de Express
const app = express();
app.use(cors());
app.use(express.json());

// Crear servidor HTTP y conectar con Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});


// Autenticación con Auth0
const authMiddleware = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  clockTolerance: 60 // <-- agrega esta línea (segundos de tolerancia)
})



app.use('/services/dashboard', authMiddleware, dashboardRoutes)
app.use('/services/dashboard-backoffice', authMiddleware, dashboardBackofficeRoutes)

app.use('/services/estado-cuenta', authMiddleware, estadoCuentaRoutes)

app.use('/services/clientes', authMiddleware, clientesRoutes)
app.use('/services/cliente', authMiddleware, clienteRoutes)
app.use('/services/cliente_agregar', authMiddleware, clienteAddRoutes)
app.use('/services/cliente_editar', authMiddleware, clienteEditRoutes)

app.use('/services/facturas', authMiddleware, facturasRoutes)
app.use('/services/factura', authMiddleware, facturaRoutes)
app.use('/services/facturas-canceladas', authMiddleware, facturasCanceladasRoutes)
app.use('/services/facturas-porvencer', authMiddleware, facturasPorVencerRoutes)
app.use('/services/factura_agregar', authMiddleware, facturaAddRoutes)
app.use('/services/factura-tipos', authMiddleware, facturaTiposRoutes)

app.use('/services/depositos', authMiddleware, depositosRoutes)
app.use('/services/deposito_agregar', authMiddleware, depositoAddRoutes)
app.use('/services/deposito-tipos', authMiddleware, depositoTiposRoutes)

app.use('/services/documentos', authMiddleware, documentosRoutes)



app.use('/services/socios-comerciales', authMiddleware, sociosComercialesRoutes)
app.use('/services/socio-comercial', authMiddleware, socioComercialRoutes)
app.use('/services/socio-comercial_agregar', authMiddleware, socioComercialAddRoutes)
app.use('/services/socio-comercial_editar', authMiddleware, socioComercialEditRoutes)


app.use('/services/productos', authMiddleware, productosRoutes)
app.use('/services/metodos-pago', authMiddleware, metodosPagoRoutes)
app.use('/services/formas-pago', authMiddleware, formasPagoRoutes)
app.use('/services/tipos-cambio', authMiddleware, tiposCambioRoutes)
app.use('/services/tipo-cambio_agregar', authMiddleware, tipoCambioAddRoutes)

app.use('/services/sku-tipos', authMiddleware, skuTiposRoutes)
app.use('/services/regimen-fiscal', authMiddleware, regimenFiscalRoutes)
app.use('/services/acuerdo-comercial', authMiddleware, acuerdoComercialRoutes)
app.use('/services/estado', authMiddleware, estadoRoutes)
app.use('/services/uso-cfdi', authMiddleware, usoCFDIRoutes)

app.use('/services/chat', authMiddleware, chatRoutes);


// SOCKET.IO - Chat
const usuarios = new Map();

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('join', ({ userId }) => {
    usuarios.set(userId, socket.id);
    socket.join(userId); // Sala individual
  });

  socket.on('joinGrupo', ({ grupoId }) => {
    socket.join(grupoId); // Sala grupal
  });

  socket.on('mensaje', ({ from, to, texto, grupoId }) => {
    const payload = { from, texto, enviadoEn: new Date(), grupoId };

    if (grupoId) {
      io.to(grupoId).emit('mensaje', payload);
    } else {
      io.to(to).emit('mensaje', payload);
    }

    // Aquí puedes guardar el mensaje en SQL Server más adelante
  });

  socket.on('disconnect', () => {
    for (let [k, v] of usuarios.entries()) {
      if (v === socket.id) usuarios.delete(k);
    }
  });
});



// Conexión SQL Server
/*const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    appName: 'WCS',
    encrypt: true,
    trustServerCertificate: false,
  }
}

sql.connect(sqlConfig).then(() => {
  console.log('Conectado a SQL Server.')
}).catch(err => {
  console.error('Error de conexión a SQL Server:', err)
})*/

// Escuchar por HTTP + Socket.IO
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`API y Chat escuchando en http://localhost:${port}`));
