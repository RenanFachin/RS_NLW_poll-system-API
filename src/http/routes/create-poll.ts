import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"

export async function createPoll(app: FastifyInstance) {
  app.post('/polls', async (request, reply) => {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(z.string())
    })

    const { title, options } = createPollBody.parse(request.body)

    const poll = await prisma.poll.create({
      data: {
        title,

        // Criando as opções na mesma query da criação da enquete
        options: {
          createMany: {
            data: options.map(option => {
              return {
                title: option,
                // pollId: poll.id -> O id não precisa ser informando quando a maneira de criação é desta forma
              }
            })
          }
        }
      }
    })

    return reply.status(201).send({
      pollId: poll.id
    })
  })
}


