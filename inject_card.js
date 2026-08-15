const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

const newGalleryCard = `
          <!-- ROW 1: LATEST SHOOT - GR86 Rollers (Aqua-Line) -->
          <!-- Card 0: Toyota GR86 Rollers -->
          <a href="shoot-toyota-gr86-rollers.html" class="gallery-item" data-category="vertical">
            <div class="gallery-item-tag">
              <span lang="en">Latest Shoot</span>
              <span lang="ja" class="lang-hide">最新の撮影</span>
            </div>
            <img src="assets/images/20260814-DSC07789.jpg" alt="Toyota GR86 Aqua-Line rolling shot by Miguel Madrigal">
            <div class="gallery-item-overlay">
              <div class="gallery-item-info">
                <h3 class="gallery-item-title">Toyota GR86 (Rollers)</h3>
                <span class="gallery-item-category" lang="en">Dynamic Motion</span>
                <span class="gallery-item-category lang-hide" lang="ja">動的</span>
              </div>
            </div>
          </a>
`;

// Find where Card 1 is.
const target = '<!-- Card 1: McLaren 720S Spider (Hero Centerpiece) -->';
if (indexHtml.includes(target)) {
    indexHtml = indexHtml.replace(target, newGalleryCard + '\\n          ' + target);
    fs.writeFileSync('index.html', indexHtml);
    console.log('Successfully added GR86 rollers to gallery.');
} else {
    console.log('Target string not found.');
}
