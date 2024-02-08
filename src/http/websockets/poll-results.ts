import { FastifyInstance } from "fastify";
import { voting } from "../utils/voting-pub-sub";
import { z } from "zod";

export async function pollResults(app: FastifyInstance) {
  // websocket: true -> Mantem a conexão do frontweb aberta com o servidor até que seja fechada manualmente (f5 ou fechando)

  app.get('/polls/:pollId/results', { websocket: true }, (connection, request) => {
    const getPollParams = z.object({
      pollId: z.string().uuid()
    })

    const { pollId } = getPollParams.parse(request.params)

    // pattern de Pub/Sub -> Publish/Subscribers
    voting.subscribe(pollId, (message) => {
      connection.socket.send(JSON.stringify(message))
    })
  })
}