import CharCodes from '../syntax/CharCodes';
import {
  convertStringToUnicodeArray,
  copyStringIntoBuffer,
  writeToStream,
} from '../../utils';
import { Writable } from 'stream';

class PDFTrailer {
  static forLastCrossRefSectionOffset = (offset: number) =>
    new PDFTrailer(offset);

  private readonly lastXRefOffset: string;

  private constructor(lastXRefOffset: number) {
    this.lastXRefOffset = String(lastXRefOffset);
  }

  toString(): string {
    return `startxref\n${this.lastXRefOffset}\n%%EOF`;
  }

  sizeInBytes(): number {
    return 16 + this.lastXRefOffset.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.s;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.x;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.f;
    buffer[offset++] = CharCodes.Newline;

    offset += copyStringIntoBuffer(this.lastXRefOffset, buffer, offset);

    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = CharCodes.E;
    buffer[offset++] = CharCodes.O;
    buffer[offset++] = CharCodes.F;

    return offset - initialOffset;
  }

  async writeBytesInto(stream: Writable): Promise<void> {
    await writeToStream(
      stream,
      Buffer.from([
        CharCodes.s,
        CharCodes.t,
        CharCodes.a,
        CharCodes.r,
        CharCodes.t,
        CharCodes.x,
        CharCodes.r,
        CharCodes.e,
        CharCodes.f,
        CharCodes.Newline,
      ]),
    );

    await writeToStream(
      stream,
      convertStringToUnicodeArray(this.lastXRefOffset),
    );

    await writeToStream(
      stream,
      Buffer.from([
        CharCodes.Newline,
        CharCodes.Percent,
        CharCodes.Percent,
        CharCodes.E,
        CharCodes.O,
        CharCodes.F,
      ]),
    );
  }
}

export default PDFTrailer;
