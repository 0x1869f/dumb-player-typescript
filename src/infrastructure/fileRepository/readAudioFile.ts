import { readFile } from './readFile'

export async function readAudioFile(path: string): Promise<Uint8Array> {
  const result = await readFile(path)

  return new Uint8Array(result)
}
