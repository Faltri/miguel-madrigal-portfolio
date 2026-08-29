const fs = require('fs');

const curatedImages = [
  "assets/images/3x3-grid-selection/20260710-DSC09297.jpg",
  "assets/images/3x3-grid-selection/20260710-DSC09321.jpg",
  "assets/images/3x3-grid-selection/20260710-DSC09429.jpg",
  "assets/images/20260710-DSC09332.jpg",
  "assets/images/20260710-DSC09400.jpg",
  "assets/images/3x3-grid-selection/20260808-DSC00151.jpg",
  "assets/images/3x3-grid-selection/20260808-DSC00696.jpg",
  "assets/images/3x3-grid-selection/20260808-DSC00782.jpg",
  "assets/images/3x3-grid-selection/20260808-DSC00908.jpg",
  "assets/images/20260808-DSC00821.jpg",
  "assets/images/20260728-DSC04003.jpg",
  "assets/images/wfwfwfwfwf (2).jpg",
  "assets/images/3x3-grid-selection/20260728-DSC04598.jpg",
  "assets/images/20260728-DSC04168.jpg",
  "assets/images/20260728-DSC04146.jpg",
  "assets/images/20260728-DSC04265.jpg",
  "assets/images/20260728-DSC04616.jpg",
  "assets/images/20260728-DSC04557.jpg",
  "assets/images/20260728-DSC04585.jpg",
  "assets/images/20260728-DSC03957.jpg",
  "assets/images/3x3-grid-selection/20260806-DSC06253.jpg",
  "assets/images/3x3-grid-selection/20260806-DSC06215.jpg",
  "assets/images/20260806-DSC06753.jpg",
  "assets/images/20260806-DSC06695.jpg",
  "assets/images/20260806-DSC06698.jpg",
  "assets/images/3x3-grid-selection/20260804-DSC05446.jpg",
  "assets/images/20260804-DSC05410.jpg",
  "assets/images/20260804-DSC05820.jpg",
  "assets/images/20260804-DSC05486.jpg",
  "assets/images/20260804-DSC05471.jpg",
  "assets/images/20260804-DSC05692.jpg",
  "assets/images/20260804-DSC05657.jpg",
  "assets/images/20260804-DSC05648.jpg",
  "assets/images/20260804-DSC05718.jpg",
  "assets/images/20260804-DSC05582.jpg",
  "assets/images/3x3-grid-selection/DSC02118.jpg",
  "assets/images/3x3-grid-selection/DSC02156.jpg",
  "assets/images/3x3-grid-selection/DSC02269.jpg",
  "assets/images/DSC02138.jpg",
  "assets/images/3x3-grid-selection/DSC02282.jpg"
];

let htmlStr = '';
curatedImages.forEach(img => {
  htmlStr += `
      <a href="${img}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="${img}" alt="Miguel Madrigal Photography" class="project-img">
      </a>`;
});

let index = fs.readFileSync('index.html', 'utf8');

const startMarker = '<div class="portfolio-grid">';
const endMarker = '</section>';
const startIndex = index.indexOf(startMarker) + startMarker.length;
const endIndex = index.indexOf(endMarker);

index = index.substring(0, index.indexOf(startMarker)) + startMarker + '\n' + htmlStr + '\n    </div>\n  ' + endMarker + index.substring(endIndex + endMarker.length);

fs.writeFileSync('index.html', index);
console.log('Applied user curation layout. Total photos: ' + curatedImages.length);
