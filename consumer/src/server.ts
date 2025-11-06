import { consumeMessages, createRabbitMQChannel } from './rabbitmq'

export async function startServer() {
  const { connection, channel } = await createRabbitMQChannel()
  consumeMessages({ connection, channel })
}
