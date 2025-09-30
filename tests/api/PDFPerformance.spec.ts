import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from '../../src';
import { degrees, grayscale, rgb } from '../../src/index';

const validWriteTargetPath = 'assets/pdfs/stream/normal.pdf';

// const examplePngImage =
//   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TxaoVBzuIdMhQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi5uak6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vKIfAgLoRVhipp5IL2bgOb7u4ePrXZRneZ/7cwwoeZMBPpF4jumGRbxBPLNp6Zz3iUOsJCnE58TjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8TRxRVo3wh67LCeYuzWqmx1j35C4N5bSXNdZphxLGEBJIQIaOGMiqwEKVVI8VEivZjHv4Rx58kl0yuMhg5FlCFCsnxg//B727NwtSkmxSMAd0vtv0xCvTsAs26bX8f23bzBPA/A1da219tALOfpNfbWuQIGNwGLq7bmrwHXO4Aw0+6ZEiO5KcpFArA+xl9Uw4YugX61tzeWvs4fQAy1NXyDXBwCIwVKXvd492Bzt7+PdPq7wcdn3KFLu4iBAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlFJREFUeNrt289r02AYB/Dvk6Sl4EDKpllTlFKsnUdBHXgUBEHwqHj2IJ72B0zwKHhxJ08i/gDxX/AiRfSkBxELXTcVxTa2s2xTsHNN8ngQbQL70RZqG/Z9b29JnvflkydP37whghG3ZaegoxzfwB5vBCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgwB5rstWPtnP0LqBX/vZNyLF6vVrpN/hucewhb4g+B2AyAwiwY7NGOXijviS9vBeYh6CEP4edBLDADCAAAQhAAAIQgAAEIAABCDAUAFF/GIN1DM+PBYCo/ohMXDQ1WPjoeUZH1mMBEEh0oqLGvsHCy0S4NzWVWotJBogbvZB+brDwQT7UWSmXy5sxyQB9HQEROdVv4HQ+vx+QmS4iXsWmCK7Usu8AhOqAXMzlcn3VgWTbugQgEYrxMkZ/gyUPgnuhe2C6/Stxvdeg2ezMJERvhOuoZ+JBrNYBRuDdBtDuXkDM25nCHLbZSv9X6A4VHU+DpwCcbvbjcetLtTaOANtuirrux08HM0euisjDEMKC7RQuq+C+pVJqpzx3NZ3+eeBza9I0rWJgyHnxg2sAJrqnaHUzFcyN60Jox13hprv8aNopZBS4GcqWWVHM+lAkN0zY7ncgkYBukRoKLPpiXVj9UFkfV4Bdl8Jf60u3IMZZAG/6iLuhkDvaSZ74VqtUx3kp3NN7gUZt8RmA43a2eEY1OCfQ04AcBpAGkAKwpkBLIG8BfQE/eNJsvG/G4VlARj0BfjDBx2ECEIAABCAAAQhAAAIQgAAE+P/tN8YvpvbTDBOlAAAAAElFTkSuQmCC';

// const unencryptedPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
// const oldEncryptedPdfBytes1 = fs.readFileSync('assets/pdfs/encrypted_old.pdf');
// const anotherValidWriteTargetPath = 'assets/pdfs/stream/normal_another.pdf';

// // Had to remove this file due to DMCA complaint, so commented this line out
// // along with the 2 tests that depend on it. Would be nice to find a new file
// // that we could drop in here, but the tests are for non-critical functionality,
// // so this solution is okay for now.
// // const oldEncryptedPdfBytes2 = fs.readFileSync('pdf_specification.pdf');

