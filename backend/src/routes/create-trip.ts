import { FastifyInstance } from 'fastify' // Importa o tipo FastifyInstance do framework Fastify
import { ZodTypeProvider } from 'fastify-type-provider-zod' // Importa o provedor de tipos Zod para validação de esquemas no Fastify
import nodemailer from 'nodemailer' // Importa a biblioteca nodemailer para envio de e-mails
import { dayjs } from '../lib/dayjs' // Importa a biblioteca dayjs para manipulação de datas
import z from 'zod' // Importa a biblioteca Zod para validação de esquemas
import { prisma } from '../lib/prisma' // Importa o cliente Prisma para interação com o banco de dados
import { getMailClient } from '../lib/mail' // Importa uma função para obter um cliente de e-mail configurado
import { ClientError } from '../errors/client-error'

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips', // Define uma rota POST para '/trips'
    {
      schema: {
        body: z.object({
          destination: z.string().min(4), // Valida que 'destination' é uma string com no mínimo 4 caracteres
          starts_at: z.coerce.date(), // Valida que 'starts_at' é uma data
          ends_at: z.coerce.date(), // Valida que 'ends_at' é uma data
          owner_name: z.string().min(4), // Valida que 'owner_name' é uma string com no mínimo 4 caracteres
          owner_email: z.string().email(), // Valida que 'owner_email' é um e-mail válido
          emails_to_invite: z.array(z.string().email()) // Valida que 'emails_to_invite' é um array de e-mails válidos
        }),
        response: {
          200: z.object({
            tripId: z.string() // Valida que a resposta de sucesso contém um 'tripId' que é uma string
          })
        }
      }
    },
    async (request, reply) => {
      const {
        destination,
        starts_at,
        ends_at,
        owner_email,
        owner_name,
        emails_to_invite
      } = request.body // Extrai os dados do corpo da requisição

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError('Invalid trip start date.') // Verifica se a data de início da viagem é no passado
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new ClientError('Invalid trip end date.') // Verifica se a data de término é antes da data de início
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: [
                {
                  email: owner_email,
                  name: owner_name,
                  is_owner: true,
                  is_confirmed: true // Cria um participante para o dono da viagem
                },
                ...emails_to_invite.map(email => {
                  return {
                    email // Cria participantes para cada e-mail convidado
                  }
                })
              ]
            }
          }
        }
      })

      const formattedStartDate = dayjs(starts_at).format('LL') // Formata a data de início
      const formattedEndDate = dayjs(ends_at).format('LL') // Formata a data de término

      const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm` // Gera o link de confirmação da viagem

      const mail = await getMailClient() // Obtém o cliente de e-mail

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'test@plann.er'
        },
        to: {
          name: owner_name,
          address: owner_email
        },
        subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`, // Assunto do e-mail
        html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">
            Confirmar viagem
            </a>
          </p>
          <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
        </div>
      `.trim() // Corpo do e-mail em HTML
      })

      console.log(nodemailer.getTestMessageUrl(message)) // Loga a URL da mensagem de teste

      return reply.send({
        tripId: trip.id // Retorna o ID da viagem criada na resposta
      })
    }
  )
}
