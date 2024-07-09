import fastify from 'fastify' // Importa o framework Fastify para criar o servidor
import cors from '@fastify/cors' // Importa o plugin de CORS para habilitar requisições de diferentes origens
import { createTrip } from './routes/create-trip' // Importa a rota para criação de viagem
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod' // Importa os compiladores de serializer e validator do Zod para usar com Fastify
import { confirmTrip } from './routes/confirm-trip' // Importa a rota para confirmação de viagem
import { confirmParticipants } from './routes/confirm-participant' // Importa a rota para confirmação de participantes
import { createActivity } from './routes/create-activity'

const app = fastify() // Cria uma instância do servidor Fastify

app.register(cors, {
  origin: '*' // Configura o CORS para permitir requisições de qualquer origem
})

app.setValidatorCompiler(validatorCompiler) // Define o compilador de validação usando Zod
app.setSerializerCompiler(serializerCompiler) // Define o compilador de serialização usando Zod

app.register(createTrip) // Registra a rota de criação de viagem
app.register(confirmTrip) // Registra a rota de confirmação de viagem
app.register(confirmParticipants) // Registra a rota de confirmação de participantes

app.register(createActivity) // Registra a rota de criação de atividade

app.listen({ port: 3333 }).then(() => {
  console.log('Server is running on port 3333') // Inicia o servidor na porta 3333 e exibe uma mensagem no console
})
