const fs = require('fs');
const path = require('path');

// 1. Get all images in the project
function walk(d) {
  let r = [];
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      r = r.concat(walk(p));
    } else if (p.endsWith('.jpg')) {
      r.push(p.replace(/\\/g, '/'));
    }
  });
  return r;
}
const allImagesRaw = walk('assets/images');

// Filter out portrait/avatar non-portfolio stuff if any?
// Just include everything for the user to choose from.
const allImages = [...new Set(allImagesRaw)];

// 2. Extract active images from index.html
const indexHTML = fs.readFileSync('index.html', 'utf8');
const imgRegex = /<img src="([^"]+)"/g;
let match;
let activeImages = [];
while ((match = imgRegex.exec(indexHTML)) !== null) {
  activeImages.push(match[1]);
}
activeImages = [...new Set(activeImages)];

// 3. Find unused images
const unusedImages = allImages.filter(img => !activeImages.includes(img));

// 4. Build Editor HTML
const editorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curation Editor | Miguel Madrigal</title>
  
  <link rel="stylesheet" href="styles/index.css">
  
  <style>
    body {
      background: #111;
      padding-top: 100px;
      color: #fff;
      font-family: sans-serif;
    }
    
    .editor-topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 80px;
      background: rgba(0,0,0,0.95);
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
      z-index: 9999;
    }
    
    .editor-title {
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .export-btn {
      background: #fff;
      color: #000;
      border: none;
      padding: 10px 20px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.2s ease;
    }
    
    .export-btn:hover { background: #ccc; }
    
    .panes-container {
      display: flex;
      flex-direction: column;
      gap: 40px;
      padding: 0 40px 80px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .pane-header {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .pane-subtitle {
      font-size: 0.9rem;
      color: #888;
      font-weight: normal;
    }
    
    .sortable-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      min-height: 200px;
      background: rgba(255,255,255,0.02);
      border: 2px dashed #333;
      padding: 15px;
      border-radius: 8px;
    }
    
    .sortable-item {
      display: block;
      cursor: grab;
      position: relative;
    }
    
    .sortable-item:active { cursor: grabbing; opacity: 0.8; transform: scale(0.95); }
    
    .sortable-item img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      display: block;
      border-radius: 4px;
      pointer-events: none;
    }
    
    .sortable-ghost { opacity: 0.4; background: #333; }
  </style>
</head>
<body>

  <div class="editor-topbar">
    <div class="editor-title">Visual Layout Editor</div>
    <button class="export-btn" id="exportBtn">Export Curation</button>
  </div>

  <div class="panes-container">
    <!-- ACTIVE GRID -->
    <div>
      <div class="pane-header">
        Active Grid
        <span class="pane-subtitle">These photos will appear on your website. Drag to reorder.</span>
      </div>
      <div class="sortable-grid" id="activeGrid">
        ${activeImages.map(img => `<div class="sortable-item" data-id="${img}"><img src="${img}"></div>`).join('\n        ')}
      </div>
    </div>

    <!-- UNUSED PHOTOS -->
    <div>
      <div class="pane-header" style="color: #888; border-color: #222;">
        Unused Photos
        <span class="pane-subtitle">Drag these UP into the Active Grid to add them, or drag active photos DOWN here to delete them.</span>
      </div>
      <div class="sortable-grid" id="unusedGrid">
        ${unusedImages.map(img => `<div class="sortable-item" data-id="${img}"><img src="${img}"></div>`).join('\n        ')}
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
  <script>
    const activeGrid = document.getElementById('activeGrid');
    const unusedGrid = document.getElementById('unusedGrid');
    
    const sortableOptions = {
      group: 'shared', // set both lists to same group
      animation: 150,
      ghostClass: 'sortable-ghost',
      delay: 50,
      delayOnTouchOnly: true
    };
    
    const activeSortable = new Sortable(activeGrid, sortableOptions);
    new Sortable(unusedGrid, sortableOptions);
    
    const exportBtn = document.getElementById('exportBtn');
    
    exportBtn.addEventListener('click', () => {
      // ONLY grab the images from the Active Grid!
      const order = activeSortable.toArray();
      const json = JSON.stringify(order, null, 2);
      
      navigator.clipboard.writeText(json).then(() => {
        const originalText = exportBtn.innerText;
        exportBtn.innerText = 'Copied to Clipboard!';
        exportBtn.style.background = '#4CAF50';
        exportBtn.style.color = '#fff';
        setTimeout(() => {
          exportBtn.innerText = originalText;
          exportBtn.style.background = '#fff';
          exportBtn.style.color = '#000';
        }, 3000);
      }).catch(err => {
        alert('Failed to copy. Please copy manually:\\n\\n' + json);
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync('editor.html', editorHTML);
console.log('Upgraded editor.html to dual-pane (Active vs Unused)');
