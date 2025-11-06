import assert from 'node:assert/strict'
import { type Channel, type ChannelModel, connect } from 'amqplib'
import z from 'zod'
import type { Batch, Game } from '../../contracts'
import {
  DL_ROUTING_KEY,
  DLQ,
  DLX,
  EXCHANGE_NAME,
  QUEUE_NAME,
  RABBIT_MQ_URL,
  ROUTING_KEY,
} from '../../envs'
import { logger } from './logger'
import { searchAndUpdateGameInfos } from './search-n-update'

type ConnectionAndChannel = {
  connection: ChannelModel
  channel: Channel
}

const gameSchema = z.object({
  name: z.string(),
  infos: z.any(),
}) satisfies z.ZodType<Game>

const batchSchema = z.object({
  batchId: z.string(),
  data: gameSchema.array(),
}) satisfies z.ZodType<Batch>

export async function createRabbitMQChannel(): Promise<ConnectionAndChannel> {
  const connection = await connect(RABBIT_MQ_URL)
  const channel = await connection.createChannel()
  channel.prefetch(1)

  await setupQueue(channel)
  await setupDLQ(channel)

  return { connection, channel }
}

export function consumeMessages(params: ConnectionAndChannel) {
  const { channel } = params

  channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) {
      return
    }

    const content = msg.content.toString()
    const parsedContent = JSON.parse(content)

    const result = batchSchema.safeParse(parsedContent)

    if (!result.success) {
      channel.nack(msg, false, false)
    }
    assert(result.data)
    logger.info(`received batch ${result.data.batchId}`)

    const games = result.data.data

    searchAndUpdateGameInfos(games).catch((error) => {
      logger.error({ err: error, batchId: result.data.batchId })
      channel.reject(msg, false)
    })
  })
}

async function setupQueue(channel: Channel) {
  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': DLX,
      'x-dead-letter-routing-key': DL_ROUTING_KEY,
    },
  })
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY)
}

async function setupDLQ(channel: Channel) {
  await channel.assertQueue(DLQ, { durable: true })

  await channel.bindQueue(DLQ, DLX, DL_ROUTING_KEY)
}
