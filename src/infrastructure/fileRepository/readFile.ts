import { readFile as read } from 'node:fs/promises'

export async function readFile(path: string): Promise<ArrayBuffer> {
  const nodeBuffer = await read(path)

  return new Uint8Array(nodeBuffer).buffer
}
