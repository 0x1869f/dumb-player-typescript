import type { FLACDecodedAudio } from '@wasm-audio-decoders/flac'
import { FLACDecoder } from '@wasm-audio-decoders/flac'
import type { MPEGDecodedAudio } from 'mpg123-decoder'
import { MPEGDecoder } from 'mpg123-decoder'
import { useEffect } from 'react'

import type { SupportedExtention } from '@/domain/types/supportedExtention'

import { SUPPORTED_EXTENTION } from '../../domain/constants/supportedExtention'

export function useDecoder() {
  const mpgDecoder = new MPEGDecoder()
  const flacDecoder = new FLACDecoder()

  useEffect(() => () => {
    mpgDecoder.free()
    flacDecoder.free()
  }, [])

  function getDecoder(
    fileExtention: SupportedExtention,
    container?: string,
  ) {
    if (container) {
      return container === 'MPEG'
        ? mpgDecoder
        : flacDecoder
    }

    return fileExtention === SUPPORTED_EXTENTION.mp3
      ? mpgDecoder
      : flacDecoder
  }

  return async(
    file: Uint8Array,
    fileExtention: SupportedExtention,
    container?: string,
  ):
    Promise<FLACDecodedAudio | MPEGDecodedAudio> => {
    let decoder = getDecoder(fileExtention, container)
    const result = await decoder.decode(file)

    decoder.reset()

    return result
  }
}
