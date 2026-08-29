const fs = require('fs');
const idx = fs.readFileSync('index.html', 'utf8');
const regex = /<img src="([^"]+)"/g;
let imgs = [];
let match;
while ((match = regex.exec(idx)) !== null) {
  imgs.push(match[1]);
}
imgs = [...new Set(imgs)];

let gridHtml = '';
imgs.forEach(i => { 
  gridHtml += '    <div class="sortable-item" data-id="' + i + '"><img src="' + i + '"></div>\n'; 
});

let editor = fs.readFileSync('editor.html', 'utf8');
editor = editor.replace(/\$\{images\.map[\s\S]*?\}/, gridHtml);
fs.writeFileSync('editor.html', editor);
console.log('Fixed editor.html');