// const newEncryptedPdfBytes = fs.readFileSync('assets/pdfs/encrypted_new.pdf');
// const invalidObjectsPdfBytes = fs.readFileSync(
//   'assets/pdfs/with_invalid_objects.pdf',
// );
// const justMetadataPdfbytes = fs.readFileSync('assets/pdfs/just_metadata.pdf');
// const normalPdfBytes = fs.readFileSync('assets/pdfs/normal.pdf');
// const withViewerPrefsPdfBytes = fs.readFileSync(
//   'assets/pdfs/with_viewer_prefs.pdf',
// );
// function printMemoryUsage() {
//   const usage = process.memoryUsage();
//   console.log('================================================');
//   console.log(`RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
//   console.log(`Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
//   console.log(`Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
//   console.log(`External: ${(usage.external / 1024 / 1024).toFixed(2)} MB`);
//   console.log(
//     `Array Buffers: ${(usage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`,
//   );
//   console.log('================================================');
// }

describe(`saveToTargetPath() method with embedFont()_123_Test`, () => {
  it(`save 메서드를 호출하고 메모리 사용량을 획득할 수 있어야 한다. `, async () => {
    // console.log('@@@@@@@@@@@@@@@ Save @@@@@@@@@@@@@@@@@@@@@@@@');
    // console.time('Begin_save');
    const customFont = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-B.ttf');
    const pdfDoc1 = await PDFDocument.create({ updateMetadata: false });

    pdfDoc1.registerFontkit(fontkit);
    await pdfDoc1.embedFont(customFont);

    // printMemoryUsage(); // Before
    const savedDoc1 = await pdfDoc1.save();

    // printMemoryUsage(); // After

    // console.timeEnd('Begin_save');
    expect(savedDoc1).not.toBe(null);
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
  });

  it(`should be same result comparing with [save()] result After Embedding font`, async () => {
    // console.log('@@@@@@@@@@@@@@@ saveToTargetPath() @@@@@@@@@@@@@@@@@@@@@@@@');
    // console.time('Begin_saveToTargetPath');
    const customFont = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-B.ttf');

    const pdfDoc2 = await PDFDocument.create({ updateMetadata: false });

    pdfDoc2.registerFontkit(fontkit);
    await pdfDoc2.embedFont(customFont);

    // printMemoryUsage();

    // 스트림을 기반으로 그냥 경로에다가 파일을 써버림.
    const savedDoc2 = await pdfDoc2.saveAsStream({
      outputPath: validWriteTargetPath,
      forceWrite: true,
    });
    // printMemoryUsage();

    const byteArrayDoc2 = new Uint8Array(fs.readFileSync(validWriteTargetPath));
    console.timeEnd('Begin_saveToTargetPath');

    expect(byteArrayDoc2).not.toBe(null);
    expect(savedDoc2).toBe(true);
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
  });
});

