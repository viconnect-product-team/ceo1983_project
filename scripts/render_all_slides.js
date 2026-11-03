const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false // Let's see or true
  });
  
  // Use a simple HTML page that uses PDF.js from unpkg/cdnjs or canvas to render pages
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  </head>
  <body style="margin:0; background:#000;">
    <canvas id="pdf-canvas"></canvas>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      let pdfDoc = null;
      window.loadPdf = async function(base64Data) {
        const loadingTask = pdfjsLib.getDocument({ data: atob(base64Data) });
        pdfDoc = await loadingTask.promise;
        return pdfDoc.numPages;
      };
      
      window.renderPage = async function(num) {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.getElementById('pdf-canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        return { width: viewport.width, height: viewport.height };
      };
    </script>
  </body>
  </html>
  `;
  
  await page.setContent(htmlContent);
  
  const pdfBytes = fs.readFileSync('scripts/EVENT_VISUAL_DESIGN_CEO1983.pdf');
  const base64Data = pdfBytes.toString('base64');
  
  console.log('Loading PDF in browser...');
  const numPages = await page.evaluate((b64) => window.loadPdf(b64), base64Data);
  console.log('PDF loaded, total pages:', numPages);
  
  const outDir = path.resolve('scripts/pdf_slides');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  for (let i = 1; i <= numPages; i++) {
    await page.evaluate((p) => window.renderPage(p), i);
    await page.waitForTimeout(500);
    const canvas = await page.$('#pdf-canvas');
    const outPath = path.join(outDir, `slide_${String(i).padStart(2, '0')}.png`);
    await canvas.screenshot({ path: outPath });
    console.log(`Saved slide ${i} to ${outPath}`);
  }
  
  await browser.close();
  console.log('All slides rendered successfully!');
}

main().catch(console.error);

