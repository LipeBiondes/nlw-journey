import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import { dayjs } from '../lib/dayjs' // Importa a biblioteca dayjs para manipulação de datas
import { getMailClient } from '../lib/mail'

import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import nodemailer from 'nodemailer' // Importa a biblioteca nodemailer para envio de e-mails
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites', // Define uma rota POST para '/trips/:tripId/invites'
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid() // Valida que 'tripId' é uma string no formato UUID
        }),
        body: z.object({
          email: z.string().email() // Valida que 'email' é uma string no formato de e-mail
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params // Extrai o tripId dos parâmetros da requisição
      const { email } = request.body // Extrai o e-mail do corpo da requisição

      const trip = await prisma.trip.findUnique({
        where: { id: tripId } // Busca a viagem no banco de dados pelo ID
      })

      if (!trip) {
        throw new ClientError('Trip not found') // Verifica se a viagem existe
      }

      const participant = await prisma.participant.create({
        data: {
          email, // Define o e-mail do participante
          trip_id: tripId // Associa o participante à viagem
        }
      })

      const formattedStartDate = dayjs(trip.starts_at).format('LL') // Formata a data de início
      const formattedEndDate = dayjs(trip.ends_at).format('LL') // Formata a data de término

      const mail = await getMailClient() // Obtém o cliente de e-mail

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm` // Gera o link de confirmação para cada participante

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'oi@plann.er'
        },
        to: participant.email,
        subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`, // Assunto do e-mail
        html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink}">Confirmar viagem</a>
              </p>
              <p></p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
          `.trim() // Corpo do e-mail em HTML
      })

      console.log(nodemailer.getTestMessageUrl(message)) // Loga a URL da mensagem de teste

      return { participantId: participant.id }
    }
  )
}
