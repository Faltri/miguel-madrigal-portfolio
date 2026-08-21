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

let htmlStr = '';

newFiles.forEach(f => {
  htmlStr += `
      <a href="assets/images/${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="assets/images/${f}" alt="Recent Shoot" class="project-img">
        <div class="project-overlay">
          <div>
            <div class="project-title">Recent Session</div>
            <div class="project-meta">New Work</div>
          </div>
        </div>
      </a>`;
});

gridSelectionFiles.forEach(f => {
  htmlStr += `
      <a href="${dir}/${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="${dir}/${f}" alt="Automotive Selection" class="project-img">
        <div class="project-overlay">
          <div>
            <div class="project-title">Automotive Session</div>
            <div class="project-meta">Selected Works</div>
          </div>
        </div>
      </a>`;
});

let index = fs.readFileSync('index.html', 'utf8');

// The file currently has a bunch of broken HTML inside <div class="portfolio-grid"> ... </div>
// Let's replace the inner HTML of that div.
const startMarker = '<div class="portfolio-grid">';
const endMarker = '</section>';
const startIndex = index.indexOf(startMarker) + startMarker.length;
const endIndex = index.indexOf(endMarker);

// Keep the enclosing tags, just replace the inside
const newIndex = index.substring(0, index.indexOf(startMarker)) + startMarker + '\n' + htmlStr + '\n    </div>\n  ' + endMarker + index.substring(endIndex + endMarker.length);

fs.writeFileSync('index.html', newIndex);
console.log('Fixed gallery HTML!');
