import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { dayjs } from '../lib/dayjs' // Importa a biblioteca dayjs para manipulação de datas
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trips/:tripId', // Define uma rota PUT para '/trips/:tripId'
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid() // Valida que 'tripId' é uma string no formato
        }),
        body: z.object({
          destination: z.string().min(4), // Valida que 'destination' é uma string com no mínimo 4 caracteres
          starts_at: z.coerce.date(), // Valida que 'starts_at' é uma data
          ends_at: z.coerce.date() // Valida que 'ends_at' é uma data
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params // Extrai o tripId dos parâmetros da requisição
      const { destination, starts_at, ends_at } = request.body // Extrai os dados do corpo da requisição

      const trip = await prisma.trip.findUnique({
        where: { id: tripId } // Busca a viagem no banco de dados pelo ID
      })

      if (!trip) {
        throw new Error('Trip not found') // Verifica se a viagem existe
      }

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error('Invalid trip start date.') // Verifica se a data de início da viagem é no passado
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error('Invalid trip end date.') // Verifica se a data de término é antes da data de início
      }

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId }, // Atualiza a viagem no banco de dados
        data: {
          destination,
          starts_at,
          ends_at
        }
      })

      return reply.send({
        tripId: updatedTrip.id // Envia a resposta com o ID da viagem atualizada
      })
    }
  )
}
