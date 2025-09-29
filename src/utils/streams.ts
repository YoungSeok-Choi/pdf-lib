import { once } from 'events';
import { Writable } from 'stream';

export const writeToStream = async (
  stream: Writable,
  chunk: Buffer | Uint8Array,
): Promise<void> => {
  if (!stream.write(chunk)) {
    await once(stream, 'drain');
  }
};
