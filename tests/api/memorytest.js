import fs from 'fs';
import path from 'path';
import { PDFDocument } from '../../src';
import { degrees, grayscale, rgb } from '../../src/index';

const validDirPath = 'assets/pdfs/stream/';
const validFileName = 'large_output.pdf';

// ✅ 강제 GC 실행 (Node 실행 시 `--expose-gc` 플래그 필요)
function forceGC() {
  if (global.gc) {
    global.gc();
  } else {
    console.warn('Garbage Collection is not exposed. Run with --expose-gc');
  }
}

// ✅ 메모리 사용량 실시간 모니터링 (추적 로그)
function monitorMemory(label) {
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

// ✅ `save()` vs `saveAsStream()` 테스트 실행
async function testMemoryUsage() {
  console.log('🔥 2GB PDF 메모리 테스트 시작');

  const pdfDoc = await createLargePDF();

  // ✅ `save()` 방식 테스트 (Uint8Array 반환 → 메모리 사용 많음)
  forceGC();
  monitorMemory('Before save()');
  console.time('save');
  const savedDoc = await pdfDoc.save();
  console.timeEnd('save');
  monitorMemory('After save()');

  // ✅ `saveAsStream()` 방식 테스트 (스트림 반환 → 메모리 절약)
  forceGC();
  monitorMemory('Before saveAsStream()');
  console.time('saveAsStream');
  await pdfDoc.saveAsStream({
    outputPath: path.join(validDirPath, validFileName),
    forceWrite: true,
  });
  console.timeEnd('saveAsStream');
  monitorMemory('After saveAsStream()');

  console.log('✅ 2GB PDF 테스트 완료');
}

testMemoryUsage();
