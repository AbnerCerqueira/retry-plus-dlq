import { setTimeout } from 'node:timers/promises'
import type { Game } from '../../contracts'
import { tryCatch } from './try-catch-wrapper'

const baseDelay = 2000
const maxRetries = 3
const backoffMultiplier = 2

export async function searchAndUpdateGameInfos(games: Game[]) {
  for (const game of games) {
    const updatedInfos = await searchUpdatedInfos(game.name)

    game.infos = updatedInfos
    await updateGame(game)
  }
}

async function searchUpdatedInfos(name: Game['name']): Promise<Game['infos']> {
  // simulate an external API call
  const operation = (async () => {
    await setTimeout(baseDelay)

    throw new Error('simulated search error')
  })()

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const { exception } = await tryCatch(operation)

    if (!exception) {
      return [{ skin: 'new skin' }]
    }

    if (attempt === maxRetries) {
      break
    }

    const exponentialDelay = baseDelay * backoffMultiplier ** attempt
    await setTimeout(exponentialDelay)
  }

  throw new Error('max retries reached')
}

async function updateGame(game: Game) {
  // simulate a database update
  await setTimeout(baseDelay)

  return game
}
