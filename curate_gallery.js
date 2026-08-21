const fs = require('fs');

const act1 = [
  '20260710-DSC09297.jpg',
  '20260710-DSC09321.jpg',
  '20260710-DSC09429.jpg',
  '20260728-DSC04003.jpg',
  '20260728-DSC04017.jpg',
  '20260728-DSC04046.jpg',
  '20260728-DSC04091.jpg',
  '20260728-DSC04114.jpg',
  'wfwfwfwf.jpg',
  'wfwfwfwfwf (2).jpg',
  'wfwfwfwfwf.jpg'
];

const act2 = [
  '20260728-DSC04598.jpg',
  '20260804-DSC05446.jpg',
  '20260806-DSC06665.jpg',
  '20260806-DSC06695.jpg',
  '20260806-DSC06698.jpg',
  '20260806-DSC06712.jpg',
  '20260806-DSC06753.jpg',
  '20260808-DSC00151.jpg',
  '20260808-DSC00696.jpg',
  '20260808-DSC00782.jpg',
  '20260808-DSC00908.jpg',
  'fewfefwefw.jpg',
  'wfwfwfwwf (2).jpg',
  '20260711-DSC09896.jpg'
];

const act3 = [
  '20260804-DSC05811.jpg',
  '20260806-DSC06215.jpg',
  '20260806-DSC06253.jpg',
  '20260806-DSC06457.jpg',
  '20260808-DSC00044.jpg',
  '20260808-DSC00300.jpg',
  '20260814-DSC07999.jpg',
  '20260818-DSC08839.jpg',
  '20260818-DSC08851.jpg',
  '20260818-DSC08854.jpg',
  'ergreg.jpg'
];

const act4 = [
  '20260711-DSC09918.jpg',
  '20260711-DSC09946.jpg',
  'wfwfwfwwf.jpg',
  '20260626-DSC08130.jpg',
  '20260626-DSC08145.jpg',
  '20260626-DSC08235.jpg',
  '20260626-DSC08324.jpg',
  'DSC02118.jpg',
  'DSC02156.jpg',
  'DSC02269.jpg',
  'DSC02282.jpg'
];

const allActs = [...act1, ...act2, ...act3, ...act4];
const dir = 'assets/images/3x3-grid-selection';

let htmlStr = '';
allActs.forEach(f => {
  htmlStr += `
      <a href="${dir}/${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="${dir}/${f}" alt="Miguel Madrigal Photography" class="project-img">
      </a>`;
});

let index = fs.readFileSync('index.html', 'utf8');

const startMarker = '<div class="portfolio-grid">';
const endMarker = '</section>';
const startIndex = index.indexOf(startMarker) + startMarker.length;
const endIndex = index.indexOf(endMarker);

index = index.substring(0, index.indexOf(startMarker)) + startMarker + '\n' + htmlStr + '\n    </div>\n  ' + endMarker + index.substring(endIndex + endMarker.length);

fs.writeFileSync('index.html', index);
console.log('Gallery successfully curated! Total photos: ' + allActs.length);
