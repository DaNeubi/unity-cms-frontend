import Echo from 'laravel-echo'
import { api } from 'boot/axios'

window.Pusher = require('pusher-js')

const laravelEcho = new Echo({
  broadcaster: 'pusher',
  key: process.env.WS_KEY,
  secret: process.env.WS_SECRET,
  appId: process.env.WS_ID,
  wsHost: process.env.WS_SERVER,
  wsPort: process.env.WS_PORT,
  wssPort: process.env.WSS_PORT,
  forceTLS: false,
  encrypted: true,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authorizer: (channel: any) => { // eslint-disable-line
    return {
      authorize: (socketId: any, callback: any) => { // eslint-disable-line
        api.post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name
        })
          .then((response) => {
            callback(false, response.data) // eslint-disable-line
          })
          .catch((error) => {
            callback(true, error) // eslint-disable-line
          })
      }
    }
  }
})

export default laravelEcho
