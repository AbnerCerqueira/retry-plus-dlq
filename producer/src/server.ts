import { createRabbitMQChannel } from './rabbitmq'
import { Task } from './task'

export async function startServer() {
  const { channel } = await createRabbitMQChannel()
  const task = new Task(channel)
  task.execute()
}
