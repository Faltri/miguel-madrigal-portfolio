const fs = require('fs');

let content = fs.readFileSync('shoot-toyota-gr86.html', 'utf8');

// Title
content = content.replace(/<title>.*?<\/title>/, '<title>Miguel Madrigal | Toyota GR86 (Rollers)</title>');

// SEO
content = content.replace(/<meta property="og:title" content=".*?">/, '<meta property="og:title" content="Toyota GR86 (Rollers) - Aqua-Line Shoot">');
content = content.replace(/<meta property="og:image" content=".*?">/, '<meta property="og:image" content="https://migumadrigal.com/assets/images/20260814-DSC07789.jpg">');
content = content.replace(/<meta property="og:url" content=".*?">/, '<meta property="og:url" content="https://migumadrigal.com/shoot-toyota-gr86-rollers.html">');

// Hero Section
content = content.replace(/<section class="article-hero">[\s\S]*?<\/section>/, 
    `<section class="article-hero">
      <img src="assets/images/20260814-DSC07789.jpg" alt="Toyota GR86 Rollers Aqua-Line">
      <div class="overlay"></div>
      <div class="article-title-container">
        <h1 class="article-title">Toyota GR86 (Rollers)</h1>
        <p class="article-subtitle">Aqua-Line High Speed Tunnel Run</p>
      </div>
    </section>`);

// Text Content
content = content.replace(/<div class="article-content-text reveal reveal-up">[\s\S]*?<\/div>/,
    `<div class="article-content-text reveal reveal-up">
        <p lang="en">Caught some rolling shots of this gunmetal GR86 on the Aqua-Line right after leaving Umihotaru. Fun fact: I was actually driving my friend's C8 Corvette while getting these shots.</p>
        <p lang="ja" class="lang-hide">This text is intentionally kept chill in English.</p>
      </div>`);

// Image Grid
const newImages = [
    'assets/images/20260814-DSC07789.jpg',
    'assets/images/20260814-DSC07791.jpg',
    'assets/images/20260814-DSC07794.jpg',
    'assets/images/20260814-DSC07828.jpg',
    'assets/images/20260814-DSC07907.jpg',
    'assets/images/20260814-DSC07911.jpg'
];

let imageHtml = '';
for (let img of newImages) {
    imageHtml += `
          <a href="${img}" class="glightbox">
            <img src="${img}" alt="Toyota GR86 Rollers Aqua-Line" loading="lazy">
          </a>`;
}

// Replace everything inside the image-grid div
content = content.replace(/<div class="image-grid[^>]*>[\s\S]*?<!-- Related Galleries -->/, 
    `<div class="image-grid" style="grid-template-columns: repeat(2, 1fr); gap: 20px;">
${imageHtml}
      </div>

      <!-- Related Galleries -->`);

fs.writeFileSync('shoot-toyota-gr86-rollers.html', content);
console.log('Fixed shoot-toyota-gr86-rollers.html');
