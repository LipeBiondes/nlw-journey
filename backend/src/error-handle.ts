import { FastifyInstance } from 'fastify'
import { ClientError } from './errors/client-error'

type FastifyErrorHandle = FastifyInstance['errorHandler']

export const errorHandle: FastifyErrorHandle = async (
  error,
  request,
  reply
) => {
  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message })
  }

  console.log(error)
  reply.status(500).send({ message: 'Internal server error' })
}
