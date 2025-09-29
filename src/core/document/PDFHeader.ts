import { Writable } from 'stream';
import CharCodes from '../syntax/CharCodes';
import {
  charFromCode,
  convertStringToUnicodeArray,
  copyStringIntoBuffer,
  writeToStream,
} from '../../utils';

class PDFHeader {
  static forVersion = (major: number, minor: number) =>
    new PDFHeader(major, minor);

  private readonly major: string;
  private readonly minor: string;

  private constructor(major: number, minor: number) {
    this.major = String(major);
    this.minor = String(minor);
  }

  getVersionString(): string {
    return `${this.major}.${this.minor}`;
  }

  toString(): string {
    const bc = charFromCode(129);
    return `%PDF-${this.major}.${this.minor}\n%${bc}${bc}${bc}${bc}`;
  }

  sizeInBytes(): number {
    return 12 + this.major.length + this.minor.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = CharCodes.P;
    buffer[offset++] = CharCodes.D;
    buffer[offset++] = CharCodes.F;
    buffer[offset++] = CharCodes.Dash;

    offset += copyStringIntoBuffer(this.major, buffer, offset);
    buffer[offset++] = CharCodes.Period;
    offset += copyStringIntoBuffer(this.minor, buffer, offset);
    buffer[offset++] = CharCodes.Newline;

    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = 129;
    buffer[offset++] = 129;
    buffer[offset++] = 129;
    buffer[offset++] = 129;

    return offset - initialOffset;
  }

  async writeBytesInto(stream: Writable): Promise<void> {
    await writeToStream(
      stream,
      Buffer.from([
        CharCodes.Percent,
        CharCodes.P,
        CharCodes.D,
        CharCodes.F,
        CharCodes.Dash,
      ]),
    );
    await writeToStream(stream, convertStringToUnicodeArray(this.major));
    await writeToStream(stream, Buffer.from([CharCodes.Period]));
    await writeToStream(stream, convertStringToUnicodeArray(this.minor));
    await writeToStream(stream, Buffer.from([CharCodes.Newline]));
    await writeToStream(
      stream,
      Buffer.from([CharCodes.Percent, 129, 129, 129, 129]),
    );
  }
}

export default PDFHeader;
