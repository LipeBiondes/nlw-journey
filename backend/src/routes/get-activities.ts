import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import { dayjs } from '../lib/dayjs' // Importa a biblioteca dayjs para manipulação de datas
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'

export async function getActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/activities', // Define uma rota GET para '/trips/:tripId/activities'
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
          activities: {
            orderBy: {
              occurs_at: 'asc'
            }
          }
        }
      })

      if (!trip) {
        throw new ClientError('Trip not found') // Verifica se a viagem existe
      }

      const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
        dayjs(trip.starts_at),
        'days'
      ) // Calcula a diferença em dias entre a data de início e a data de término da viagem

      const activities = Array.from({
        length: differenceInDaysBetweenTripStartAndEnd + 1
      }).map((_, index) => {
        const date = dayjs(trip.starts_at).add(index, 'days') // Calcula a data da atividade
        return {
          date: date.toDate(),
          activities: trip.activities.filter(
            activity => {
              return dayjs(activity.occurs_at).isSame(date, 'day')
            } // Filtra as atividades que ocorrem na data calculada
          )
        }
      })

      reply.send({ activities }) // Envia a resposta com as atividades associadas à viagem
    }
  )
}
