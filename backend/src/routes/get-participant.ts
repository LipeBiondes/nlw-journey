import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'

export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participant/:participantId', // Define uma rota GET para '/trips/:tripId/participants'
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid() // Valida que 'tripId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { participantId } = request.params // Extrai o tripId dos parâmetros da requisição

      const participant = await prisma.participant.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true
        },
        where: { id: participantId } // Busca a viagem no banco de dados pelo ID
      })

      if (!participant) {
        throw new ClientError('Participant not found') // Verifica se a viagem existe
      }

      return {
        participant
      }
    }
  )
}
