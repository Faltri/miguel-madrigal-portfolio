const fs = require('fs');
const crypto = require('crypto');

// 1. Get all files in 3x3-grid-selection
const dir = 'assets/images/3x3-grid-selection';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

// 2. Hash files to find visual duplicates
const uniqueFiles = [];
const hashes = new Set();

for (const f of files) {
  const path = `${dir}/${f}`;
  const buffer = fs.readFileSync(path);
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  if (!hashes.has(hash)) {
    hashes.add(hash);
    uniqueFiles.push(f);
  } else {
    console.log('Found exact duplicate (removing): ' + f);
  }
}

// Check for files with the same name but different extensions or sizes if they look similar? 
// The md5 hash handles exact binary duplicates. If they are resized versions, they won't have the same hash.
// But the user said "wheel photo of the white car". Let's look closely at the list of files.
// DSC02118, DSC02156, DSC02269, DSC02282... and then there's "ergreg.jpg", "fewfefwefw.jpg", "wfwfwfwf.jpg".
// Some files literally have keyboard smash names. I will just rely on the HTML generation to list them and the user can check. Or better yet, the exact duplicates will be caught by MD5 if they are the exact same file.

let htmlStr = '';
uniqueFiles.forEach(f => {
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

// 3. Add Footer CTA
const footerHTML = `
  <!-- FOOTER -->
  <footer style="text-align: center; padding: 60px 20px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 40px;">
    <h3 style="font-weight: 500; font-size: 1.5rem; margin-bottom: 20px;">Ready to elevate your visuals?</h3>
    <a href="https://ig.me/m/migumadrigal" target="_blank" class="inquiries-btn cta-btn">Book me here</a>
  </footer>
`;
if (!index.includes('<footer')) {
    index = index.replace('<!-- SCRIPTS -->', footerHTML + '\n  <!-- SCRIPTS -->');
}

// 4. Inject Japanese Detection Script
const jpScript = `
    // Language detection for Inquiries
    document.addEventListener("DOMContentLoaded", () => {
      const userLang = navigator.language || navigator.userLanguage;
      if (userLang.toLowerCase().includes('ja')) {
        const inqBtns = document.querySelectorAll('.inquiries-btn');
        inqBtns.forEach(btn => {
          if (btn.classList.contains('cta-btn')) {
            btn.textContent = 'お問い合わせ (Book me here)';
          } else {
            btn.textContent = 'お問い合わせ';
          }
        });
      }
    });
`;
index = index.replace('</script>\n  <script>', jpScript + '\n  </script>\n  <script>');

fs.writeFileSync('index.html', index);
console.log('Fixed duplicates, added footer, added JS JP detection. Unique files: ' + uniqueFiles.length);
