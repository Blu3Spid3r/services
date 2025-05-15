
// utils/auth0.js
const axios = require('axios')
require('dotenv').config()

async function getManagementToken() {
  try {
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    })
    return response.data.access_token
  } catch (err) {
    console.error('❌ Error al obtener token de Auth0:', err.response?.data || err.message)
    throw new Error('Error al autenticar con Auth0')
  }
}

async function registrarUsuarioAuth0({ email, tipo = 'socioComercial' }) {
  const accessToken = await getManagementToken()

  const userPayload = {
    connection: process.env.AUTH0_CONNECTION,
    email,
    email_verified: false,
    verify_email: false,
    app_metadata: { tipo }
  }

  try {
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      userPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    const userId = response.data.user_id
    console.log('✅ Usuario pre-creado:', userId)

    // Enviar invitación (link de cambio de contraseña)
    await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change`,
      {
        user_id: userId,
        result_url: 'https://tusitio.com/socios/login',
        mark_email_as_verified: true
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    console.log('📨 Invitación enviada a:', email)
    return response.data
  } catch (err) {
    console.error('❌ Error en registro/invitación:', err.response?.data || err.message)
    throw new Error('Error al invitar usuario en Auth0')
  }
}

module.exports = { registrarUsuarioAuth0 }
