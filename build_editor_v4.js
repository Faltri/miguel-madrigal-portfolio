const fs = require('fs');
const path = require('path');

// Read JPEG headers to get dimensions quickly
function getJpegSize(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    let i = 0;
    if (buffer[i] !== 0xFF || buffer[i+1] !== 0xD8) return null;
    i += 2;
    while (i < buffer.length) {
      while (buffer[i] !== 0xFF) i++;
      while (buffer[i] === 0xFF) i++;
      const marker = buffer[i];
      i++;
      if (marker >= 0xC0 && marker <= 0xC3) {
        i += 3;
        const height = buffer.readUInt16BE(i);
        const width = buffer.readUInt16BE(i+2);
        return { width, height };
      } else {
        i += buffer.readUInt16BE(i);
      }
    }
  } catch (e) {}
  return null;
}

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

// Helper to build the item HTML with V/H badges
function buildItem(img) {
  const size = getJpegSize(img);
  let badge = '';
  if (size) {
    if (size.width > size.height) {
      badge = '<div class="orientation-badge badge-h">H</div>';
    } else {
      badge = '<div class="orientation-badge badge-v">V</div>';
    }
  }
  return `
        <div class="sortable-item" data-id="${img}">
          ${badge}
          <img src="${img}">
          <div class="item-controls"></div>
        </div>`;
}

