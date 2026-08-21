const fs = require('fs');

function getJpegSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  let i = 0;
  
  if (buffer[i] !== 0xFF || buffer[i+1] !== 0xD8) return null; // Not JPEG
  i += 2;
  
  while (i < buffer.length) {
    while (buffer[i] !== 0xFF) i++;
    while (buffer[i] === 0xFF) i++;
    const marker = buffer[i];
    i++;
    
    if (marker >= 0xC0 && marker <= 0xC3) { // SOF0 to SOF3
      i += 3; // Skip length and precision
      const height = buffer.readUInt16BE(i);
      const width = buffer.readUInt16BE(i+2);
      return { width, height };
    } else {
      i += buffer.readUInt16BE(i); // Skip segment
    }
  }
  return null;
}

const dir = 'assets/images/3x3-grid-selection';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

const stats = files.map(f => {
  const size = getJpegSize(dir + '/' + f);
  const isPortrait = size && size.height > size.width;
  return { file: f, size, isPortrait, fileSize: fs.statSync(dir + '/' + f).size };
});

stats.sort((a,b) => a.file.localeCompare(b.file));
console.table(stats);
