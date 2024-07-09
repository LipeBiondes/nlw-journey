import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import { dayjs } from '../lib/dayjs' // Importa a biblioteca dayjs para manipulação de datas
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import { getMailClient } from '../lib/mail' // Importa uma função para obter um cliente de e-mail configurado
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import nodemailer from 'nodemailer' // Importa a biblioteca nodemailer para envio de e-mails

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm', // Define uma rota GET para '/trips/:tripId/confirm'
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid() // Valida que o parâmetro 'tripId' é uma string no formato UUID
        })
      }
    },
    async (request, reply) => {
      const { tripId } = request.params // Extrai o tripId dos parâmetros da requisição

      // Lógica para confirmar a viagem
      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId
        },
        include: {
          participants: {
            where: {
              is_owner: false // Inclui participantes que não são donos
            }
          }
        }
      })

      if (!trip) {
        throw new Error('Trip not found') // Verifica se a viagem existe
      }

      if (trip && trip.is_confirmed) {
        return reply.redirect(`http://localhost:3000/trips/${tripId}`) // Redireciona se a viagem já está confirmada
      }

      await prisma.trip.update({
        where: {
          id: tripId
        },
        data: {
          is_confirmed: true // Atualiza o status da viagem para confirmada
        }
      })

      const formattedStartDate = dayjs(trip.starts_at).format('LL') // Formata a data de início
      const formattedEndDate = dayjs(trip.ends_at).format('LL') // Formata a data de término

      const mail = await getMailClient() // Obtém o cliente de e-mail

      await Promise.all(
        trip.participants.map(async participant => {
          const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm` // Gera o link de confirmação para cada participante

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
        })
      )

      return reply.redirect(`http://localhost:3000/trips/${tripId}`) // Redireciona para a página da viagem
    }
  )
}
