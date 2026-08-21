const fs = require('fs');

const dir = 'assets/images/3x3-grid-selection';
const gridSelectionFiles = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

const newFiles = [
  '20260806-DSC06253.jpg',
  '20260806-DSC06665.jpg',
  '20260806-DSC06695.jpg',
  '20260806-DSC06698.jpg',
  '20260806-DSC06712.jpg',
  '20260818-DSC08839.jpg',
  '20260818-DSC08851.jpg',
  '20260818-DSC08854.jpg'
];

// Re-generate HTML
let htmlStr = '';

newFiles.forEach(f => {
  htmlStr += `
      <a href="assets/images/${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="assets/images/${f}" alt="Miguel Madrigal Photography" class="project-img">
      </a>`;
});

gridSelectionFiles.forEach(f => {
  htmlStr += `
      <a href="${dir}/${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="${dir}/${f}" alt="Miguel Madrigal Photography" class="project-img">
      </a>`;
});

let index = fs.readFileSync('index.html', 'utf8');

// Replace the portfolio-grid contents
const startMarker = '<div class="portfolio-grid">';
const endMarker = '</section>';
const startIndex = index.indexOf(startMarker) + startMarker.length;
const endIndex = index.indexOf(endMarker);

index = index.substring(0, index.indexOf(startMarker)) + startMarker + '\n' + htmlStr + '\n    </div>\n  ' + endMarker + index.substring(endIndex + endMarker.length);

// Fix the broken script tag
index = index.replace('<script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js">\n    // Grid Slider Logic', '<script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js"></script>\n  <script>\n    // Grid Slider Logic');

fs.writeFileSync('index.html', index);
console.log('V6 successfully fixed!');
