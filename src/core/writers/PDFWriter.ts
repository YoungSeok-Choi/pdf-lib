import PDFCrossRefSection from '../document/PDFCrossRefSection';
import PDFHeader from '../document/PDFHeader';
import PDFTrailer from '../document/PDFTrailer';
import PDFTrailerDict from '../document/PDFTrailerDict';
import PDFDict from '../objects/PDFDict';
import PDFObject from '../objects/PDFObject';
import PDFRef from '../objects/PDFRef';
import PDFStream from '../objects/PDFStream';
import PDFContext from '../PDFContext';
import PDFObjectStream from '../structures/PDFObjectStream';
import PDFSecurity from '../security/PDFSecurity';
import CharCodes from '../syntax/CharCodes';
import { copyStringIntoBuffer, waitForTick } from '../../utils';
import fs from 'fs';
import { FileSaveOptions } from 'src/api';
import path from 'path';
import { Writable } from 'stream';

export interface SerializationInfo {
  size: number;
  header: PDFHeader;
  indirectObjects: [PDFRef, PDFObject][];
  xref?: PDFCrossRefSection;
  trailerDict?: PDFTrailerDict;
  trailer: PDFTrailer;
}

class PDFWriter {
  static forContext = (context: PDFContext, objectsPerTick: number) =>
    new PDFWriter(context, objectsPerTick);

  protected readonly context: PDFContext;

  protected readonly objectsPerTick: number;
  private parsedObjects = 0;

  protected constructor(context: PDFContext, objectsPerTick: number) {
    this.context = context;
    this.objectsPerTick = objectsPerTick;
  }

  async writeToTargetPath(options: Pick<FileSaveOptions, "forceWrite" | "destPath">): Promise<string> {
    const { forceWrite, destPath } = options;
    try {

      if (!fs.existsSync(destPath)) {
        if (forceWrite) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        throw Error("File does not exist");
      }

      // 여기서 기존 것들을 잘 취합해서 하는 방법을 찾아야해.
      fs.writeFileSync(destPath, await this.serializeToBuffer());
    } catch (e) {
      console.log(e);
    }

    // Check validity of targetPath
    // copy?
    return destPath;
  }

  async serializetoStream(destStream: Writable): Promise<void> {
    const { header, indirectObjects, xref, trailerDict, trailer } = await this.computeBufferSize();

    destStream.write(header.serialize());
    destStream.write(Buffer.from([CharCodes.Newline, CharCodes.Newline]));


    // 간접객체 쓰기
    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const [ref, object] = indirectObjects[idx];

      const objectNumber = String(ref.objectNumber);
      destStream.write(Buffer.from(objectNumber));
      destStream.write(Buffer.from([CharCodes.Space]));

      const generationNumber = String(ref.generationNumber);
      destStream.write(Buffer.from(generationNumber));
      destStream.write(Buffer.from([CharCodes.Space]));

      destStream.write(Buffer.from([CharCodes.o, CharCodes.b, CharCodes.j, CharCodes.Newline]));

      destStream.write(object.serialize());

      destStream.write(
        Buffer.from([
          CharCodes.Newline,
          CharCodes.e,
          CharCodes.n,
          CharCodes.d,
          CharCodes.o,
          CharCodes.b,
          CharCodes.j,
          CharCodes.Newline,
          CharCodes.Newline
        ])
      );

      const n = object instanceof PDFObjectStream ? object.getObjectsCount() : 1;
      if (this.shouldWaitForTick(n)) await waitForTick();
    }

    if (xref) {
      destStream.write(xref.serialize());
      destStream.write(Buffer.from([CharCodes.Newline]));
    }

    if (trailerDict) {
      destStream.write(trailderDict.serialize());
      destStream.write(Buffer.from([CharCodes.Newline, CharCodes.Newline]));

    }



  }

  async serializeToBuffer(): Promise<Uint8Array> {
    const { size, header, indirectObjects, xref, trailerDict, trailer } =
      await this.computeBufferSize();

    let offset = 0;
    const buffer = new Uint8Array(size);

    offset += header.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Newline;

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const [ref, object] = indirectObjects[idx];

      const objectNumber = String(ref.objectNumber);
      offset += copyStringIntoBuffer(objectNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      const generationNumber = String(ref.generationNumber);
      offset += copyStringIntoBuffer(generationNumber, buffer, offset);
      buffer[offset++] = CharCodes.Space;

      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;

      offset += object.copyBytesInto(buffer, offset);

      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.e;
      buffer[offset++] = CharCodes.n;
      buffer[offset++] = CharCodes.d;
      buffer[offset++] = CharCodes.o;
      buffer[offset++] = CharCodes.b;
      buffer[offset++] = CharCodes.j;
      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.Newline;

      const n =
        object instanceof PDFObjectStream ? object.getObjectsCount() : 1;
      if (this.shouldWaitForTick(n)) await waitForTick();
    }

    if (xref) {
      offset += xref.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }

    if (trailerDict) {
      offset += trailerDict.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
      buffer[offset++] = CharCodes.Newline;
    }

    offset += trailer.copyBytesInto(buffer, offset);

    return buffer;
  }

  protected computeIndirectObjectSize([ref, object]: [
    PDFRef,
    PDFObject,
  ]): number {
    const refSize = ref.sizeInBytes() + 3; // 'R' -> 'obj\n'
    const objectSize = object.sizeInBytes() + 9; // '\nendobj\n\n'
    return refSize + objectSize;
  }

  protected createTrailerDict(): PDFDict {
    return this.context.obj({
      Size: this.context.largestObjectNumber + 1,
      Root: this.context.trailerInfo.Root,
      Encrypt: this.context.trailerInfo.Encrypt,
      Info: this.context.trailerInfo.Info,
      ID: this.context.trailerInfo.ID,
    });
  }

  protected async computeBufferSize(): Promise<SerializationInfo> {
    const header = PDFHeader.forVersion(1, 7);

    let size = header.sizeInBytes() + 2;

    const xref = PDFCrossRefSection.create();

    const security = this.context.security;

    const indirectObjects = this.context.enumerateIndirectObjects();

    for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
      const indirectObject = indirectObjects[idx];
      const [ref, object] = indirectObject;
      if (security) this.encrypt(ref, object, security);
      xref.addEntry(ref, size);
      size += this.computeIndirectObjectSize(indirectObject);
      if (this.shouldWaitForTick(1)) await waitForTick();
    }

    const xrefOffset = size;
    size += xref.sizeInBytes() + 1; // '\n'

    const trailerDict = PDFTrailerDict.of(this.createTrailerDict());
    size += trailerDict.sizeInBytes() + 2; // '\n\n'

    const trailer = PDFTrailer.forLastCrossRefSectionOffset(xrefOffset);
    size += trailer.sizeInBytes();

    return { size, header, indirectObjects, xref, trailerDict, trailer };
  }

  protected encrypt(ref: PDFRef, object: PDFObject, security: PDFSecurity) {
    if (object instanceof PDFStream) {
      const encryptFn = security.getEncryptFn(
        ref.objectNumber,
        ref.generationNumber,
      );
      const unencryptedContents = object.getContents();
      const encryptedContents = encryptFn(unencryptedContents);
      object.updateContents(encryptedContents);
    }
  }

  protected shouldWaitForTick = (n: number) => {
    this.parsedObjects += n;
    return this.parsedObjects % this.objectsPerTick === 0;
  };
}

export default PDFWriter;
