const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

// 1. Remove Hero Section
index = index.replace(/<header class="hero">[\s\S]*?<\/header>/, '');

// 2. Remove Section Header
index = index.replace(/<div class="section-header reveal-up">[\s\S]*?<\/div>/, '');

// 3. Extract all image source URLs and deduplicate them
const imgRegex = /<img src="([^"]+)"/g;
let match;
let images = new Set();
while ((match = imgRegex.exec(index)) !== null) {
  images.add(match[1]);
}
const uniqueImages = Array.from(images);

// 4. Generate new minimal HTML without overlays
let newGalleryHTML = '';
uniqueImages.forEach(img => {
  newGalleryHTML += `
      <a href="\${img}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="\${img}" alt="Miguel Madrigal Photography" class="project-img">
      </a>`;
});

// Replace the portfolio-grid contents
const startMarker = '<div class="portfolio-grid">';
const endMarker = '</section>';
const startIndex = index.indexOf(startMarker) + startMarker.length;
const endIndex = index.indexOf(endMarker);

index = index.substring(0, index.indexOf(startMarker)) + startMarker + '\n' + newGalleryHTML + '\n    </div>\n  ' + endMarker + index.substring(endIndex + endMarker.length);

// 5. Update Navbar to include Slider and fix Inquiries link
const navOld = `<div class="nav-links">
      <a href="#portfolio">Selected Works</a>
      <a href="https://instagram.com/migumadrigal" target="_blank">Inquiries</a>
    </div>`;

const navNew = `<div class="nav-controls">
      <div class="slider-container">
        <span class="slider-label">Grid Size</span>
        <input type="range" id="grid-slider" min="2" max="8" value="5" class="grid-slider">
      </div>
      <a href="https://ig.me/m/migumadrigal" target="_blank" class="inquiries-btn">Inquiries</a>
    </div>`;

index = index.replace(navOld, navNew);
index = index.replace('<a href="#portfolio">Selected Works</a>', ''); // in case it didn't match perfectly

// 6. Inject Slider JS
const scriptToInject = `
    // Grid Slider Logic
    const slider = document.getElementById('grid-slider');
    const grid = document.querySelector('.portfolio-grid');
    
    // Set initial grid size
    grid.style.columns = slider.value;
    
    slider.addEventListener('input', (e) => {
      // Invert slider so sliding RIGHT makes images BIGGER (fewer columns)
      // Wait, slider is 2 to 8 columns. Usually slider right = bigger photos = fewer columns.
      // Or slider right = more columns = smaller photos. Let's just set columns directly for now.
      // If the user wants smaller photos by default, 5 columns is small.
      grid.style.columns = e.target.value;
    });
`;

index = index.replace('</script>', scriptToInject + '\n  </script>');

fs.writeFileSync('index.html', index);
console.log('V6 Cleanup complete! Deduplicated images: ' + uniqueImages.length);
