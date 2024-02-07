import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const getPollParams = z.object({
      pollId: z.string().uuid()
    })

    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId
      },
      // include -> serve para trazer dados de relacionamentos de uma entidade
      include: {
        // options: true -> desta maneira retorna TODOS os dados (id, title, pollId)

        // Desta maneira, selecionamos apenas os campos que desejamos
        options: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Retornando o objeto por completo
    return reply.status(200).send({
      poll
    })
  })
}


