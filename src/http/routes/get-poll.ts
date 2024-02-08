import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { redis } from "../../lib/redis"

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

    if (!poll) {
      return reply.status(400).send({ message: 'Poll not found.' })
    }

    // buscando as informações do redis sobre a enquete
    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES') // 0, -1 -> TODAS OPÇÕES
    /*
    retorno do redis 
     - índice par = id da opção
     - índice impar = quantidade de votos na opção
    [
      'c5657e9f-7ec3-420d-b0c3-55aeec388673',
      '0',
      '9d473c3f-b459-478c-ac05-9aa6d93cf7a5',
      '1'
    ]
    */

    // Ajustando este array para uma nova estrutura
    // Record<tipo da chave, tipo do valor da chave> -> é objeto para o typescript
    const votes = result.reduce((initialObj, resultLine, index) => {
      // Toda vez que o índice encontrado for PAR -> armazenar na variável score a próxima informação do array (que é a quantidade de votos referente a esta opção)
      if (index % 2 === 0) {
        const score = result[index + 1]

        // Adicionando no array inicial as informações de id:score
        Object.assign(initialObj, { [resultLine]: Number(score) })
      }


      return initialObj
    }, {} as Record<string, number>)

    /* 
      agora o retorno é:
      {
        'c5657e9f-7ec3-420d-b0c3-55aeec388673': '0',
        '9d473c3f-b459-478c-ac05-9aa6d93cf7a5': '1'
      }
    */



    // Retornando o objeto por completo
    return reply.status(200).send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map(option => {
          return {
            id: option.id,
            title: option.title,
            // Caso a opção tenha sido votada e exista dentro do retorno do redis, mostrar a quantidade referente, caso contrário, mostrar 0
            score: (option.id in votes) ? votes[option.id] : 0
          }
        })
      }
    })
  })
}


