import type { Channel } from 'amqplib'
import type { Batch } from '../../contracts'
import { EXCHANGE_NAME, ROUTING_KEY } from '../../envs'

const batches: Batch[] = [
  {
    batchId: 'batch1',
    data: [
      { name: 'game a', infos: [] },
      { name: 'game b', infos: [] },
    ],
  },
]

export class Task {
  public constructor(private readonly channel: Channel) {}

  // should be implemented with as a cron job or similar
  public execute() {
    for (const batch of batches) {
      const content = Buffer.from(JSON.stringify(batch))
      this.channel.publish(EXCHANGE_NAME, ROUTING_KEY, content)
    }
  }
}