// 4. Build Editor HTML
const editorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMS Editor 4.0 | Miguel Madrigal</title>
  <style>
    body { background: #111; color: #fff; font-family: sans-serif; padding-top: 100px; margin: 0; }
    * { box-sizing: border-box; }
    
    .editor-topbar {
      position: fixed; top: 0; left: 0; right: 0; height: 80px;
      background: rgba(0,0,0,0.95); border-bottom: 1px solid #333;
      display: flex; justify-content: space-between; align-items: center;
      padding: 0 40px; z-index: 9999;
    }
    
    .editor-title { font-size: 1.2rem; font-weight: bold; }
    
    .nav-controls { display: flex; align-items: center; gap: 30px; }
    .slider-container { display: flex; align-items: center; gap: 10px; color: #ccc; font-size: 0.9rem; }
    .export-btn { background: #fff; color: #000; border: none; padding: 10px 20px; font-weight: bold; border-radius: 4px; cursor: pointer; }
    .export-btn:hover { background: #ccc; }
    
    .panes-container { display: flex; flex-direction: column; gap: 40px; padding: 0 40px 80px; max-width: 1400px; margin: 0 auto; }
    
    .pane-header { font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: flex-end; }
    .pane-subtitle { font-size: 0.9rem; color: #888; font-weight: normal; }
    
    .sortable-grid {
      display: grid;
      grid-template-columns: repeat(var(--cols, 5), 1fr);
      align-items: start; /* CRITICAL: Allows items to be their natural height instead of stretching */
      gap: 15px; min-height: 200px; background: rgba(255,255,255,0.02);
      border: 2px dashed #333; padding: 15px; border-radius: 8px;
    }
    
    .sortable-item { position: relative; cursor: grab; border-radius: 4px; background: #222; overflow: hidden; }
    .sortable-item img { 
      width: 100%; 
      height: auto; /* Show true aspect ratio! */
      display: block; pointer-events: none; 
    }
    
    .orientation-badge {
      position: absolute; top: 8px; left: 8px; padding: 4px 8px; font-size: 0.8rem; font-weight: bold; border-radius: 4px; z-index: 10;
      backdrop-filter: blur(4px);
    }
    .badge-v { background: rgba(0, 150, 255, 0.7); color: #fff; }
    .badge-h { background: rgba(255, 100, 0, 0.7); color: #fff; }

    /* Hover Controls */
    .item-controls {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px;
      opacity: 0; transition: opacity 0.2s; pointer-events: none; z-index: 20;
    }
    .sortable-item:hover .item-controls { opacity: 1; pointer-events: auto; }
    
    .ctrl-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; transition: 0.2s; backdrop-filter: blur(4px); }
    .ctrl-btn:hover { background: #fff; color: #000; }
    
    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: none; padding: 40px; overflow-y: auto; }
    .modal-overlay.active { display: block; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-close { background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }
    .modal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); align-items: start; gap: 15px; }
    .modal-item { cursor: pointer; transition: 0.2s; border-radius: 4px; overflow: hidden; position: relative; }
    .modal-item img { width: 100%; height: auto; display: block; }
    .modal-item:hover { transform: scale(1.05); box-shadow: 0 0 0 2px #fff; z-index: 10; }
  </style>
</head>
<body>

  <div class="editor-topbar">
    <div class="editor-title">Editor 4.0: True Aspect Ratios</div>
    <div class="nav-controls">
      <div class="slider-container">
        <span>Columns:</span>
        <input type="range" id="colSlider" min="2" max="8" value="5">
      </div>
      <button class="export-btn" id="exportBtn">Export Curation</button>
    </div>
  </div>

  <div class="panes-container">
    <div>
      <div class="pane-header">Active Portfolio <span class="pane-subtitle">Live on website. True aspect ratios shown.</span></div>
      <div class="sortable-grid" id="activeGrid" style="--cols: 5;">
        ${activeImages.map(img => buildItem(img)).join('')}
      </div>
    </div>

    <div>
      <div class="pane-header" style="color:#888; border-color:#222;">Unused Pool <span class="pane-subtitle">${unusedImages.length} available photos.</span></div>
      <div class="sortable-grid" id="unusedGrid" style="--cols: 8;">
        ${unusedImages.map(img => buildItem(img)).join('')}
      </div>
    </div>
  </div>
  
  <div class="modal-overlay" id="replaceModal">
    <div class="modal-header">
      <h2>Select photo to swap in:</h2>
      <button class="modal-close" id="closeModal">&times;</button>
    </div>
    <div class="modal-grid" id="modalGrid"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
  <script>
    const activeGrid = document.getElementById('activeGrid');
    const unusedGrid = document.getElementById('unusedGrid');
    const colSlider = document.getElementById('colSlider');
    const replaceModal = document.getElementById('replaceModal');
    const modalGrid = document.getElementById('modalGrid');
    const closeModal = document.getElementById('closeModal');
    let targetReplaceItem = null;
    
    // Sortable JS setup (Tetris fix: Using grid with align-items: start maintains DOM flow!)
    new Sortable(activeGrid, { group: 'shared', animation: 150, delay: 50, delayOnTouchOnly: true,
      onAdd: function (evt) { changeItemState(evt.item, 'active'); } 
    });
    new Sortable(unusedGrid, { group: 'shared', animation: 150, delay: 50, delayOnTouchOnly: true,
      onAdd: function (evt) { changeItemState(evt.item, 'unused'); } 
    });
    
    colSlider.addEventListener('input', (e) => {
      activeGrid.style.setProperty('--cols', e.target.value);
    });

    // Setup initial controls
    Array.from(activeGrid.children).forEach(el => changeItemState(el, 'active'));
    Array.from(unusedGrid.children).forEach(el => changeItemState(el, 'unused'));

    function changeItemState(itemEl, state) {
      const controls = itemEl.querySelector('.item-controls');
      if (state === 'active') {
        controls.innerHTML = '<button class="ctrl-btn replace-btn">⇄ Replace</button> <button class="ctrl-btn remove-btn">X Remove</button>';
      } else {
        controls.innerHTML = '<button class="ctrl-btn add-btn">+ Add</button>';
      }
    }

    // Event Delegation
    document.body.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.sortable-item');
      if (!itemEl) return;
      
      if (e.target.classList.contains('remove-btn')) {
        changeItemState(itemEl, 'unused');
        unusedGrid.appendChild(itemEl);
      } 
      else if (e.target.classList.contains('add-btn')) {
        changeItemState(itemEl, 'active');
        activeGrid.appendChild(itemEl);
      }
      else if (e.target.classList.contains('replace-btn')) {
        targetReplaceItem = itemEl;
        openReplaceModal();
      }
    });
    
    // Modal
    function openReplaceModal() {
      modalGrid.innerHTML = '';
      const unusedItems = Array.from(unusedGrid.children);
      unusedItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const badgeHTML = item.querySelector('.orientation-badge') ? item.querySelector('.orientation-badge').outerHTML : '';
        const mItem = document.createElement('div');
        mItem.className = 'modal-item';
        mItem.innerHTML = badgeHTML + \`<img src="\${id}">\`;
        mItem.onclick = () => performReplace(id, item);
        modalGrid.appendChild(mItem);
      });
      replaceModal.classList.add('active');
    }
    
    closeModal.onclick = () => replaceModal.classList.remove('active');
    
    function performReplace(newId, unusedEl) {
      if (!targetReplaceItem) return;
      
      const oldId = targetReplaceItem.getAttribute('data-id');
      const oldBadge = targetReplaceItem.querySelector('.orientation-badge');
      const newBadge = unusedEl.querySelector('.orientation-badge');
      
      // Swap IDs
      targetReplaceItem.setAttribute('data-id', newId);
      targetReplaceItem.querySelector('img').src = newId;
      if(newBadge) {
          if(oldBadge) targetReplaceItem.replaceChild(newBadge.cloneNode(true), oldBadge);
          else targetReplaceItem.insertBefore(newBadge.cloneNode(true), targetReplaceItem.firstChild);
      } else if (oldBadge) {
          oldBadge.remove();
      }
      
      unusedEl.setAttribute('data-id', oldId);
      unusedEl.querySelector('img').src = oldId;
      if(oldBadge) {
          const uOldBadge = unusedEl.querySelector('.orientation-badge');
          if(uOldBadge) unusedEl.replaceChild(oldBadge.cloneNode(true), uOldBadge);
          else unusedEl.insertBefore(oldBadge.cloneNode(true), unusedEl.firstChild);
      } else {
          const uOldBadge = unusedEl.querySelector('.orientation-badge');
          if(uOldBadge) uOldBadge.remove();
      }
      
      replaceModal.classList.remove('active');
    }

    // Export
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', () => {
      const activeIds = Array.from(activeGrid.children).map(el => el.getAttribute('data-id'));
      const json = JSON.stringify(activeIds, null, 2);
      
      navigator.clipboard.writeText(json).then(() => {
        const originalText = exportBtn.innerText;
        exportBtn.innerText = 'Copied!';
        exportBtn.style.background = '#4CAF50';
        exportBtn.style.color = '#fff';
        setTimeout(() => {
          exportBtn.innerText = originalText;
          exportBtn.style.background = '#fff';
          exportBtn.style.color = '#000';
        }, 3000);
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync('editor.html', editorHTML);
console.log('Successfully built Visual Editor 4.0');
