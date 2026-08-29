const fs = require('fs');

function getJpegSize(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    let i = 0;
    if (buffer[i] !== 0xFF || buffer[i+1] !== 0xD8) return null;
    i += 2;
    while (i < buffer.length) {
      while (buffer[i] !== 0xFF) i++;
      while (buffer[i] === 0xFF) i++;
      const marker = buffer[i];
      i++;
      if (marker >= 0xC0 && marker <= 0xC3) {
        i += 3;
        const height = buffer.readUInt16BE(i);
        const width = buffer.readUInt16BE(i+2);
        return { width, height };
      } else {
        i += buffer.readUInt16BE(i);
      }
    }
  } catch (e) {}
  return null;
}

const indexHTML = fs.readFileSync('index.html', 'utf8');
const imgRegex = /<img src="([^"]+)"/g;
let match;
let ratios = {};
while ((match = imgRegex.exec(indexHTML)) !== null) {
  const size = getJpegSize(match[1]);
  if(size) {
    const ratioStr = (size.width / size.height).toFixed(3);
    ratios[ratioStr] = (ratios[ratioStr] || 0) + 1;
  }
}
console.log(ratios);
