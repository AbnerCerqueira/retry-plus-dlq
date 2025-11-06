export type Game = {
  name: string
  infos: unknown[]
}

export type Batch = {
  batchId: string
  data: Game[]
}