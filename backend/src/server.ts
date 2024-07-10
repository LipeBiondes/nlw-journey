import fastify from 'fastify' // Importa o framework Fastify para criar o servidor
import cors from '@fastify/cors' // Importa o plugin de CORS para habilitar requisições de diferentes origens
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod' // Importa os compiladores de serializer e validator do Zod para usar com Fastify

import { createTrip } from './routes/create-trip' // Importa a rota para criação de viagem
import { confirmTrip } from './routes/confirm-trip' // Importa a rota para confirmação de viagem
import { confirmParticipants } from './routes/confirm-participant' // Importa a rota para confirmação de participantes
import { createActivity } from './routes/create-activity'
import { getActivity } from './routes/get-activities'
import { createLink } from './routes/create-link'
import { getLinks } from './routes/get-links'
import { getParticipants } from './routes/get-participants'
import { createInvite } from './routes/create-invite'
import { updateTrip } from './routes/update-trip'
import { getTripDetails } from './routes/get-trip-details'
import { getParticipant } from './routes/get-participant'
import { errorHandle } from './error-handle'

const app = fastify() // Cria uma instância do servidor Fastify

app.register(cors, {
  origin: '*' // Configura o CORS para permitir requisições de qualquer origem
})

app.setValidatorCompiler(validatorCompiler) // Define o compilador de validação usando Zod
app.setSerializerCompiler(serializerCompiler) // Define o compilador de serialização usando Zod

app.setErrorHandler(errorHandle) // Define o tratamento de erros padrão

app.register(createTrip) // Registra a rota de criação de viagem
app.register(confirmTrip) // Registra a rota de confirmação de viagem
app.register(updateTrip) // Registra a rota de atualização de viagem
app.register(getTripDetails) // Registra a rota de obtenção de detalhes da viagem

app.register(getParticipants) // Registra a rota de obtenção de participantes
app.register(getParticipant) // Registra a rota de obtenção de participante
app.register(confirmParticipants) // Registra a rota de confirmação de participantes

app.register(createActivity) // Registra a rota de criação de atividade
app.register(getActivity) // Registra a rota de obtenção de atividades

app.register(createLink) // Registra a rota de criação de link
app.register(getLinks) // Registra a rota de obtenção de links

app.register(createInvite) // Registra a rota de criação de convite

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on port 3333') // Inicia o servidor na porta 3333 e exibe uma mensagem no console
})
