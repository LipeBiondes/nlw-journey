import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { ClientError } from '../errors/client-error'

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/links', // Define uma rota POST para '/trips/:tripId/links'
    {
      schema: {
        body: z.object({
          title: z.string().min(4), // Valida que 'title' é uma string com no mínimo 4 caracteres
          url: z.string().url() // Valida que 'url' é uma string no formato de URL
        }),
        params: z.object({
          tripId: z.string().uuid() // Valida que 'tripId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params // Extrai o tripId dos parâmetros da requisição
      const { title, url } = request.body // Extrai o título e a URL do link do corpo da requisição

      const trip = await prisma.trip.findUnique({
        where: { id: tripId } // Busca a viagem no banco de dados pelo ID
      })

      if (!trip) {
        throw new ClientError('Trip not found') // Verifica se a viagem existe
      }

      const link = await prisma.link.create({
        data: {
          title, // Define o título do link
          url, // Define a URL do link
          trip_id: tripId // Associa o link à viagem
        }
      })

      reply.send({ linkId: link.id }) // Envia a resposta com o ID da atividade criada
    }
  )
}
