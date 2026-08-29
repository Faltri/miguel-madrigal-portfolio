const fs = require('fs');
const path = require('path');

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

const editorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMS Editor 6.0 | Miguel Madrigal</title>
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
    
    .nav-controls { display: flex; align-items: center; gap: 15px; }
    .slider-container { display: flex; align-items: center; gap: 10px; color: #ccc; font-size: 0.9rem; margin-right: 15px; }
    
    .btn { background: #333; color: #fff; border: 1px solid #555; padding: 10px 16px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: 0.2s; }
    .btn:hover { background: #555; }
    .export-btn { background: #fff; color: #000; border: none; }
    .export-btn:hover { background: #ccc; }
    
    .panes-container { display: flex; flex-direction: column; gap: 40px; padding: 0 40px 80px; max-width: 1400px; margin: 0 auto; }
    
    .pane-header { font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: flex-end; }
    .pane-subtitle { font-size: 0.9rem; color: #888; font-weight: normal; }
    
    .sortable-grid {
      display: grid;
      grid-template-columns: repeat(var(--cols, 5), 1fr);
      align-items: start;
      gap: 15px; min-height: 200px; background: rgba(255,255,255,0.02);
      border: 2px dashed #333; padding: 15px; border-radius: 8px;
    }
    
    .sortable-item { position: relative; cursor: grab; border-radius: 4px; background: #222; overflow: hidden; transition: 0.2s transform; }
    .sortable-item img { 
      width: 100%; aspect-ratio: 3 / 4; object-fit: cover; display: block; pointer-events: none; 
    }
    
    /* MULTI-DRAG SELECTED STYLING */
    .sortable-selected {
      box-shadow: 0 0 0 4px #00a8ff;
      transform: scale(0.95);
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
    
    /* Modals */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: none; padding: 40px; overflow-y: auto; justify-content: center; align-items: center; }
    .modal-overlay.active { display: flex; flex-direction: column; }
    .modal-content { background: #222; padding: 30px; border-radius: 8px; width: 100%; max-width: 600px; }
    
    /* Replace Modal is special */
    #replaceModal.active { display: block; align-items: flex-start; }
    
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-close { background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }
    .modal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); align-items: start; gap: 15px; }
    .modal-item { cursor: pointer; transition: 0.2s; border-radius: 4px; overflow: hidden; position: relative; }
    .modal-item img { width: 100%; height: auto; display: block; }
    .modal-item:hover { transform: scale(1.05); box-shadow: 0 0 0 2px #fff; z-index: 10; }
    
    /* Versioning Modal */
    .version-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; }
    .version-row { display: flex; justify-content: space-between; align-items: center; background: #333; padding: 15px; border-radius: 4px; cursor: pointer; }
    .version-row:hover { background: #444; }
    .version-info { display: flex; flex-direction: column; }
    .version-name { font-weight: bold; font-size: 1.1rem; }
    .version-meta { font-size: 0.8rem; color: #aaa; }
    .version-actions { display: flex; gap: 10px; }
    .del-btn { background: #d32f2f; color: #fff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; }
    
    .save-input { width: 100%; padding: 10px; font-size: 1rem; margin-bottom: 20px; background: #111; color: #fff; border: 1px solid #555; border-radius: 4px; }
  </style>
</head>
<body>

  <div class="editor-topbar">
    <div class="editor-title">Editor 6.0: Local Storage Versions</div>
    <div class="nav-controls">
      <div class="slider-container">
        <span>Columns:</span>
        <input type="range" id="colSlider" min="2" max="8" value="5">
      </div>
      <button class="btn" id="btnLoadVersions">Load</button>
      <button class="btn" id="btnSaveVersion">Save</button>
      <button class="export-btn" id="exportBtn">Export Curation</button>
    </div>
  </div>

  <div class="panes-container">
    <div>
      <div class="pane-header">Active Portfolio <span class="pane-subtitle">Cmd/Ctrl+Click to multi-select. Shift+Click for row select.</span></div>
      <div class="sortable-grid" id="activeGrid" style="--cols: 5;">
        ${activeImages.map(img => buildItem(img)).join('')}
      </div>
    </div>

    <div>
      <div class="pane-header" style="color:#888; border-color:#222;">Unused Pool <span class="pane-subtitle" id="unusedCount">${unusedImages.length} available photos.</span></div>
      <div class="sortable-grid" id="unusedGrid" style="--cols: 8;">
        ${unusedImages.map(img => buildItem(img)).join('')}
      </div>
    </div>
  </div>
  
  <div class="modal-overlay" id="replaceModal">
    <div class="modal-header">
      <h2>Select photo to swap in:</h2>
      <button class="modal-close" onclick="closeModals()">&times;</button>
    </div>
    <div class="modal-grid" id="modalGrid"></div>
  </div>

  <div class="modal-overlay" id="saveModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Save Layout Version</h2>
        <button class="modal-close" onclick="closeModals()">&times;</button>
      </div>
      <input type="text" id="saveNameInput" class="save-input" placeholder="e.g. Summer Edit 1" />
      <button class="btn export-btn" style="width:100%" onclick="executeSave()">Save to Browser</button>
    </div>
  </div>
  
  <div class="modal-overlay" id="loadModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Load Saved Layout</h2>
        <button class="modal-close" onclick="closeModals()">&times;</button>
      </div>
      <div class="version-list" id="versionList">
        <!-- populated dynamically -->
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
  <script>
    const activeGrid = document.getElementById('activeGrid');
    const unusedGrid = document.getElementById('unusedGrid');
    const colSlider = document.getElementById('colSlider');
    const replaceModal = document.getElementById('replaceModal');
    const modalGrid = document.getElementById('modalGrid');
    const unusedCount = document.getElementById('unusedCount');
    let targetReplaceItem = null;
    
    // Sortable JS setup WITH MULTIDRAG
    const sortableConfig = { 
      group: 'shared', 
      animation: 150, 
      delay: 50, 
      delayOnTouchOnly: true,
      multiDrag: true, 
      selectedClass: 'sortable-selected', 
      fallbackTolerance: 3, 
      onAdd: function (evt) { 
        changeItemState(evt.item, 'active'); 
        updateUnusedCount();
      },
      onRemove: function() {
        updateUnusedCount();
      }
    };

    new Sortable(activeGrid, sortableConfig);
    new Sortable(unusedGrid, Object.assign({}, sortableConfig, { 
      onAdd: function (evt) { changeItemState(evt.item, 'unused'); updateUnusedCount(); } 
    }));
    
    colSlider.addEventListener('input', (e) => {
      activeGrid.style.setProperty('--cols', e.target.value);
    });

    // Setup initial controls
    Array.from(activeGrid.children).forEach(el => changeItemState(el, 'active'));
    Array.from(unusedGrid.children).forEach(el => changeItemState(el, 'unused'));

    function changeItemState(itemEl, state) {
      const controls = itemEl.querySelector('.item-controls');
      if (!controls) return;
      if (state === 'active') {
        controls.innerHTML = '<button class="ctrl-btn replace-btn">⇄ Replace</button> <button class="ctrl-btn remove-btn">X Remove</button>';
      } else {
        controls.innerHTML = '<button class="ctrl-btn add-btn">+ Add</button>';
      }
    }
    
    function updateUnusedCount() {
      unusedCount.innerText = unusedGrid.children.length + " available photos.";
    }

    // Event Delegation
    document.body.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.sortable-item');
      if (!itemEl) return;
      
      if (e.target.classList.contains('remove-btn')) {
        changeItemState(itemEl, 'unused');
        unusedGrid.appendChild(itemEl);
        updateUnusedCount();
      } 
      else if (e.target.classList.contains('add-btn')) {
        changeItemState(itemEl, 'active');
        activeGrid.appendChild(itemEl);
        updateUnusedCount();
      }
      else if (e.target.classList.contains('replace-btn')) {
        targetReplaceItem = itemEl;
        openReplaceModal();
      }
    });
    
    // Modal Helpers
    function closeModals() {
      document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
    }
    
    // Replace Modal
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
      document.getElementById('replaceModal').classList.add('active');
    }
    
    function performReplace(newId, unusedEl) {
      if (!targetReplaceItem) return;
      const oldId = targetReplaceItem.getAttribute('data-id');
      targetReplaceItem.setAttribute('data-id', newId);
      targetReplaceItem.querySelector('img').src = newId;
      unusedEl.setAttribute('data-id', oldId);
      unusedEl.querySelector('img').src = oldId;
      closeModals();
    }

    // Export
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', () => {
      const activeIds = getActiveArray();
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
    
    // -----------------------------------------------------
    // EDITOR 6.0: LOCAL STORAGE VERSIONING
    // -----------------------------------------------------
    function getActiveArray() {
      return Array.from(activeGrid.children).map(el => el.getAttribute('data-id'));
    }
    
    document.getElementById('btnSaveVersion').onclick = () => {
      document.getElementById('saveModal').classList.add('active');
      document.getElementById('saveNameInput').focus();
    };
    
    function executeSave() {
      const name = document.getElementById('saveNameInput').value.trim() || 'Untitled Layout';
      const array = getActiveArray();
      
      const history = JSON.parse(localStorage.getItem('mm_editor_history') || '[]');
      history.unshift({
        id: Date.now().toString(),
        name: name,
        date: new Date().toLocaleString(),
        count: array.length,
        layout: array
      });
      
      localStorage.setItem('mm_editor_history', JSON.stringify(history));
      closeModals();
      document.getElementById('saveNameInput').value = '';
      alert('Layout successfully saved to your browser!');
    }
    
    document.getElementById('btnLoadVersions').onclick = () => {
      const history = JSON.parse(localStorage.getItem('mm_editor_history') || '[]');
      const listEl = document.getElementById('versionList');
      listEl.innerHTML = '';
      
      if(history.length === 0) {
        listEl.innerHTML = '<p style="color:#888; text-align:center;">No saved layouts found.</p>';
      } else {
        history.forEach(ver => {
          const row = document.createElement('div');
          row.className = 'version-row';
          row.innerHTML = \`
            <div class="version-info" onclick="loadVersion('\${ver.id}')">
              <span class="version-name">\${ver.name}</span>
              <span class="version-meta">\${ver.date} • \${ver.count} photos</span>
            </div>
            <div class="version-actions">
              <button class="del-btn" onclick="deleteVersion('\${ver.id}', event)">Delete</button>
            </div>
          \`;
          listEl.appendChild(row);
        });
      }
      
      document.getElementById('loadModal').classList.add('active');
    };
    
    function deleteVersion(id, evt) {
      evt.stopPropagation();
      let history = JSON.parse(localStorage.getItem('mm_editor_history') || '[]');
      history = history.filter(v => v.id !== id);
      localStorage.setItem('mm_editor_history', JSON.stringify(history));
      document.getElementById('btnLoadVersions').click(); // refresh list
    }
    
    window.loadVersion = function(id) {
      if(!confirm('Are you sure? This will overwrite your current active grid with the saved version.')) return;
      
      const history = JSON.parse(localStorage.getItem('mm_editor_history') || '[]');
      const ver = history.find(v => v.id === id);
      if(!ver) return;
      
      // 1. Gather ALL sortable items from both grids
      const allItems = Array.from(activeGrid.children).concat(Array.from(unusedGrid.children));
      
      // 2. Clear both grids
      activeGrid.innerHTML = '';
      unusedGrid.innerHTML = '';
      
      // 3. Rebuild based on saved layout array
      const layoutSet = new Set(ver.layout);
      
      // Add items to Active Grid in the exact order of the saved layout
      ver.layout.forEach(savedImgId => {
        const itemEl = allItems.find(el => el.getAttribute('data-id') === savedImgId);
        if(itemEl) {
          changeItemState(itemEl, 'active');
          activeGrid.appendChild(itemEl);
        }
      });
      
      // Add all remaining items to Unused Grid
      allItems.forEach(itemEl => {
        if(!layoutSet.has(itemEl.getAttribute('data-id'))) {
          changeItemState(itemEl, 'unused');
          unusedGrid.appendChild(itemEl);
        }
      });
      
      updateUnusedCount();
      closeModals();
    };

  </script>
</body>
</html>`;

fs.writeFileSync('editor.html', editorHTML);
console.log('Successfully built Visual Editor 6.0 with LocalStorage Versioning');
