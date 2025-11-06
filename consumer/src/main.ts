import { logger } from './logger'
import { startServer } from './server'

async function main() {
  logger.info('application started')
  await startServer()
}

main().catch((error) => logger.error(error))
