import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { randomUUID } from 'node:crypto'
import { redis } from "../../lib/redis"

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

    if (sessionId) {
      // Verificando se o usuário já votou nesta enquete (pollId)
      // Motivo: Evitar que o banco de dados seja o responsável por garantir a regra de negócio
      const userPreviousVoteOnThisPoll = await prisma.vote.findUnique({
        where: {
          // sessionId_pollId -> é criado devido a constraint @@unique (forma performática para acessar registros específicos)
          sessionId_pollId: {
            sessionId,
            pollId
          }
        }
      })


      // Caso o usuário já tenha votado nesta enquete
      // Caso o voto do usuário seja diferente do voto que ele esteja enviando agora
      if (userPreviousVoteOnThisPoll && userPreviousVoteOnThisPoll.pollOptionId !== pollOptionId) {
        // Apagar o voto anterior e registrar o novo
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnThisPoll.id
          }
        })

        // quando o usuário troca o voto, é necessário remover a pontuação antiga no REDIS
        //userPreviousVoteOnThisPoll.pollOptionId -> é a opção antiga do usuário
        // pollOptionId -> seria a nova opção
        await redis.zincrby(pollId, -1, userPreviousVoteOnThisPoll.pollOptionId)

      } else if (userPreviousVoteOnThisPoll) {
        return reply.status(400).send({
          message: 'You already voted on this poll.'
        })
      }
    }


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

    // Criando o voto
    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId
      }
    })

    // // Salvando em "cache" as informações da votação
    await redis.zincrby(pollId, 1, pollOptionId) // incrementa em 1 o ranking de pollOptionId dentro da enquete pollId


    // Retornando o objeto por completo
    return reply.status(200).send()
  })
}


