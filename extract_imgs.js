const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');
const regex = /<img src="([^"]+)"/g;
let match;
let imgs = [];
while ((match = regex.exec(index)) !== null) {
  imgs.push(match[1]);
}
fs.writeFileSync('imgs_list.txt', imgs.join('\n'));
console.log('Saved to imgs_list.txt');