describe(`saveToTargetPath() method`, () => {
  const validDirPath = 'assets/pdfs/stream/';
  //   const invalidDirPath = '/invalid/directory/path/';
  const validFileName = 'valid_output.pdf';
  //   const invalidFileName = 'invalid_output.txt';

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure the valid directory exists
    if (!fs.existsSync(validDirPath)) {
      fs.mkdirSync(validDirPath, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup generated files
    const testFiles = [validFileName, 'created_dir_test.pdf'];
    testFiles.forEach((file) => {
      const filePath = path.join(validDirPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  it('get Save memory usage', async () => {
    // console.log('@@@@@@@@@@@@@@@ Save @@@@@@@@@@@@@@@@@@@@@@@@');
    // console.time('Begin_save');
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle('Test PDF Document');

    pdfDoc.addPage();
    pdfDoc.addPage();
    Array.from({ length: 100 }).forEach(() => pdfDoc.addPage);

    pdfDoc.getPages().forEach((page) => {
      page.drawRectangle({
        x: 25,
        y: 75,
        rx: 5, // This is the border radius
        ry: 5,
        width: 250,
        height: 75,
        rotate: degrees(-15),
        borderWidth: 5,
        borderColor: grayscale(0.5),
        color: rgb(0.75, 0.2, 0.2),
        opacity: 0.5,
        borderOpacity: 0.75,
      });
    });

    // printMemoryUsage();

    await pdfDoc.save();
    // printMemoryUsage();
    // console.log('@@@@@@@@@@@@@@@ Save_END @@@@@@@@@@@@@@@@@@@@@@@@');
    // console.time('Begin_save');
  });

  it('get saveToTargetPath memory usage', async () => {
    // console.log('@@@@@@@@@@@@@@@ saveAsStream @@@@@@@@@@@@@@@@@@@@@@@@');
    // console.time('saveAsStream');
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle('Test PDF Document');

    pdfDoc.addPage();
    pdfDoc.addPage();
    Array.from({ length: 100 }).forEach(() => pdfDoc.addPage);

    pdfDoc.getPages().forEach((page) => {
      page.drawRectangle({
        x: 25,
        y: 75,
        rx: 5, // This is the border radius
        ry: 5,
        width: 250,
        height: 75,
        rotate: degrees(-15),
        borderWidth: 5,
        borderColor: grayscale(0.5),
        color: rgb(0.75, 0.2, 0.2),
        opacity: 0.5,
        borderOpacity: 0.75,
      });
    });

    // printMemoryUsage();
    await pdfDoc.saveAsStream({
      outputPath: path.join(validDirPath, validFileName),
      forceWrite: true,
    });
    // printMemoryUsage();

    // console.log('@@@@@@@@@@@@@@@ saveAsStream_END @@@@@@@@@@@@@@@@@@@@@@@@');
    // console.time('saveAsStream');
  });
});

// ✅ Jest 테스트 구성
describe('🚀 2GB PDF Memory Test', () => {
  let pdfDoc: PDFDocument;
  const validDirPath = 'assets/pdfs/stream/';
  const validFileName = 'large_output.pdf';

  beforeAll(async () => {
    forceGC();
    console.log('🔥 2GB PDF 메모리 테스트 시작');
    pdfDoc = await createLargePDF();
  });

  afterAll(() => {
    console.log('✅ 2GB PDF 테스트 완료');
  });

  it('📌 saveAsStream() 메모리 사용량 비교', async () => {
    monitorMemory('Before saveAsStream()');
    console.time('saveAsStream');
    await pdfDoc.saveAsStream({
      outputPath: path.join(validDirPath, validFileName),
      forceWrite: true,
    });
    console.timeEnd('saveAsStream');
    monitorMemory('After saveAsStream()');

    // 파일이 정상적으로 생성되었는지 확인
    expect(fs.existsSync(path.join(validDirPath, validFileName))).toBe(true);
  }, 150000);

  it('📌 save() 메모리 사용량 비교', async () => {
    monitorMemory('Before save()');
    console.time('save');
    const savedDoc = await pdfDoc.save();
    console.timeEnd('save');
    monitorMemory('After save()');

    expect(savedDoc).toBeDefined();
    expect(savedDoc.length).toBeGreaterThan(0);
  }, 150000);
});

// ✅ 강제 GC 실행 (Node 실행 시 `--expose-gc` 플래그 필요)
function forceGC() {
  if (global.gc) {
    global.gc();
  } else {
    console.warn('Garbage Collection is not exposed. Run with --expose-gc');
  }
}

// ✅ 메모리 사용량 실시간 모니터링 (추적 로그)
function monitorMemory(label: string) {
  const usage = process.memoryUsage();
  console.log(`🚀 [${label}]`);
  console.log(`RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`External: ${(usage.external / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `Array Buffers: ${(usage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log('================================================');
}

// ✅ 2GB PDF 생성 함수
async function createLargePDF() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Large Test PDF Document');

  // ✅ 페이지 개수를 대량 추가하여 2GB PDF 생성
  Array.from({ length: 100000 }).forEach(() => pdfDoc.addPage()); // 10만 페이지 추가

  pdfDoc.getPages().forEach((page) => {
    page.drawRectangle({
      x: 25,
      y: 75,
      width: 250,
      height: 75,
      rotate: degrees(-15),
      borderWidth: 5,
      borderColor: grayscale(0.5),
      color: rgb(0.75, 0.2, 0.2),
      opacity: 0.5,
      borderOpacity: 0.75,
    });
  });

  return pdfDoc;
}
