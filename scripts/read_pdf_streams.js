const fs = require('fs');
const zlib = require('zlib');

const buffer = fs.readFileSync('scripts/EVENT_VISUAL_DESIGN_CEO1983.pdf');
console.log('PDF length:', buffer.length);

// Extract text streams
let streamMatches = 0;
const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
let match;
const fullText = [];

while ((match = streamRegex.exec(buffer.toString('binary'))) !== null) {
  streamMatches++;
  const streamData = Buffer.from(match[1], 'binary');
  try {
    const decompressed = zlib.inflateSync(streamData);
    const str = decompressed.toString('utf8');
    // Extract BT ... ET text blocks
    const textBlocks = str.match(/\((.*?)\)\s*Tj/g) || str.match(/\[(.*?)\]\s*TJ/g);
    if (textBlocks) {
      fullText.push(textBlocks.join(' '));
    }
    // Also look for color definitions like rg, RG, k, K
    const colors = str.match(/[0-9.]+\s+[0-9.]+\s+[0-9.]+\s+(?:rg|RG)/g);
    if (colors) {
      // console.log('Colors in stream:', colors);
    }
  } catch (e) {
    // not flate or raw
  }
}

console.log('Stream matches:', streamMatches);
console.log('Full extracted text samples:');
console.log(fullText.join('\n').slice(0, 3000));

