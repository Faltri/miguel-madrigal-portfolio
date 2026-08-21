const fs = require('fs');

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

let html = newFiles.map(f => `
      <a href="assets/images/\${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="assets/images/\${f}" alt="Recent Shoot" class="project-img">
        <div class="project-overlay">
          <div>
            <div class="project-title">Recent Session</div>
            <div class="project-meta">New Work</div>
          </div>
        </div>
      </a>`).join('\n');

let index = fs.readFileSync('index.html', 'utf8');

// Insert the new photos at the top of the grid
index = index.replace('<div class="portfolio-grid">', '<div class="portfolio-grid">\n' + html);

fs.writeFileSync('index.html', index);
console.log('Added the 8 newest photos to the top of the gallery!');
