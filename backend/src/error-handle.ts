import { FastifyInstance } from 'fastify'

type FastifyErrorHandle = FastifyInstance['errorHandler']

export const errorHandle: FastifyErrorHandle = async (
  error,
  request,
  reply
) => {
  console.log(error)
  reply.status(500).send({ message: 'Internal server error' })
}
