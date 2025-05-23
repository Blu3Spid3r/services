// test-jwks.js

const https = require('https');

const jwksUrl = 'https://dev-s1t26kd8kihafgab.us.auth0.com/.well-known/jwks.json';

https.get(jwksUrl, (res) => {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error(`Solicitud fallida.\nCódigo de estado: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error(`Tipo de contenido inválido.\nEsperado: application/json pero recibió: ${contentType}`);
  }

  if (error) {
    console.error(error.message);
    res.resume(); // descarta los datos para liberar memoria
    return;
  }

  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log('✔️ JWKS recibido correctamente:\n', JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.error('❌ Error al parsear la respuesta JSON:', e.message);
    }
  });
}).on('error', (e) => {
  console.error(`❌ Error en la solicitud HTTPS: ${e.message}`);
});
