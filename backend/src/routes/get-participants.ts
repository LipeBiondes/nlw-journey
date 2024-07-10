import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'

export async function getParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/participants', // Define uma rota GET para '/trips/:tripId/participants'
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid() // Valida que 'tripId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params // Extrai o tripId dos parâmetros da requisição

      const trip = await prisma.trip.findUnique({
        where: { id: tripId }, // Busca a viagem no banco de dados pelo ID
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true
            }
          }
        }
      })

      if (!trip) {
        throw new ClientError('Trip not found') // Verifica se a viagem existe
      }

      return {
        participants: trip.participants
      }
    }
  )
}
