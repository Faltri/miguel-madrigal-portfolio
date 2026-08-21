const fs = require('fs');

const oldHtml = fs.readFileSync('index.html', 'utf8');

function extract(startMarker, endMarker) {
    const startIndex = oldHtml.indexOf(startMarker);
    if (startIndex === -1) return '';
    const endIndex = endMarker ? oldHtml.indexOf(endMarker, startIndex) : oldHtml.length;
    if (endIndex === -1) return '';
    return oldHtml.substring(startIndex, endIndex);
}

// 1. Get Head and Ambient Background (up to Hero section)
const headToHero = extract('<!DOCTYPE html>', '<!-- =============================================\n         1. HERO SECTION');

// 2. Get About POV Showcase ONLY (Skip About Grid)
const povStart = '        <!-- POV Behind-the-Lens Video Carousel Showcase -->';
const povEnd = '      </div>\n    </section>\n\n    <!-- =============================================\n         3. PORTFOLIO / GALLERY SECTION';
let povShowcase = extract(povStart, povEnd);
povShowcase = `    <section id="pov" style="padding: 100px 0;">\n      <div class="container">\n` + povShowcase + `      </div>\n    </section>\n`;

// 3. Get Portfolio Section (Keep exactly as is)
const portfolioSection = extract('    <!-- =============================================\n         3. PORTFOLIO', '    <!-- =============================================\n         4. SERVICES');

// 4. Create Minimal CTA Section
const ctaSection = `
    <!-- =============================================
         MINIMAL CTA SECTION
         ============================================= -->
    <section id="contact" style="padding: 120px 0; text-align: center; background: var(--color-dark-surface);">
      <div class="container">
        <h2 style="font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 15px;">Available for Commission</h2>
        <p style="color: var(--color-grey-muted); margin-bottom: 40px; font-size: 1.1rem;">Private Sessions & Commercial Automotive Work</p>
        <a href="https://instagram.com/migumadrigal" target="_blank" class="btn btn-primary" style="padding: 15px 40px; font-size: 1.1rem; border-radius: 50px;">DM me on Instagram</a>
      </div>
    </section>
`;

// 5. Get Footer onwards
const footerOnwards = extract('  <!-- =============================================\n       FOOTER', null);

// Stitch it together!
// We want: Head -> Portfolio -> POV -> CTA -> Footer
let newHtml = headToHero + portfolioSection + povShowcase + ctaSection + footerOnwards;

// Ensure Portfolio is padded at the top so it's not hidden under the navbar
newHtml = newHtml.replace('<section id="portfolio" class="portfolio">', '<section id="portfolio" class="portfolio" style="padding-top: 150px;">');

// Add a title to the top of the Portfolio section since the Hero is gone
const portfolioTitle = `
        <div style="text-align: center; margin-bottom: 40px;">
           <h1 style="font-family: var(--font-heading); font-size: 2.5rem; font-weight: 700; letter-spacing: -1px; text-transform: uppercase;">Miguel Madrigal</h1>
           <p style="color: var(--color-grey-muted); margin-top: 10px; font-size: 1.1rem;">Automotive Photographer &bull; Tokyo, Japan</p>
        </div>
`;
newHtml = newHtml.replace('<div class="portfolio-header reveal reveal-up">', portfolioTitle + '\n        <div class="portfolio-header reveal reveal-up">');

// Remove About, Pricing, Contact links from Nav
newHtml = newHtml.replace('<a href="#about" lang="en">About</a>\n', '');
newHtml = newHtml.replace('<a href="#about" lang="ja" class="lang-hide">プロフィール</a>\n', '');
newHtml = newHtml.replace('<a href="#pricing" lang="en">Services</a>\n', '');
newHtml = newHtml.replace('<a href="#pricing" lang="ja" class="lang-hide">サービス</a>\n', '');
newHtml = newHtml.replace('<a href="#contact" lang="en">Contact</a>\n', '<a href="https://instagram.com/migumadrigal" target="_blank" lang="en">Contact (IG)</a>\n');
newHtml = newHtml.replace('<a href="#contact" lang="ja" class="lang-hide">お問い合わせ</a>\n', '<a href="https://instagram.com/migumadrigal" target="_blank" lang="ja" class="lang-hide">お問い合わせ (IG)</a>\n');

fs.writeFileSync('index.html', newHtml);
console.log('Successfully rebuilt V2 safely!');
