import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import { dayjs } from '../lib/dayjs' // Importa a biblioteca dayjs para manipulação de datas
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activities', // Define uma rota POST para '/trips/:tripId/activities'
    {
      schema: {
        body: z.object({
          title: z.string().min(4), // Valida que 'title' é uma string com no mínimo 4 caracteres
          occurs_at: z.coerce.date() // Valida que 'occurs_at' é uma data
        }),
        params: z.object({
          tripId: z.string().uuid() // Valida que 'tripId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params // Extrai o tripId dos parâmetros da requisição
      const { title, occurs_at } = request.body // Extrai o título e a data da atividade do corpo da requisição

      const trip = await prisma.trip.findUnique({
        where: { id: tripId } // Busca a viagem no banco de dados pelo ID
      })

      if (!trip) {
        throw new ClientError('Trip not found') // Verifica se a viagem existe
      }

      if (dayjs(occurs_at).isBefore(trip.starts_at)) {
        throw new ClientError('Invalid activity date') // Verifica se a data da atividade é antes da data de início da viagem
      }

      if (dayjs(occurs_at).isAfter(trip.ends_at)) {
        throw new ClientError('Invalid activity date') // Verifica se a data da atividade é depois da data de término da viagem
      }

      const activity = await prisma.activity.create({
        data: {
          title, // Define o título da atividade
          occurs_at, // Define a data da atividade
          trip_id: tripId // Associa a atividade à viagem
        }
      })

      reply.send({ activityId: activity.id }) // Envia a resposta com o ID da atividade criada
    }
  )
}
