import fastify from 'fastify'
// Plugins Fastify
import cookie from '@fastify/cookie'
import websocket from '@fastify/websocket'
// Rotas
import { voteOnPoll } from './routes/vote-on-poll'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { pollResults } from './websockets/poll-results'

const app = fastify()

app.register(cookie, {
  secret: "polls-app-nlw-cookiesecret", // for cookies signature
  hook: 'onRequest',
})

app.register(websocket)

// Requisições HTTP
app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

// Requisição WebSocket
app.register(pollResults)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP Server running!')
})