const fs = require('fs');

const dir = 'assets/images/3x3-grid-selection';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

let html = files.map(f => `
      <a href="\${dir}/\${f}" class="project-card glightbox reveal-up" data-gallery="portfolio">
        <img src="\${dir}/\${f}" alt="Automotive Selection" class="project-img">
        <div class="project-overlay">
          <div>
            <div class="project-title">Automotive Session</div>
            <div class="project-meta">Selected Works</div>
          </div>
        </div>
      </a>`).join('\n');

const index = fs.readFileSync('index.html', 'utf8');

const updated = index.replace(/<div class="portfolio-grid">[\s\S]*?<\/div>\s*<\/section>/, `<div class="portfolio-grid">\n${html}\n</div>\n  </section>`);

fs.writeFileSync('index.html', updated);
console.log('Gallery updated with all 3x3-grid-selection photos!');
