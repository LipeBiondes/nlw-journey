import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function confirmParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId/confirm', // Define uma rota GET para '/participants/:participantId/confirm'
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid() // Valida que o parâmetro 'participantId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { participantId } = request.params // Extrai o participantId dos parâmetros da requisição

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId // Busca o participante no banco de dados pelo ID
        }
      })

      if (!participant) {
        throw new ClientError('Participant not found') // Verifica se o participante existe
      }

      if (participant && participant.is_confirmed) {
        return reply.redirect(
          `${env.WEB_BASE_URL}/trips/${participant.trip_id}`
        ) // Redireciona se o participante já está confirmado
      }

      await prisma.participant.update({
        where: {
          id: participantId // Busca o participante no banco de dados pelo ID
        },
        data: {
          is_confirmed: true // Atualiza o status do participante para confirmado
        }
      })

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`) // Redireciona para a página da viagem
    }
  )
}
