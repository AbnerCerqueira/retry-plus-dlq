import { type Channel, type ChannelModel, connect } from 'amqplib'
import { DLX, EXCHANGE_NAME, RABBIT_MQ_URL } from './../../envs'

type ConnectionAndChannel = {
  connection: ChannelModel
  channel: Channel
}

export async function createRabbitMQChannel(): Promise<ConnectionAndChannel> {
  const connection = await connect(RABBIT_MQ_URL)
  const channel = await connection.createChannel()
  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true })
  await channel.assertExchange(DLX, 'direct', { durable: true })

  return { connection, channel }
}
