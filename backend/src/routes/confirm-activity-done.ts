import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function confirmActivityDone(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/activities/:activityId/done', //  Define uma rota GET para '/activities/:activityId/done'
    {
      schema: {
        params: z.object({
          activityId: z.string().uuid() // Valida que o parâmetro 'activityId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { activityId } = request.params // Extrai o activityId dos parâmetros da requisição

      const activity = await prisma.activity.findUnique({
        where: {
          id: activityId // Busca a atividade no banco de dados pelo ID
        }
      })

      if (!activity) {
        throw new ClientError('activity not found') // Verifica se a atividade existe
      }

      if (activity && activity.is_was_done) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${activity.trip_id}`) //  Redireciona se a atividade já foi marcada como feita
      }

      await prisma.activity.update({
        where: {
          id: activity.id // Busca a atividade no banco de dados pelo ID
        },
        data: {
          is_was_done: true //  Atualiza o status da atividade para feita
        }
      })

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${activity.trip_id}`) // Redireciona para a página da viagem
    }
  )
}
