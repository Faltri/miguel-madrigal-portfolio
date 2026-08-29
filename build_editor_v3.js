const fs = require('fs');
const path = require('path');

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

const indexHTML = fs.readFileSync('index.html', 'utf8');
const imgRegex = /<img src="([^"]+)"/g;
let match;
let activeImages = [];
while ((match = imgRegex.exec(indexHTML)) !== null) {
  activeImages.push(match[1]);
}
activeImages = [...new Set(activeImages)];

const unusedImages = allImages.filter(img => !activeImages.includes(img));

const editorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMS Editor | Miguel Madrigal</title>
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
      gap: 15px; min-height: 200px; background: rgba(255,255,255,0.02);
      border: 2px dashed #333; padding: 15px; border-radius: 8px;
    }
    
    .sortable-item { position: relative; cursor: grab; overflow: hidden; border-radius: 4px; background: #222; }
    .sortable-item img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; pointer-events: none; }
    
    /* Hover Controls */
    .item-controls {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
    }
    .sortable-item:hover .item-controls { opacity: 1; pointer-events: auto; }
    
    .ctrl-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; transition: 0.2s; backdrop-filter: blur(4px); }
    .ctrl-btn:hover { background: #fff; color: #000; }
    
    /* Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: none; padding: 40px; overflow-y: auto;
    }
    .modal-overlay.active { display: block; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-close { background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }
    .modal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    .modal-item { cursor: pointer; transition: 0.2s; border-radius: 4px; overflow: hidden; }
    .modal-item img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }
    .modal-item:hover { transform: scale(1.05); box-shadow: 0 0 0 2px #fff; }
  </style>
</head>
<body>

  <div class="editor-topbar">
    <div class="editor-title">Mini-CMS Editor</div>
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
      <div class="pane-header">Active Portfolio <span class="pane-subtitle">Live on website. Hover for options.</span></div>
      <div class="sortable-grid" id="activeGrid" style="--cols: 5;">
        ${activeImages.map(img => `
        <div class="sortable-item active-item" data-id="${img}">
          <img src="${img}">
          <div class="item-controls">
            <button class="ctrl-btn replace-btn">⇄ Replace</button>
            <button class="ctrl-btn remove-btn">X Remove</button>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div>
      <div class="pane-header" style="color:#888; border-color:#222;">Unused Pool <span class="pane-subtitle">Hover to add to active grid.</span></div>
      <div class="sortable-grid" id="unusedGrid" style="--cols: 8;">
        ${unusedImages.map(img => `
        <div class="sortable-item unused-item" data-id="${img}">
          <img src="${img}">
          <div class="item-controls">
            <button class="ctrl-btn add-btn">+ Add</button>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>
  
  <!-- Replace Modal -->
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
    
    // Sortable JS setup
    new Sortable(activeGrid, { group: 'shared', animation: 150, delay: 50, delayOnTouchOnly: true,
      onAdd: function (evt) { changeItemState(evt.item, 'active'); } 
    });
    new Sortable(unusedGrid, { group: 'shared', animation: 150, delay: 50, delayOnTouchOnly: true,
      onAdd: function (evt) { changeItemState(evt.item, 'unused'); } 
    });
    
    colSlider.addEventListener('input', (e) => {
      activeGrid.style.setProperty('--cols', e.target.value);
    });

    // Helper to swap innerHTML controls when moved between grids
    function changeItemState(itemEl, state) {
      const controls = itemEl.querySelector('.item-controls');
      if (state === 'active') {
        itemEl.classList.remove('unused-item');
        itemEl.classList.add('active-item');
        controls.innerHTML = '<button class="ctrl-btn replace-btn">⇄ Replace</button> <button class="ctrl-btn remove-btn">X Remove</button>';
      } else {
        itemEl.classList.remove('active-item');
        itemEl.classList.add('unused-item');
        controls.innerHTML = '<button class="ctrl-btn add-btn">+ Add</button>';
      }
    }

    // Event Delegation for dynamically changing buttons
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
    
    // Modal Logic
    function openReplaceModal() {
      modalGrid.innerHTML = '';
      const unusedItems = Array.from(unusedGrid.children);
      unusedItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const mItem = document.createElement('div');
        mItem.className = 'modal-item';
        mItem.innerHTML = \`<img src="\${id}">\`;
        mItem.onclick = () => performReplace(id, item);
        modalGrid.appendChild(mItem);
      });
      replaceModal.classList.add('active');
    }
    
    closeModal.onclick = () => replaceModal.classList.remove('active');
    
    function performReplace(newId, unusedEl) {
      if (!targetReplaceItem) return;
      
      // Swap IDs
      const oldId = targetReplaceItem.getAttribute('data-id');
      targetReplaceItem.setAttribute('data-id', newId);
      targetReplaceItem.querySelector('img').src = newId;
      
      unusedEl.setAttribute('data-id', oldId);
      unusedEl.querySelector('img').src = oldId;
      
      replaceModal.classList.remove('active');
    }

    // Export Logic
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
console.log('Successfully built Visual Editor 3.0');
