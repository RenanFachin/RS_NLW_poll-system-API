import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { randomUUID } from 'node:crypto'

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid()
    })

    const voteOnPollParams = z.object({
      pollId: z.string().uuid()
    })

    const { pollId } = voteOnPollParams.parse(request.params)
    const { pollOptionId } = voteOnPollBody.parse(request.body)


    // Criando uma validação para verificar se o usuário já possui um cookie com sessionId, caso não tenha, criar uma session
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      // Armazenando cookies (para "evitar" votos duplicados)
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        // path -> quais rotas da aplicação podem acessar esta informação
        // maxAge -> tempo que o cookie vai ficar salvo
        // signed -> usuário não vai conseguir editar manualmente o valor do cookie
        // httpOnly -> somente o backend vai ter acesso a esta informação
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        signed: true,
        httpOnly: true
      })

    }



    // Retornando o objeto por completo
    return reply.status(200).send()
  })
}


